import { useNavigate } from "react-router-dom";
import "./BackButton.css";

function BackButton() {
  const navigate = useNavigate();

  return (
    <div className="backButtonWrapper">
      <button className="backButton" onClick={() => navigate("/")} aria-label="Back to dashboard">
        ← Back to Dashboard
      </button>
    </div>
  );
}

export default BackButton;
