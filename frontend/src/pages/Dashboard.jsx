import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import "./pagesstyles/Dashboard.css";
import initialApplications from "../data/applications";

function Dashboard() {
  const navigate = useNavigate();

  const [applications] = useState(() => {
    try {
      const savedApplications = localStorage.getItem("applications");

      if (savedApplications) {
        return JSON.parse(savedApplications);
      }

      localStorage.setItem("applications", JSON.stringify(initialApplications));

      return initialApplications;
    } catch (error) {
      console.error("Could not load applications:", error);
      return initialApplications;
    }
  });

  const totalApplications = applications.length;

  const applied = applications.filter((application) => application.status === "Applied").length;

  const interview = applications.filter((application) => application.status === "Interview").length;

  const rejected = applications.filter((application) => application.status === "Rejected").length;

  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [analyticsError, setAnalyticsError] = useState("");

  const fetchAnalytics = async () => {
    setAnalyticsError("");
    setAnalytics(null);
    setAnalyticsLoading(true);

    try {
      const records = applications;

      const body = {
        records,
        group_by: "status",
        success_field: "status",
        success_value: "Offer",
      };

      console.log("[Analytics] Sending request:", body);

      const resp = await fetch("http://localhost:3014/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await resp.json().catch(() => null);

      console.log("[Analytics] Response status:", resp.status, "body:", data);

      if (!resp.ok) {
        setAnalyticsError((data && data.message) || "Analytics service error.");
        setAnalyticsLoading(false);
        return;
      }

      if (!data || data.status !== "success") {
        setAnalyticsError((data && data.message) || "Invalid analytics response.");
        setAnalyticsLoading(false);
        return;
      }

      setAnalytics(data.analytics || null);
    } catch (err) {
      console.error("Analytics request failed:", err);
      setAnalyticsError("Could not reach analytics service.");
    } finally {
      setAnalyticsLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="dashboard">
        <h1>Dashboard</h1>

        <p className="welcome">Welcome back, Cameron! Here's your application overview.</p>

        <section className="cardRow">
          <div className="card">
            <div className="icon blue">+</div>

            <div className="cardInfo">
              <h3>New Application</h3>

              <p>Add a new job application to track.</p>

              <button type="button" className="blueButton" onClick={() => navigate("/new")}>
                + Add Application
              </button>
            </div>
          </div>

          <div className="card">
            <div className="icon green">📋</div>

            <div className="cardInfo">
              <h3>View Applications</h3>

              <p>See all your job applications.</p>

              <button type="button" className="greenButton" onClick={() => navigate("/applications")}>
                View Applications
              </button>
            </div>
          </div>
        </section>

        <section className="summary">
          <h3>Application Summary</h3>

          <div className="stats">
            <div>
              <p>Total Applications</p>
              <h2 className="blueText">{totalApplications}</h2>
            </div>

            <div>
              <p>Applied</p>
              <h2 className="greenText">{applied}</h2>
            </div>

            <div>
              <p>Interview</p>
              <h2 className="orangeText">{interview}</h2>
            </div>

            <div>
              <p>Rejected</p>
              <h2 className="redText">{rejected}</h2>
            </div>
          </div>

          <div style={{ marginTop: 20 }}>
            <button type="button" className="blueButton" onClick={fetchAnalytics} disabled={analyticsLoading}>
              {analyticsLoading ? "Calculating..." : "Fetch Analytics"}
            </button>

            {analyticsError && <p style={{ color: "#dc2626" }}>{analyticsError}</p>}

            {analytics && (
              <div
                style={{ marginTop: 12, background: "#fff", padding: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
              >
                <h4>Analytics</h4>
                <p>Total records: {analytics.total_records}</p>
                {analytics.grouped_counts && (
                  <div>
                    <p>Grouped counts:</p>
                    <ul>
                      {Object.entries(analytics.grouped_counts).map(([k, v]) => (
                        <li key={k}>
                          {k}: {v}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {analytics.success_count !== undefined && (
                  <p>
                    Offers: {analytics.success_count} ({analytics.success_rate}% of records)
                  </p>
                )}
                {analytics.total !== null && <p>Total (numeric): {analytics.total}</p>}
                {analytics.average !== null && <p>Average (numeric): {analytics.average}</p>}
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}

export default Dashboard;
