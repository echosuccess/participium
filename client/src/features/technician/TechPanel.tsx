import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Container, Row, Col, Modal, Form } from "react-bootstrap";
import { CheckCircle, XCircle, FileText } from "react-bootstrap-icons"; 
import { useAuth } from "../../hooks";
import Button from "../../components/ui/Button";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import { 
  getReports, 
  getPendingReports, 
  rejectReport, 
  getAssignableTechnicals,
  approveReport, 
  getAssignedReports,
  createInternalNote,
  getInternalNotes,
} from "../../api/api"; 
import type { Report as AppReport, InternalNote } from "../../types/report.types";
import ReportCard from "../reports/ReportCard";
import "../../styles/TechPanelstyle.css";

const ALLOWED_ROLES = [
  "PUBLIC_RELATIONS",
  "CULTURE_EVENTS_TOURISM_SPORTS",
  "LOCAL_PUBLIC_SERVICES",
  "EDUCATION_SERVICES",
  "PUBLIC_RESIDENTIAL_HOUSING",
  "INFORMATION_SYSTEMS",
  "MUNICIPAL_BUILDING_MAINTENANCE",
  "PRIVATE_BUILDINGS",
  "INFRASTRUCTURES",
  "GREENSPACES_AND_ANIMAL_PROTECTION",
  "WASTE_MANAGEMENT",
  "ROAD_MAINTENANCE",
  "CIVIL_PROTECTION"
];

