import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";

const Projects = () => {
  const location = useLocation();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(location.state?.openModal || false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const fetchProjects = async () => {
    try {
      const { data } = await api.get("/projects");
      setProjects(data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setCreating(true);
    try {
      await api.post("/projects", form);
      setShowModal(false);
      setForm({ name: "", description: "" });
      fetchProjects();
    } catch (err) {
      const msg = err.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(", ") : msg || "Failed to create project");
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteProject = async (e, projectId) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this project? This will remove all tasks as well.")) return;
    try {
      await api.delete(`/projects/${projectId}`);
      fetchProjects();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete project");
    }
  };

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Projects</h1>
            <p className="subtitle">Manage all your projects</p>
          </div>
          <button className="btn-primary" onClick={() => setShowModal(true)}>+ New Project</button>
        </div>

        {loading ? (
          <div className="loading-state"><div className="loader" /><p>Loading projects...</p></div>
        ) : projects.length === 0 ? (
          <div className="empty-state">
            <p>🚀 No projects yet. Create your first one!</p>
            <button className="btn-primary" onClick={() => setShowModal(true)}>Create Project</button>
          </div>
        ) : (
          <div className="project-grid">
            {projects.map((p) => (
              <Link to={`/projects/${p._id}`} key={p._id} className="project-card">
                <div className="project-card-header">
                  <div className="project-avatar">{p.name.charAt(0)}</div>
                  <span className="member-count">{p.members?.length || 0} members</span>
                </div>
                <h3 className="project-name">{p.name}</h3>
                <p className="project-desc">{p.description || "No description"}</p>
                <div className="project-footer">
                  <span className="task-count">{p.tasks?.length || 0} tasks</span>
                  <div className="card-actions">
                    <button 
                      className="btn-icon btn-delete" 
                      onClick={(e) => handleDeleteProject(e, p._id)}
                      title="Delete Project"
                    >
                      🗑️
                    </button>
                    <span className="arrow">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Create Project Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Project</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleCreate} className="auth-form">
              <div className="form-group">
                <label>Project Name</label>
                <input
                  type="text"
                  placeholder="e.g. E-Commerce App"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="What is this project about?"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={creating}>
                  {creating ? <span className="spinner" /> : "Create Project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
