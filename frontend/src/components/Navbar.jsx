import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">⚡</span>
        <span className="brand-name">TaskFlow</span>
      </div>

      <div className="navbar-links">
        <Link to="/dashboard" className={`nav-link ${isActive("/dashboard") ? "active" : ""}`}>
          Dashboard
        </Link>
        <Link to="/projects" className={`nav-link ${isActive("/projects") ? "active" : ""}`}>
          Projects
        </Link>
      </div>

      <div className="navbar-user">
        <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
        <span className="user-name">{user?.name}</span>
        <button className="btn-logout" onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  );
};

export default Navbar;
