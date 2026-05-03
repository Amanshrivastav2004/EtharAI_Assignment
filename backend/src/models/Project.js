const mongoose = require("mongoose");

// ─── Member Sub-Schema ────────────────────────────────────────────────────────
const memberSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Member user reference is required"],
    },
    role: {
      type: String,
      enum: {
        values: ["admin", "member"],
        message: 'Role must be either "admin" or "member"',
      },
      default: "member",
    },
  },
  { _id: false } // Don't create a separate _id for each member entry
);

// ─── Project Schema ───────────────────────────────────────────────────────────
const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      minlength: [3, "Project name must be at least 3 characters"],
      maxlength: [100, "Project name cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
      default: "",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Project must have a creator"],
    },
    members: {
      type: [memberSchema],
      default: [], // Starts empty; creator is added as admin on creation
    },
  },
  {
    timestamps: true, // Adds createdAt & updatedAt
  }
);

// ─── Pre-save Hook: Ensure creator is always an admin member ─────────────────
projectSchema.pre("save", function (next) {
  // Only on new project creation
  if (!this.isNew) return next();

  const creatorAlreadyMember = this.members.some(
    (m) => m.user.toString() === this.createdBy.toString()
  );

  if (!creatorAlreadyMember) {
    this.members.push({ user: this.createdBy, role: "admin" });
  }

  next();
});

// ─── Instance Method: Check if a user is an admin of this project ─────────────
projectSchema.methods.isAdmin = function (userId) {
  return this.members.some(
    (m) => m.user.toString() === userId.toString() && m.role === "admin"
  );
};

// ─── Instance Method: Check if a user is a member of this project ─────────────
projectSchema.methods.isMember = function (userId) {
  return this.members.some((m) => m.user.toString() === userId.toString());
};

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
