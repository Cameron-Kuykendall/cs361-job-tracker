import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import BackButton from "../components/BackButton/BackButton";
import "./pagesstyles/NewApplication.css";
import initialApplications from "../data/applications";

function formatDateForInput(dateString) {
  if (!dateString) {
    return "";
  }

  // Already formatted correctly for an HTML date input
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return dateString;
  }

  const parsedDate = new Date(dateString);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  const year = parsedDate.getFullYear();
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const day = String(parsedDate.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getApplications() {
  try {
    const savedApplications = localStorage.getItem("applications");

    return savedApplications
      ? JSON.parse(savedApplications)
      : initialApplications;
  } catch (error) {
    console.error("Could not load applications:", error);
    return initialApplications;
  }
}

function EditApplication() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [applications] = useState(getApplications);

  const applicationToEdit = applications.find(
    (application) => String(application.id) === String(id)
  );

  const [formData, setFormData] = useState(() => ({
    company: applicationToEdit?.company || "",
    position: applicationToEdit?.position || "",
    date: formatDateForInput(applicationToEdit?.date),
    status: applicationToEdit?.status || "Applied",
    notes: applicationToEdit?.notes || "",
  }));

  const [error, setError] = useState(
    applicationToEdit ? "" : "Application not found."
  );

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
      const currentApplications = getApplications();

      const updatedApplications = currentApplications.map((application) => {
        if (String(application.id) !== String(id)) {
          return application;
        }

        return {
          ...application,
          company: formData.company.trim(),
          position: formData.position.trim(),
          date: formData.date,
          status: formData.status,
          notes: formData.notes.trim(),
        };
      });

      localStorage.setItem(
        "applications",
        JSON.stringify(updatedApplications)
      );

      navigate("/applications");
    } catch (saveError) {
      console.error("Could not update application:", saveError);
      setError("The application could not be updated.");
    }
  };

  return (
    <>
      <Navbar />
      <BackButton />

      <main className="newApplication">
        <h1>Edit Application</h1>

        <p className="subtitle">
          Update the details for this job application.
        </p>

        <p className="requiredNote">
          <span className="requiredStar">*</span>
          Required fields
        </p>

        <div className="applicationCard">
          {error && <p className="formError">{error}</p>}

          {applicationToEdit && (
            <>
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
            </>
          )}

          <div className="buttonRow">
            <button
              type="button"
              className="cancelButton"
              onClick={() => navigate("/applications")}
            >
              Cancel
            </button>

            {applicationToEdit && (
              <button
                type="button"
                className="saveButton"
                onClick={handleSave}
              >
                Save Changes
              </button>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default EditApplication;
