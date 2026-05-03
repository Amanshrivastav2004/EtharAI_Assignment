import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, done: 0, overdue: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get("/projects");
        const projectList = data.data || [];
        setProjects(projectList);

        // Aggregate task stats
        let total = 0, pending = 0, inProgress = 0, done = 0, overdue = 0;
        projectList.forEach((p) => {
          (p.tasks || []).forEach((t) => {
            total++;
            if (t.status === "pending") pending++;
            if (t.status === "in-progress") inProgress++;
            if (t.status === "done") done++;
            if (t.isOverdue) overdue++;
          });
        });
        setStats({ total, pending, inProgress, done, overdue });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const statCards = [
    { label: "Total Tasks", value: stats.total, icon: "📋", color: "blue" },
    { label: "Pending", value: stats.pending, icon: "🕐", color: "yellow" },
    { label: "In Progress", value: stats.inProgress, icon: "⚡", color: "purple" },
    { label: "Completed", value: stats.done, icon: "✅", color: "green" },
    { label: "Overdue", value: stats.overdue, icon: "🔴", color: "red" },
  ];

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Dashboard</h1>
            <p className="subtitle">Welcome back, <strong>{user?.name}</strong> 👋</p>
          </div>
          <Link to="/projects" state={{ openModal: true }} className="btn-primary">+ New Project</Link>
        </div>

        {loading ? (
          <div className="loading-state">
            <div className="loader" />
            <p>Loading your workspace...</p>
          </div>
        ) : (
          <>
            {/* Stats Grid */}
            <div className="stats-grid">
              {statCards.map((s) => (
                <div key={s.label} className={`stat-card stat-${s.color}`}>
                  <div className="stat-icon">{s.icon}</div>
                  <div className="stat-info">
                    <p className="stat-value">{s.value}</p>
                    <p className="stat-label">{s.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Projects */}
            <section className="section">
              <h2 className="section-title">Recent Projects</h2>
              {projects.length === 0 ? (
                <div className="empty-state">
                  <p>🚀 No projects yet.</p>
                  <Link to="/projects" state={{ openModal: true }} className="btn-primary">Create your first project</Link>
                </div>
              ) : (
                <div className="project-grid">
                  {projects.slice(0, 6).map((p) => (
                    <Link to={`/projects/${p._id}`} key={p._id} className="project-card">
                      <div className="project-card-header">
                        <div className="project-avatar">{p.name.charAt(0)}</div>
                        <span className="member-count">{p.members?.length || 0} members</span>
                      </div>
                      <h3 className="project-name">{p.name}</h3>
                      <p className="project-desc">{p.description || "No description"}</p>
                      <div className="project-footer">
                        <span className="task-count">{p.tasks?.length || 0} tasks</span>
                        <span className="arrow">→</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