export default function TechPanel() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [reports, setReports] = useState<AppReport[]>([]);
  const [pendingReports, setPendingReports] = useState<AppReport[]>([]);
  const [otherReports, setOtherReports] = useState<AppReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showInternalNoteModal, setShowInternalNoteModal] = useState(false);

  const [assignableTechnicals, setAssignableTechnicals] = useState<any[]>([]);
  const [selectedTechnicalId, setSelectedTechnicalId] = useState<number | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<number | null>(null);

  const [rejectionReason, setRejectionReason] = useState("");
  const [internalNoteContent, setInternalNoteContent] = useState("");

  const [internalNotes, setInternalNotes] = useState<InternalNote[]>([]);
  const [loadingNotes, setLoadingNotes] = useState(false);

  const [processingId, setProcessingId] = useState<number | null>(null);

  const isPublicRelations = user?.role === "PUBLIC_RELATIONS";

  useEffect(() => {
    if (!isAuthenticated || (user?.role  && !ALLOWED_ROLES.includes(user.role))) { 
      navigate("/"); 
    }
    fetchReports();
  }, [isAuthenticated, user, navigate]); 

  console.log("user auth", user)

  const fetchReports = async () => {
    try {
      setLoading(true);
      if (isPublicRelations) {
        // Public Relations: fetch both pending and other reports
        const pendingData = (await getPendingReports()) as AppReport[];
        const otherData = (await getReports()) as AppReport[];

        const pendingNormalized = (pendingData || []).map((r: any) => ({
          ...r,
          latitude: Number(r.latitude),
          longitude: Number(r.longitude),
        }));

        const otherNormalized = (otherData || []).map((r: any) => ({
          ...r,
          latitude: Number(r.latitude),
          longitude: Number(r.longitude),
        }));

        setPendingReports(pendingNormalized);
        setOtherReports(otherNormalized);
      } else {
        const data = (await getAssignedReports()) as AppReport[];
        
        const normalized = (data || []).map((r: any) => ({
          ...r,
          latitude: Number(r.latitude),
          longitude: Number(r.longitude),
        }));
        setReports(normalized);
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError("Failed to load reports.");
    } finally {
      setLoading(false);
    }
  };

  const openAssignModal = async (id: number) => {
    try {
      setProcessingId(id);
      const list = await getAssignableTechnicals(id);
      setAssignableTechnicals(list || []);
      setSelectedReportId(id);
      // preselect first technical if available
      setSelectedTechnicalId(list && list.length > 0 ? list[0].id : null);
      setShowAssignModal(true);
    } catch (err) {
      console.error('Failed to fetch assignable technicals', err);
      alert('Failed to fetch assignable technicals');
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirmAssign = async () => {
    if (!selectedReportId || !selectedTechnicalId) return;
    try {
      setProcessingId(selectedReportId);
      const res = await approveReport(selectedReportId, selectedTechnicalId);
      // API returns { message, report }
      const updatedReport = res && res.report ? res.report : null;
      if (updatedReport) {
        const normalized = {
          ...updatedReport,
          latitude: Number((updatedReport as any).latitude),
          longitude: Number((updatedReport as any).longitude),
        } as AppReport;
        // remove from pending and add to otherReports (top)
        setPendingReports((prev) => prev.filter((r) => r.id !== selectedReportId));
        setOtherReports((prev) => [normalized, ...(prev || [])]);
      }
      setShowAssignModal(false);
    } catch (err) {
      console.error('Failed to approve report', err);
      alert((err as any)?.message || 'Failed to approve report');
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectModal = (id: number) => {
    setSelectedReportId(id);
    setRejectionReason("");
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    if (!selectedReportId || !rejectionReason.trim()) return;

    try {
      setProcessingId(selectedReportId);
      const res = await rejectReport(selectedReportId, rejectionReason);
      const updatedReport = res && res.report ? res.report : null;
      if (updatedReport) {
        const normalized = {
          ...updatedReport,
          latitude: Number((updatedReport as any).latitude),
          longitude: Number((updatedReport as any).longitude),
        } as AppReport;
        setPendingReports((prev) => prev.filter((r) => r.id !== selectedReportId));
        setOtherReports((prev) => [normalized, ...(prev || [])]);
      }
      setShowRejectModal(false);
    } catch (err) {
      console.error('Failed to reject report', err);
      alert((err as any)?.message || 'Failed to reject report');
    } finally {
      setProcessingId(null);
    }
  };

  const openNoteModal = async (id: number) => {
    setSelectedReportId(id);
    setInternalNoteContent("");
    setInternalNotes([]);
    setShowInternalNoteModal(true);

    try {
      setLoadingNotes(true);
      const notes = await getInternalNotes(id);
      setInternalNotes(notes);
    } catch (e) {
      console.error("Failed to fetch internal notes", e);
    } finally {
      setLoadingNotes(false);
    }
  }

  const handleInternalNoteSubmit = async () =>{
    if (!selectedReportId || !internalNoteContent.trim()) return;

    try{
      setProcessingId(selectedReportId);
       await createInternalNote(selectedReportId, {
        reportId: selectedReportId,
        content: internalNoteContent,
        authorId: user!.id,
      });

      alert("Internal note created successfully");
      setShowInternalNoteModal(false);
    }catch(e){
      console.error("Failed to create internal note", e);
      alert("Failed to create internal note");
    }finally{
      setProcessingId(null);
    }
  }
  

  const formatDate = (dateString: Date | string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString();
  };
  

  // statusVariant is now implemented in ReportCard; TechPanel no longer needs it

  if (loading) return <div className="loading-container"><LoadingSpinner /></div>;

  return (
    <Container className="py-4 tech-panel-container">
      <div className="mb-4">
        <h2 className="tech-panel-title">Reports Management</h2>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {isPublicRelations ? (
        <>
          {/* Top: all non-pending reports shown as cards side-by-side */}
          <div className="mb-4">
            <h4>All Reports</h4>
            {otherReports.length === 0 ? (
              <p className="text-muted">No non-pending reports available.</p>
            ) : (
              <Row>
                {otherReports.map((report) => (
                  <Col key={report.id} lg={4} md={6} className="mb-3">
                    <ReportCard report={report} />
                  </Col>
                ))}
              </Row>
            )}
          </div>

          {/* Bottom: pending reports with actions */}
          <div>
            <h4>Pending Reports</h4>
            {pendingReports.length === 0 ? (
              <p className="text-muted">No pending reports.</p>
            ) : (
                <Row>
                  {pendingReports.map((report) => (
                    <Col key={report.id} lg={6} xl={4} className="mb-4">
                      <div className="h-100 shadow-sm report-card d-flex flex-column">
                        <ReportCard report={report} />
                        <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid #f3f4f6', marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
                          <Button variant="danger" className="flex-fill d-flex align-items-center justify-content-center" onClick={() => openRejectModal(report.id)} disabled={processingId === report.id}><XCircle className="me-2" /> Reject</Button>
                          <Button variant="primary" className="flex-fill d-flex align-items-center justify-content-center" onClick={() => openAssignModal(report.id)} disabled={processingId === report.id} isLoading={processingId === report.id}><CheckCircle className="me-2" /> Accept</Button>
                        </div>
                      </div>
                    </Col>
                  ))}
                </Row>
            )}
          </div>
        </>
      ) : (
        // Non-PR users: keep existing single list behavior
        (reports.length === 0 && !error) ? (
          <div className="empty-state">
            <h4>No reports found</h4>
            <p>No active reports assigned to you.</p>
          </div>
        ) : (
          <Row>
            {reports.map((report) => (
              <Col key={report.id} lg={6} xl={4} className="mb-4">
                <ReportCard report={report} />
                <Button 
                  variant="primary" 
                  className="mt-2 w-100 d-flex align-items-center justify-content-center"
                  onClick={() => openNoteModal(report.id)}
                  disabled={processingId === report.id}
                  >
                  <FileText className="me-2" /> Internal Notes
                </Button>
              </Col>
            ))}
          </Row>
        )
      )}

      {/* rejection */}
      <Modal show={showRejectModal} onHide={() => setShowRejectModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Reject Report</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Please provide a reason for rejecting this report. This will be visible to the citizen.</p>
          <Form.Group>
            <Form.Label>Reason for Rejection *</Form.Label>
            <Form.Control 
              as="textarea" 
              rows={4} 
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="E.g., Duplicate report, private property, insufficient information..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowRejectModal(false)}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={handleRejectConfirm}
            disabled={!rejectionReason.trim() || processingId !== null}
            isLoading={processingId === selectedReportId}
          >
            Confirm Rejection
          </Button>
        </Modal.Footer>
      </Modal>
      {/* assign modal */}
      <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Assign Report</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Select a technical user to assign this report to:</p>
          <Form.Group>
            <Form.Select value={selectedTechnicalId ?? ""} onChange={(e) => setSelectedTechnicalId(Number(e.target.value))}>
              <option value="">-- Select technical --</option>
              {assignableTechnicals.map((t) => (
                <option key={t.id} value={t.id}>{t.first_name} {t.last_name} ({t.role})</option>
              ))}
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAssignModal(false)}>Cancel</Button>
          <Button variant="primary" onClick={handleConfirmAssign} disabled={!selectedTechnicalId} isLoading={processingId !== null}>
            Confirm Assignment
          </Button>
        </Modal.Footer>
      </Modal>


      {/* internal note modal */}
      <Modal show={showInternalNoteModal} onHide={() => setShowInternalNoteModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Internal Notes</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-4">
            <h6 className="mb-3">History</h6>
            {loadingNotes ? (
              <div className="text-center py-3"><LoadingSpinner /></div>
            ) : internalNotes.length === 0 ? (
              <p className="text-muted small fst-italic">No internal notes found for this report.</p>
            ) : (
              <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #dee2e6', borderRadius: '4px', padding: '10px', backgroundColor: '#f8f9fa' }}>
                {internalNotes.map((note) => (
                  <div key={note.id} className="mb-3 pb-3 border-bottom last-child-no-border">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <strong>{note.authorName} <span className="text-muted" style={{ fontSize: '0.85em', fontWeight: 'normal' }}>({note.authorRole})</span></strong>
                      <span className="text-muted small" style={{ fontSize: '0.8em' }}>{formatDate(note.createdAt)}</span>
                    </div>
                    <p className="mb-0 small" style={{ whiteSpace: 'pre-wrap' }}>{note.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <hr />

          <h6 className="mb-3">Add New Note</h6>
          <p className="text-muted small">
            This note will be visible to other technicians and admins, but <strong>not</strong> to the citizen.
          </p>
          <Form.Group>
            <Form.Label>Note Content *</Form.Label>
            <Form.Control 
              as="textarea"
              rows={3}
              value={internalNoteContent}
              onChange={(e) => setInternalNoteContent(e.target.value)}
              placeholder="Enter internal note content here..."
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowInternalNoteModal(false)}>Close</Button>
          <Button variant="primary" onClick={handleInternalNoteSubmit} disabled={!internalNoteContent.trim() || processingId !== null} isLoading={processingId !== null}>
            Save Note
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
