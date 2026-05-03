import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";

const STATUS_COLORS = { pending: "yellow", "in-progress": "purple", done: "green" };
const STATUS_LABELS = { pending: "Pending", "in-progress": "In Progress", done: "Done" };

const ProjectDetail = () => {
  const { projectId } = useParams();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("tasks"); // "tasks" | "members"

  // Modals
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: "", description: "", assignedTo: "", dueDate: "" });
  const [memberEmail, setMemberEmail] = useState("");
  const [modalError, setModalError] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchProject = async () => {
    try {
      const { data } = await api.get(`/projects/${projectId}`);
      setProject(data.data);
      setTasks(data.data.tasks || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProject(); }, [projectId]);

  const isAdmin = project?.members?.some(
    (m) => m.user?._id === user?.id && m.role === "admin"
  );

  // ─── Create Task ─────────────────────────────────────────────────────────────
  const handleCreateTask = async (e) => {
    e.preventDefault();
    setModalError("");
    setSaving(true);
    try {
      await api.post(`/projects/${projectId}/tasks`, taskForm);
      setShowTaskModal(false);
      setTaskForm({ title: "", description: "", assignedTo: "", dueDate: "" });
      fetchProject();
    } catch (err) {
      const msg = err.response?.data?.message;
      setModalError(Array.isArray(msg) ? msg.join(", ") : msg || "Failed");
    } finally {
      setSaving(false);
    }
  };

  // ─── Add Member ───────────────────────────────────────────────────────────────
  const handleAddMember = async (e) => {
    e.preventDefault();
    setModalError("");
    setSaving(true);
    try {
      // First find user by email
      const { data: userData } = await api.get(`/users/by-email?email=${memberEmail}`);
      await api.post(`/projects/${projectId}/members`, { userId: userData.data._id });
      setShowMemberModal(false);
      setMemberEmail("");
      fetchProject();
    } catch (err) {
      const msg = err.response?.data?.message;
      setModalError(Array.isArray(msg) ? msg.join(", ") : msg || "Failed to add member");
    } finally {
      setSaving(false);
    }
  };

  // ─── Update Task Status ───────────────────────────────────────────────────────
  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      fetchProject();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="app-layout">
        <Navbar />
        <main className="main-content">
          <div className="loading-state"><div className="loader" /><p>Loading project...</p></div>
        </main>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="app-layout">
        <Navbar />
        <main className="main-content">
          <div className="empty-state"><p>Project not found.</p></div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1>{project.name}</h1>
            <p className="subtitle">{project.description || "No description"}</p>
          </div>
          {isAdmin && (
            <div className="header-actions">
              <button className="btn-secondary" onClick={() => { setModalError(""); setShowMemberModal(true); }}>
                + Add Member
              </button>
              <button className="btn-primary" onClick={() => { setModalError(""); setShowTaskModal(true); }}>
                + Add Task
              </button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button className={`tab ${activeTab === "tasks" ? "active" : ""}`} onClick={() => setActiveTab("tasks")}>
            Tasks ({tasks.length})
          </button>
          <button className={`tab ${activeTab === "members" ? "active" : ""}`} onClick={() => setActiveTab("members")}>
            Members ({project.members?.length || 0})
          </button>
        </div>

        {/* Tasks Tab */}
        {activeTab === "tasks" && (
          <div className="task-columns">
            {["pending", "in-progress", "done"].map((status) => (
              <div key={status} className={`task-column col-${STATUS_COLORS[status]}`}>
                <div className="column-header">
                  <span className={`status-dot dot-${STATUS_COLORS[status]}`} />
                  <h3>{STATUS_LABELS[status]}</h3>
                  <span className="count-badge">{tasks.filter(t => t.status === status).length}</span>
                </div>
                <div className="task-list">
                  {tasks.filter(t => t.status === status).length === 0 ? (
                    <div className="empty-column">No tasks</div>
                  ) : (
                    tasks.filter(t => t.status === status).map((task) => (
                      <div key={task._id} className="task-card">
                        <h4 className="task-title">{task.title}</h4>
                        {task.description && <p className="task-desc">{task.description}</p>}
                        {task.assignedTo && (
                          <div className="task-assignee">
                            <span className="mini-avatar">{task.assignedTo.name?.charAt(0)}</span>
                            <span>{task.assignedTo.name}</span>
                          </div>
                        )}
                        {task.dueDate && (
                          <p className={`due-date ${task.isOverdue ? "overdue" : ""}`}>
                            📅 {new Date(task.dueDate).toLocaleDateString()}
                            {task.isOverdue && " ⚠️ Overdue"}
                          </p>
                        )}
                        <div className="task-status-change">
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(task._id, e.target.value)}
                            className={`status-select status-${STATUS_COLORS[task.status]}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="in-progress">In Progress</option>
                            <option value="done">Done</option>
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Members Tab */}
        {activeTab === "members" && (
          <div className="members-list">
            {project.members?.map((m) => (
              <div key={m.user?._id} className="member-card">
                <div className="member-avatar">{m.user?.name?.charAt(0).toUpperCase()}</div>
                <div className="member-info">
                  <p className="member-name">{m.user?.name}</p>
                  <p className="member-email">{m.user?.email}</p>
                </div>
                <span className={`role-badge role-${m.role}`}>{m.role}</span>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Create Task Modal */}
      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Task</h2>
              <button className="modal-close" onClick={() => setShowTaskModal(false)}>✕</button>
            </div>
            {modalError && <div className="alert alert-error">{modalError}</div>}
            <form onSubmit={handleCreateTask} className="auth-form">
              <div className="form-group">
                <label>Title</label>
                <input type="text" placeholder="Task title" value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea placeholder="Task description" rows={2} value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Assign To</label>
                <select value={taskForm.assignedTo}
                  onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}>
                  <option value="">— Unassigned —</option>
                  {project.members?.map((m) => (
                    <option key={m.user?._id} value={m.user?._id}>{m.user?.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input type="date" value={taskForm.dueDate}
                  onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? <span className="spinner" /> : "Create Task"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showMemberModal && (
        <div className="modal-overlay" onClick={() => setShowMemberModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Member</h2>
              <button className="modal-close" onClick={() => setShowMemberModal(false)}>✕</button>
            </div>
            {modalError && <div className="alert alert-error">{modalError}</div>}
            <form onSubmit={handleAddMember} className="auth-form">
              <div className="form-group">
                <label>User Email</label>
                <input type="email" placeholder="member@example.com"
                  value={memberEmail} onChange={(e) => setMemberEmail(e.target.value)} required />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowMemberModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? <span className="spinner" /> : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
