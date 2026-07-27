import Navbar from "../components/Navbar/Navbar";
import './pagesstyles/Dashboard.css'
import applications from "../data/applications";

const totalApplications = applications.length;

const applied = applications.filter(
    app => app.status === "Applied"
).length;

const interview = applications.filter(
    app => app.status === "Interview"
).length;

const rejected = applications.filter(
    app => app.status === "Rejected"
).length;

function Dashboard() {
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

              <button className="blueButton">+ Add Application</button>
            </div>
          </div>

          <div className="card">
            <div className="icon green">📋</div>

            <div className="cardInfo">
              <h3>View Applications</h3>

              <p>See all your job applications.</p>

              <button className="greenButton">View Applications</button>
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
                          <h2 className="greenText">{applied }</h2>
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
        </section>
      </main>
    </>
  );
}

export default Dashboard;
