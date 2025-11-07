import '../styles/AuthModal.css';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  onSignup: () => void;
}

export default function AuthModal({ isOpen, onClose, onLogin, onSignup }: AuthModalProps) {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="auth-modal-backdrop" onClick={handleBackdropClick}>
      <div className="auth-modal">
        <button className="modal-close-btn" onClick={onClose}>
          ×
        </button>
        
        <div className="modal-content">
          <div className="modal-icon">🔐</div>
          <h2>Authentication Required</h2>
          <p>You need to be registered and logged in to submit reports to the municipality.</p>
          
          <div className="modal-buttons">
            <button 
              onClick={onLogin}
              className="modal-btn login-modal-btn"
            >
              Login
            </button>
            <button 
              onClick={onSignup}
              className="modal-btn signup-modal-btn"
            >
              Sign Up
            </button>
          </div>
          
          <p className="modal-footer">
            Don't have an account? <button onClick={onSignup} className="link-modal-btn">Create one here</button>
          </p>
        </div>
      </div>
    </div>
  );
}