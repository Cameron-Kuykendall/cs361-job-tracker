import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import BackButton from "../components/BackButton/BackButton";
import "./pagesstyles/NewApplication.css";
import initialApplications from "../data/applications";

function NewApplication() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    company: "",
    position: "",
    date: "",
    status: "Applied",
    notes: "",
  });

  const [error, setError] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));
  };

  const handleSave = () => {
    setError("");

    if (
      !formData.company.trim() ||
      !formData.position.trim() ||
      !formData.date
    ) {
      setError("Please fill out company, position, and date.");
      return;
    }

    try {
      const savedApplications = localStorage.getItem("applications");

      const currentApplications = savedApplications
        ? JSON.parse(savedApplications)
        : initialApplications;

      const newApplication = {
        id: Date.now(),
        company: formData.company.trim(),
        position: formData.position.trim(),
        date: formData.date,
        status: formData.status,
        notes: formData.notes.trim(),
      };

      const updatedApplications = [
        ...currentApplications,
        newApplication,
      ];

      localStorage.setItem(
        "applications",
        JSON.stringify(updatedApplications)
      );

      navigate("/applications");
    } catch (error) {
      console.error("Could not save application:", error);
      setError("The application could not be saved.");
    }
  };

  return (
    <>
      <Navbar />
      <BackButton />

      <main className="newApplication">
        <h1>New Application</h1>

        <p className="subtitle">
          Fill out the details below to add a new job application.
        </p>

        <p className="requiredNote">
          <span className="requiredStar">*</span>
          Required fields
        </p>

        <div className="applicationCard">
          {error && <p className="formError">{error}</p>}

          <div className="formGrid">
            <div className="formGroup">
              <label htmlFor="company">
                Company <span className="requiredStar">*</span>
              </label>

              <input
                id="company"
                name="company"
                type="text"
                value={formData.company}
                onChange={handleChange}
              />
            </div>

            <div className="formGroup">
              <label htmlFor="position">
                Position <span className="requiredStar">*</span>
              </label>

              <input
                id="position"
                name="position"
                type="text"
                value={formData.position}
                onChange={handleChange}
              />
            </div>

            <div className="formGroup">
              <label htmlFor="date">
                Date Applied <span className="requiredStar">*</span>
              </label>

              <input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
              />
            </div>

            <div className="formGroup">
              <label htmlFor="status">
                Status <span className="requiredStar">*</span>
              </label>

              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="Applied">Applied</option>
                <option value="Interview">Interview</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="formGroup">
            <label htmlFor="notes">Notes</label>

            <textarea
              id="notes"
              name="notes"
              rows="5"
              value={formData.notes}
              onChange={handleChange}
            />
          </div>

          <div className="buttonRow">
            <button
              type="button"
              className="cancelButton"
              onClick={() => navigate("/applications")}
            >
              Cancel
            </button>

            <button
              type="button"
              className="saveButton"
              onClick={handleSave}
            >
              Save Application
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

export default NewApplication;
