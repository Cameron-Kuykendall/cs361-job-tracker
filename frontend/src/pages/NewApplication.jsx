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
    // Optional fields populated from lookup
    address: "",
    latitude: null,
    longitude: null,
    map_url: "",
  });

  const [lookupResults, setLookupResults] = useState([]);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");

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

    if (!formData.company.trim() || !formData.position.trim() || !formData.date) {
      setError("Please fill out company, position, and date.");
      return;
    }

    try {
      const savedApplications = localStorage.getItem("applications");

      const currentApplications = savedApplications ? JSON.parse(savedApplications) : initialApplications;

      const newApplication = {
        id: Date.now(),
        company: formData.company.trim(),
        position: formData.position.trim(),
        date: formData.date,
        status: formData.status,
        notes: formData.notes.trim(),
        // include location fields if present
        address: formData.address || "",
        latitude: formData.latitude || null,
        longitude: formData.longitude || null,
        map_url: formData.map_url || "",
      };

      const updatedApplications = [...currentApplications, newApplication];

      localStorage.setItem("applications", JSON.stringify(updatedApplications));

      navigate("/applications");
    } catch (error) {
      console.error("Could not save application:", error);
      setError("The application could not be saved.");
    }
  };

  const handleLookup = async () => {
    setLookupError("");
    setLookupResults([]);

    const query = formData.company && formData.company.trim();
    if (!query) {
      setLookupError("Enter a company name to look up.");
      return;
    }

    setLookupLoading(true);

    try {
      console.log("[Lookup] Sending request:", { query, type: "company" });

      const resp = await fetch("http://localhost:3020/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, type: "company" }),
      });

      const data = await resp.json().catch(() => null);

      console.log("[Lookup] Response status:", resp.status, "body:", data);

      if (!resp.ok) {
        const message = (data && data.message) || "Lookup service error.";
        setLookupError(message);
        setLookupLoading(false);
        return;
      }

      if (!data || data.status !== "success" || !Array.isArray(data.results) || data.results.length === 0) {
        setLookupError((data && data.message) || "No companies found.");
        setLookupLoading(false);
        return;
      }

      setLookupResults(data.results);
    } catch (err) {
      console.error("Lookup request failed:", err);
      setLookupError("Could not reach lookup service.");
    } finally {
      setLookupLoading(false);
    }
  };

  const handleSelectResult = (result) => {
    // populate formData with selected company's details
    setFormData((cur) => ({
      ...cur,
      company: result.name || cur.company,
      address: result.display_name || cur.address,
      latitude: result.latitude || cur.latitude,
      longitude: result.longitude || cur.longitude,
      map_url: result.map_url || cur.map_url,
    }));

    // clear results after selection
    setLookupResults([]);
    setLookupError("");
  };

  return (
    <>
      <Navbar />
      <BackButton />

      <main className="newApplication">
        <h1>New Application</h1>

        <p className="subtitle">Fill out the details below to add a new job application.</p>

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

              <input id="company" name="company" type="text" value={formData.company} onChange={handleChange} />

              <div style={{ marginTop: 10, display: "flex", gap: 10 }}>
                <button type="button" className="saveButton" onClick={handleLookup} disabled={lookupLoading}>
                  {lookupLoading ? "Searching..." : "Look Up Company"}
                </button>
                {formData.address && (
                  <div style={{ alignSelf: "center", color: "#6b7280" }}>Selected: {formData.address}</div>
                )}
              </div>

              {lookupError && <p className="formError">{lookupError}</p>}

              {lookupResults && lookupResults.length > 0 && (
                <div className="lookupResults">
                  {lookupResults.map((r, idx) => (
                    <div key={idx} className="lookupItem">
                      <div style={{ fontWeight: 600 }}>{r.name}</div>
                      <div style={{ color: "#6b7280", marginBottom: 6 }}>{r.display_name}</div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button type="button" className="saveButton" onClick={() => handleSelectResult(r)}>
                          Select
                        </button>
                        <a
                          href={r.map_url}
                          target="_blank"
                          rel="noreferrer"
                          style={{ alignSelf: "center", color: "#2563eb" }}
                        >
                          View Map
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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

          <div className="buttonRow">
            <button type="button" className="cancelButton" onClick={() => navigate("/applications")}>
              Cancel
            </button>

            <button type="button" className="saveButton" onClick={handleSave}>
              Save Application
            </button>
          </div>
        </div>
      </main>
    </>
  );
}

export default NewApplication;
