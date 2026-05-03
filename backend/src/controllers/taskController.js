const Task = require("../models/Task");
const Project = require("../models/Project");
const User = require("../models/User");

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create a task inside a project
// @route   POST /api/projects/:projectId/tasks
// @access  Private — Admin of the project only
// ─────────────────────────────────────────────────────────────────────────────
const createTask = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, description, assignedTo, dueDate } = req.body;

    // 1️⃣ Find the project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // 2️⃣ Only admins can create tasks
    if (!project.isAdmin(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Access denied: only project admins can create tasks",
      });
    }

    // 3️⃣ If assignedTo is provided, verify user exists & is a member
    if (assignedTo) {
      const userExists = await User.findById(assignedTo);
      if (!userExists) {
        return res.status(404).json({ success: false, message: "Assigned user not found" });
      }

      if (!project.isMember(assignedTo)) {
        return res.status(400).json({
          success: false,
          message: "Assigned user is not a member of this project",
        });
      }
    }

    // 4️⃣ Create the task
    const task = await Task.create({
      title,
      description,
      project: projectId,
      assignedTo: assignedTo || null,
      dueDate: dueDate || null,
    });

    // Populate for clean response
    await task.populate("assignedTo", "name email");

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages });
    }
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Assign (or re-assign) a task to a member
// @route   PATCH /api/tasks/:taskId/assign
// @access  Private — Admin of the project only
// ─────────────────────────────────────────────────────────────────────────────
const assignTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { userId } = req.body; // user to assign

    // 1️⃣ Find task and populate its project
    const task = await Task.findById(taskId).populate("project");
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    // 2️⃣ Only admin of the task's project can assign
    if (!task.project.isAdmin(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Access denied: only project admins can assign tasks",
      });
    }

    // 3️⃣ Verify target user exists and is a project member
    const userToAssign = await User.findById(userId);
    if (!userToAssign) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (!task.project.isMember(userId)) {
      return res.status(400).json({
        success: false,
        message: "User is not a member of this project",
      });
    }

    // 4️⃣ Assign the task
    task.assignedTo = userId;
    await task.save();

    await task.populate("assignedTo", "name email");

    res.status(200).json({
      success: true,
      message: `Task assigned to ${userToAssign.name}`,
      data: task,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Update task status
// @route   PATCH /api/tasks/:taskId/status
// @access  Private — Assigned member OR admin of the project
// ─────────────────────────────────────────────────────────────────────────────
const updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;

    // 1️⃣ Validate the status value
    const validStatuses = ["pending", "in-progress", "done"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be "pending", "in-progress", or "done"',
      });
    }

    // 2️⃣ Find the task
    const task = await Task.findById(taskId).populate("project");
    if (!task) {
      return res.status(404).json({ success: false, message: "Task not found" });
    }

    const project = task.project;
    const currentUserId = req.user.id;

    // 3️⃣ Permission check:
    //    - Admin of the project  → can update any task's status
    //    - Assigned member       → can only update their own task's status
    const isAdmin = project.isAdmin(currentUserId);
    const isAssignedUser =
      task.assignedTo && task.assignedTo.toString() === currentUserId;

    if (!isAdmin && !isAssignedUser) {
      return res.status(403).json({
        success: false,
        message:
          "Access denied: only the assigned member or a project admin can update task status",
      });
    }

    // 4️⃣ Update status
    task.status = status;
    await task.save();

    await task.populate("assignedTo", "name email");

    res.status(200).json({
      success: true,
      message: `Task status updated to "${status}"`,
      data: task,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { createTask, assignTask, updateTaskStatus };
