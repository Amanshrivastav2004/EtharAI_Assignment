const express = require("express");
const router = express.Router();

const { assignTask, updateTaskStatus, deleteTask } = require("../controllers/taskController");
const { protect } = require("../middleware/authMiddleware");

// PATCH /api/tasks/:taskId/assign  → Assign task to a member (admin only)
router.patch("/:taskId/assign", protect, assignTask);

// PATCH /api/tasks/:taskId/status  → Update task status (assigned member or admin)
router.patch("/:taskId/status", protect, updateTaskStatus);

// DELETE /api/tasks/:taskId        → Delete a task (admin only)
router.delete("/:taskId", protect, deleteTask);

module.exports = router;
