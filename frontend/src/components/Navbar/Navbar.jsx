
import { NavLink } from "react-router-dom";
import "./NavBar.css";
import briefcase from "../../assets/breifcase.png";

function Navbar() {
  return (
    <nav className="navbar">
      <div>
        <img src={briefcase} alt="Briefcase" />
        <h2>Job Application Tracker</h2>
      </div>

      <div className="menuitems">
        <NavLink to="/">Dashboard</NavLink>
        <NavLink to="/applications">Applications</NavLink>
        <NavLink to="/new">New Application</NavLink>
      </div>
    </nav>
  );
}

export default Navbar;
