import { useState } from 'react';
import { Modal, Form } from 'react-bootstrap';
import Button from './ui/Button';
import { updateReportStatus } from '../api/api';
import { useAuth } from '../hooks';
import { TECHNICAL_ROLES } from '../utils/roles';

type Props = {
  reportId: number;
};

export default function UpdateStatusForm({ reportId }: Props) {
  const { user } = useAuth();
  const [show, setShow] = useState(false);
  const [status, setStatus] = useState<string>('IN_PROGRESS');
  const [reason, setReason] = useState('');
  const [busy, setBusy] = useState(false);

  // Only users in technical roles (municipality staff) can update statuses
  const role = user?.role ?? '';
  if (!user || !TECHNICAL_ROLES.includes(role)) return null;

  const open = () => setShow(true);
  const close = () => setShow(false);

  const handleSubmit = async () => {
    try {
      setBusy(true);
      await updateReportStatus(reportId, status, status === 'REJECTED' ? reason : undefined);
      // Refresh to reflect changes in lists; parent apps may replace this with a better refresh
      window.location.reload();
    } catch (err) {
      alert((err as any)?.message || 'Failed to update status');
    } finally {
      setBusy(false);
      close();
    }
  };

  return (
    <>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button variant="secondary" onClick={open}>Update Status</Button>
      </div>

      <Modal show={show} onHide={close} centered>
        <Modal.Header closeButton>
          <Modal.Title>Update Report Status</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="IN_PROGRESS">IN_PROGRESS</option>
              <option value="SUSPENDED">SUSPENDED</option>
              <option value="RESOLVED">RESOLVED</option>
            </Form.Select>
          </Form.Group>

          {status === 'REJECTED' && (
            <Form.Group>
              <Form.Label>Rejection reason</Form.Label>
              <Form.Control as="textarea" rows={4} value={reason} onChange={(e) => setReason(e.target.value)} />
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={close}>Cancel</Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={busy} disabled={busy || (status === 'REJECTED' && !reason.trim())}>
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
