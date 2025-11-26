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
              <ReportCard report={report} />
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}
