const Project = require("../models/Project");
const User = require("../models/User");
const Task = require("../models/Task");

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Create a new project
// @route   POST /api/projects
// @access  Private (logged-in users only)
// ─────────────────────────────────────────────────────────────────────────────
const createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    // The pre-save hook in Project.js automatically adds
    // the creator (req.user.id) as "admin" in the members array
    const project = await Project.create({
      name,
      description,
      createdBy: req.user.id,
    });

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    });
  } catch (error) {
    // Handle mongoose validation errors
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get all projects the logged-in user belongs to
// @route   GET /api/projects
// @access  Private
// ─────────────────────────────────────────────────────────────────────────────
const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find({ "members.user": req.user.id })
      .populate("members.user", "name email")
      .populate("createdBy", "name email")
      .lean();

    // Attach tasks to each project
    const Task = require("../models/Task");
    const projectsWithTasks = await Promise.all(
      projects.map(async (p) => {
        const tasks = await Task.find({ project: p._id })
          .populate("assignedTo", "name email")
          .lean();
        return { ...p, tasks };
      })
    );

    res.status(200).json({ success: true, data: projectsWithTasks });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Get a single project by ID
// @route   GET /api/projects/:projectId
// @access  Private (members only)
// ─────────────────────────────────────────────────────────────────────────────
const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate("members.user", "name email")
      .populate("createdBy", "name email")
      .lean();

    if (!project) return res.status(404).json({ success: false, message: "Project not found" });

    const isMember = project.members.some((m) => m.user._id.toString() === req.user.id);
    if (!isMember) return res.status(403).json({ success: false, message: "Access denied" });

    const Task = require("../models/Task");
    const tasks = await Task.find({ project: project._id })
      .populate("assignedTo", "name email")
      .lean();

    res.status(200).json({ success: true, data: { ...project, tasks } });
  } catch (error) {
    if (error.name === "CastError") return res.status(400).json({ success: false, message: "Invalid ID" });
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// @desc    Add a member to a project
// @route   POST /api/projects/:projectId/members
// @access  Private (Admin of the project only)
// ─────────────────────────────────────────────────────────────────────────────
const addMember = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { userId } = req.body; // ID of the user to add

    // 1️⃣  Find the project
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // 2️⃣  Only an admin of this project can add members
    if (!project.isAdmin(req.user.id)) {
      return res.status(403).json({
        success: false,
        message: "Access denied: only project admins can add members",
      });
    }

    // 3️⃣  Check the user-to-add actually exists in DB
    const userToAdd = await User.findById(userId);
    if (!userToAdd) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 4️⃣  Prevent duplicates
    if (project.isMember(userId)) {
      return res.status(400).json({
        success: false,
        message: "User is already a member of this project",
      });
    }

    // 5️⃣  Add user as "member" (only admins can be set via separate promote API)
    project.members.push({ user: userId, role: "member" });
    await project.save(); // pre-save hook exits early (isNew = false)

    // Populate members for a clean response
    await project.populate("members.user", "name email");

    res.status(200).json({
      success: true,
      message: `${userToAdd.name} added to the project as member`,
      data: project,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid ID format" });
    }
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Delete a project and its tasks
// @route   DELETE /api/projects/:projectId
// @access  Private — Admin of the project only
const deleteProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);

    if (!project) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    // Check if user is admin
    const isAdmin = project.members.some(
      (m) => m.user.toString() === req.user.id && m.role === "admin"
    );

    if (!isAdmin) {
      return res.status(403).json({ success: false, message: "Only admins can delete projects" });
    }

    // 1️⃣ Delete all tasks associated with this project
    await Task.deleteMany({ project: projectId });

    // 2️⃣ Delete the project
    await project.deleteOne();

    res.status(200).json({ success: true, message: "Project and its tasks deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { createProject, getAllProjects, getProjectById, addMember, deleteProject };
