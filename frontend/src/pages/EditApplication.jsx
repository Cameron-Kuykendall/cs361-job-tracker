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

    return savedApplications ? JSON.parse(savedApplications) : initialApplications;
  } catch (error) {
    console.error("Could not load applications:", error);
    return initialApplications;
  }
}

function EditApplication() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [applications] = useState(getApplications);

  const applicationToEdit = applications.find((application) => String(application.id) === String(id));

  const [formData, setFormData] = useState(() => ({
    company: applicationToEdit?.company || "",
    position: applicationToEdit?.position || "",
    date: formatDateForInput(applicationToEdit?.date),
    start_time: applicationToEdit?.start_time || "",
    end_time: applicationToEdit?.end_time || "",
    status: applicationToEdit?.status || "Applied",
    notes: applicationToEdit?.notes || "",
  }));

  const [error, setError] = useState(applicationToEdit ? "" : "Application not found.");

  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState("");
  const [inviteUrl, setInviteUrl] = useState("");
  const [notifyLoading, setNotifyLoading] = useState(false);
  const [notifyError, setNotifyError] = useState("");
  const [notifySuccess, setNotifySuccess] = useState("");
  const [recipient, setRecipient] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((currentFormData) => ({
      ...currentFormData,
      [name]: value,
    }));
  };

  const handleSave = () => {
    setError("");

    if (!formData.company.trim() || !formData.position.trim() || !formData.date) {
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
          start_time: formData.start_time || application.start_time || "",
          end_time: formData.end_time || application.end_time || "",
        };
      });

      localStorage.setItem("applications", JSON.stringify(updatedApplications));

      navigate("/applications");
    } catch (saveError) {
      console.error("Could not update application:", saveError);
      setError("The application could not be updated.");
    }
  };

  const handleGenerateInvite = async () => {
    setInviteError("");
    setInviteUrl("");

    if (!applicationToEdit) return;

    // Use application fields to compose the invite
    const company = formData.company || applicationToEdit.company || "";
    const position = formData.position || applicationToEdit.position || "";
    const date = formData.date || applicationToEdit.date || ""; // YYYY-MM-DD

    if (!date) {
      setInviteError("Application must have a date to create an invite.");
      return;
    }

    // Use stored times if present, otherwise default to 14:00-15:00
    const start_time = formData.start_time || applicationToEdit.start_time || "14:00";
    const end_time = formData.end_time || applicationToEdit.end_time || "15:00";

    const start_datetime = `${date}T${start_time}:00`;
    const end_datetime = `${date}T${end_time}:00`;

    const title = `${company} - ${position} Interview`;
    const location = applicationToEdit.address || applicationToEdit.map_url || "Online";
    const description = applicationToEdit.notes || "";

    const body = {
      title,
      start_datetime,
      end_datetime,
      location,
      description,
    };

    setInviteLoading(true);

    try {
      console.log("[Calendar] Sending create-invite request:", body);

      const resp = await fetch("http://localhost:3018/create-invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await resp.json().catch(() => null);

      console.log("[Calendar] Response:", resp.status, data);

      if (!resp.ok) {
        setInviteError((data && data.message) || "Calendar service error.");
        return;
      }

      if (!data || data.status !== "success") {
        setInviteError((data && data.message) || "Failed to create invite.");
        return;
      }

      if (data.download_url) {
        setInviteUrl(data.download_url);
      } else if (data.filename) {
        setInviteUrl(`http://localhost:3018/download/${data.filename}`);
      }
    } catch (err) {
      console.error("Create invite failed:", err);
      setInviteError("Could not reach calendar service.");
    } finally {
      setInviteLoading(false);
    }
  };

  const handleSendReminder = async () => {
    setNotifyError("");
    setNotifySuccess("");

    if (!applicationToEdit) return;

    // compose recipient and message
    const to = recipient || "";
    if (!to) {
      setNotifyError("Please enter a recipient email.");
      return;
    }

    const company = formData.company || applicationToEdit.company || "";
    const position = formData.position || applicationToEdit.position || "";
    const date = formData.date || applicationToEdit.date || "";
    const start_time = formData.start_time || applicationToEdit.start_time || "14:00";

    const when = date ? `${date} ${start_time}` : "TBD";
    const location = applicationToEdit.address || applicationToEdit.map_url || "Online";

    const subject = `Reminder: ${company} - ${position} Interview`;
    const body = `This is a reminder for the interview at ${company} for ${position} scheduled at ${when}. Location: ${location}`;

    const payload = { recipient: to, subject, body };

    setNotifyLoading(true);
    try {
      console.log("[Notify] Sending request:", payload);

      const resp = await fetch("http://localhost:5557/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await resp.json().catch(() => null);
      console.log("[Notify] Response:", resp.status, data);

      if (!resp.ok) {
        setNotifyError((data && data.message) || "Notification service error.");
        return;
      }

      if (!data || data.status !== "success") {
        setNotifyError((data && data.message) || "Failed to send notification.");
        return;
      }

      setNotifySuccess(data.message || "Notification sent.");
    } catch (err) {
      console.error("Notification request failed:", err);
      setNotifyError("Could not reach notification service.");
    } finally {
      setNotifyLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <BackButton />

      <main className="newApplication">
        <h1>Edit Application</h1>

        <p className="subtitle">Update the details for this job application.</p>

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

                  <input id="company" name="company" type="text" value={formData.company} onChange={handleChange} />
                </div>

                <div className="formGroup">
                  <label htmlFor="position">
                    Position <span className="requiredStar">*</span>
                  </label>

                  <input id="position" name="position" type="text" value={formData.position} onChange={handleChange} />
                </div>

                <div className="formGroup">
                  <label htmlFor="date">
                    Date Applied <span className="requiredStar">*</span>
                  </label>

                  <input id="date" name="date" type="date" value={formData.date} onChange={handleChange} />
                </div>

                <div className="formGroup">
                  <label htmlFor="start_time">Interview Start Time</label>

                  <input
                    id="start_time"
                    name="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={handleChange}
                  />
                </div>

                <div className="formGroup">
                  <label htmlFor="end_time">Interview End Time</label>

                  <input id="end_time" name="end_time" type="time" value={formData.end_time} onChange={handleChange} />
                </div>

                <div className="formGroup">
                  <label htmlFor="status">
                    Status <span className="requiredStar">*</span>
                  </label>

                  <select id="status" name="status" value={formData.status} onChange={handleChange}>
                    <option value="Applied">Applied</option>
                    <option value="Interview">Interview</option>
                    <option value="Offer">Offer</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="formGroup">
                <label htmlFor="notes">Notes</label>

                <textarea id="notes" name="notes" rows="5" value={formData.notes} onChange={handleChange} />
              </div>

              <div className="formGroup">
                <label htmlFor="recipient">Reminder Recipient Email</label>

                <input
                  id="recipient"
                  name="recipient"
                  type="email"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="recipient@example.com"
                />
              </div>
            </>
          )}

          <div className="buttonRow">
            <button type="button" className="cancelButton" onClick={() => navigate("/applications")}>
              Cancel
            </button>

            {applicationToEdit && (
              <>
                {formData.status === "Interview" && (
                  <>
                    <button
                      type="button"
                      className="saveButton"
                      onClick={handleGenerateInvite}
                      disabled={inviteLoading}
                    >
                      {inviteLoading ? "Generating..." : "Generate Calendar Invite"}
                    </button>

                    {inviteError && <p style={{ color: "#dc2626" }}>{inviteError}</p>}

                    {inviteUrl && (
                      <p>
                        <a href={inviteUrl} target="_blank" rel="noreferrer">
                          Download Invite
                        </a>
                      </p>
                    )}

                    <div style={{ marginTop: 10 }}>
                      <button
                        type="button"
                        className="saveButton"
                        onClick={handleSendReminder}
                        disabled={notifyLoading}
                      >
                        {notifyLoading ? "Sending..." : "Send Reminder"}
                      </button>

                      {notifyError && <p style={{ color: "#dc2626" }}>{notifyError}</p>}
                      {notifySuccess && <p style={{ color: "#16a34a" }}>{notifySuccess}</p>}
                    </div>
                  </>
                )}

                <button type="button" className="saveButton" onClick={handleSave}>
                  Save Changes
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default EditApplication;
