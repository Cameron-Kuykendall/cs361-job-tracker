import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar/Navbar";
import BackButton from "../components/BackButton/BackButton";
import "./pagesstyles/ApplicationList.css";
import initialApplications from "../data/applications";

function ApplicationList() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState(() => {
    try {
      const savedApplications = localStorage.getItem("applications");

      if (savedApplications) {
        return JSON.parse(savedApplications);
      }

      localStorage.setItem(
        "applications",
        JSON.stringify(initialApplications)
      );

      return initialApplications;
    } catch (error) {
      console.error("Could not load applications:", error);
      return initialApplications;
    }
  });

  const handleDelete = (id) => {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete this application?"
    );

    if (!shouldDelete) {
      return;
    }

    const updatedApplications = applications.filter(
      (application) => application.id !== id
    );

    setApplications(updatedApplications);

    localStorage.setItem(
      "applications",
      JSON.stringify(updatedApplications)
    );
  };

  const handleEdit = (id) => {
    navigate(`/edit/${id}`);
  };

  return (
    <>
      <Navbar />
      <BackButton />

      <main className="applications">
        <div className="pageHeader">
          <div>
            <h1>My Applications</h1>
            <p>Here's a list of all your job applications.</p>
          </div>

          <button
            className="newButton"
            onClick={() => navigate("/new")}
          >
            + New Application
          </button>
        </div>

        <div className="tableCard">
          <table>
            <thead>
              <tr>
                <th>Company</th>
                <th>Position</th>
                <th>Date Applied</th>
                <th>Status</th>
                <th>Notes</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {applications.length > 0 ? (
                applications.map((application) => (
                  <tr key={application.id}>
                    <td>{application.company}</td>
                    <td>{application.position}</td>
                    <td>{application.date}</td>

                    <td>
                      <span
                        className={`status ${application.status.toLowerCase()}`}
                      >
                        {application.status}
                      </span>
                    </td>

                    <td>{application.notes}</td>

                    <td>
                      <div className="actionButtons">
                        <button
                          type="button"
                          className="editButton"
                          onClick={() => handleEdit(application.id)}
                          aria-label={`Edit ${application.company} application`}
                        >
                          ✏️
                        </button>

                        <button
                          type="button"
                          className="deleteButton"
                          onClick={() => handleDelete(application.id)}
                          aria-label={`Delete ${application.company} application`}
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">No applications found.</td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="tableFooter">
            <p>Showing {applications.length} applications</p>

            <div className="pagination">
              <button type="button">{"<"}</button>
              <button type="button" className="active">
                1
              </button>
              <button type="button">{">"}</button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default ApplicationList;
