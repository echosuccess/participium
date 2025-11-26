import { useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ReportCard from '../reports/ReportCard';
import { useAuth } from '../../hooks';
import { getAssignedReports } from '../../api/api';
import type { Report as AppReport } from '../../types/report.types';
import { TECHNICAL_ROLES } from '../../utils/roles';

export default function TechDashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [reports, setReports] = useState<AppReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    // Only allow technical roles
    if (!user || !TECHNICAL_ROLES.includes(user.role)) {
      navigate('/');
      return;
    }
    fetchAssigned();
  }, [isAuthenticated, user, navigate]);

  const fetchAssigned = async () => {
    try {
      setLoading(true);
      const data = await getAssignedReports();
      const normalized = (data || []).map((r: any) => ({ ...r, latitude: Number(r.latitude), longitude: Number(r.longitude) }));
      setReports(normalized as AppReport[]);
    } catch (err) {
      console.error('Failed to fetch assigned reports', err);
      setError('Failed to load assigned reports');
    } finally {
      setLoading(false);
    }
  };

  // Merge updated report into current list so it remains visible after status changes
  const handleStatusUpdated = async (updatedReport?: any) => {
    if (!updatedReport) {
      // fallback to full refresh
      await fetchAssigned();
      return;
    }
    try {
      setLoading(true);
      // normalize coordinates
      const normalized = {
        ...updatedReport,
        latitude: Number((updatedReport as any).latitude),
        longitude: Number((updatedReport as any).longitude),
      } as AppReport;

      // If the updated report is still assigned to this user, ensure it's present/updated
      if ((normalized as any).assignedToId === (user as any)?.id) {
        setReports((prev) => {
          const exists = prev.find((r) => r.id === normalized.id);
          if (exists) {
            return prev.map((r) => (r.id === normalized.id ? normalized : r));
          }
          // add to the top so technician sees it immediately
          return [normalized, ...(prev || [])];
        });
      } else {
        // otherwise remove it from the list
        setReports((prev) => (prev || []).filter((r) => r.id !== normalized.id));
      }
    } catch (err) {
      console.error('Failed to merge updated report', err);
      // On error, fallback to a full refresh
      await fetchAssigned();
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading-container"><LoadingSpinner /></div>;

  return (
    <Container className="py-4">
      <div className="mb-4">
        <h2>Assigned Reports</h2>
        <p className="text-muted">Reports assigned to you. Use the card controls to update status or add messages.</p>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {reports.length === 0 ? (
        <div className="empty-state">
          <h5>No reports assigned to you</h5>
          <p className="text-muted">You will see reports here once a public relations officer assigns them.</p>
        </div>
      ) : (
        <Row>
          {reports.map((report) => (
              <Col key={report.id} lg={6} xl={4} className="mb-4">
              <ReportCard report={report} onStatusUpdated={handleStatusUpdated} />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}
