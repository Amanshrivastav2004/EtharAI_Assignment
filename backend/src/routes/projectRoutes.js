const express = require("express");
const router = express.Router();

const { createProject, getAllProjects, getProjectById, addMember } = require("../controllers/projectController");
const { createTask } = require("../controllers/taskController");
const { protect } = require("../middleware/authMiddleware");

// GET  /api/projects                    → All projects for logged-in user
router.get("/", protect, getAllProjects);

// GET  /api/projects/:projectId         → Single project with tasks & members
router.get("/:projectId", protect, getProjectById);

// POST /api/projects                    → Create a new project (creator becomes admin)
router.post("/", protect, createProject);

// POST /api/projects/:projectId/members → Add a member (admin only)
router.post("/:projectId/members", protect, addMember);

// POST /api/projects/:projectId/tasks   → Create a task (admin only)
router.post("/:projectId/tasks", protect, createTask);

module.exports = router;
