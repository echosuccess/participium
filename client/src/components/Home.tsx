import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { Clipboard, Pencil } from "react-bootstrap-icons";
import AuthModal from "./AuthModal";
import "../styles/Home.css";
import MapView from "./MapView";
import { useAuth } from "../hooks/useAuth";

export default function Home() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user?.role === "ADMINISTRATOR") {
      navigate("/admin", { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleAddReport = () => {
    setShowAuthModal(true);
  };

  const handleModalLogin = () => {
    setShowAuthModal(false);
    navigate("/login");
  };

  const handleModalSignup = () => {
    setShowAuthModal(false);
    navigate("/signup");
  };

  const handleCloseModal = () => {
    setShowAuthModal(false);
  };

  return (
    <>
      <div className="home-container">
        <main className="main-content">
          <div className="map-section">
            <div className="map-placeholder">
              <div className="map-header">
                <h2>Interactive Map</h2>
                <p>Municipality territory view</p>
              </div>
              <div className="map-content">
                <MapView />
              </div>
            </div>
          </div>

          <div className="reports-section">
            <div className="reports-header">
              <h3>Recent Reports</h3>
              <span className="reports-count">0</span>
            </div>

            <div className="reports-content">
              <div className="reports-placeholder">
                <div className="placeholder-icon">
                  <Clipboard />
                </div>
                <p>No reports yet</p>
                <small>
                  Reports will appear here once submitted by citizens.
                </small>
              </div>
            </div>

            <div className="add-report-section">
              <button onClick={handleAddReport} className="add-report-btn">
                <span className="btn-icon">
                  <Pencil />
                </span>
                Add New Report
              </button>

              {!isAuthenticated && (
                <p className="auth-reminder">
                  <small>
                    You need to{" "}
                    <button
                      onClick={() => navigate("/login")}
                      className="link-btn"
                    >
                      login
                    </button>{" "}
                    or{" "}
                    <button
                      onClick={() => navigate("/signup")}
                      className="link-btn"
                    >
                      sign up
                    </button>{" "}
                    to submit reports
                  </small>
                </p>
              )}
            </div>
          </div>
        </main>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        isAuthenticated={isAuthenticated}
        onClose={handleCloseModal}
        onLogin={handleModalLogin}
        onSignup={handleModalSignup}
      />
    </>
  );
}
