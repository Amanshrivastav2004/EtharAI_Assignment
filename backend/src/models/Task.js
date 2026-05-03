const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, "Description cannot exceed 1000 characters"],
      default: "",
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Task must belong to a project"],
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // A task can exist without being assigned initially
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "in-progress", "done"],
        message: 'Status must be "pending", "in-progress", or "done"',
      },
      default: "pending",
    },
    dueDate: {
      type: Date,
      default: null,
      validate: {
        validator: function (value) {
          // dueDate is optional; if provided, it must be a valid date
          if (!value) return true;
          return value instanceof Date && !isNaN(value.getTime());
        },
        message: "Please provide a valid due date",
      },
    },
  },
  {
    timestamps: true, // Adds createdAt & updatedAt
  }
);

// ─── Virtual: isOverdue ───────────────────────────────────────────────────────
// Returns true if the task is past its due date and not yet done
taskSchema.virtual("isOverdue").get(function () {
  if (!this.dueDate || this.status === "done") return false;
  return new Date() > this.dueDate;
});

// Ensure virtuals are included when converting to JSON/Object
taskSchema.set("toJSON", { virtuals: true });
taskSchema.set("toObject", { virtuals: true });

// ─── Indexes for common queries ───────────────────────────────────────────────
taskSchema.index({ project: 1, status: 1 });   // Filter tasks by project + status
taskSchema.index({ assignedTo: 1, status: 1 }); // Dashboard: my tasks by status
taskSchema.index({ dueDate: 1 });               // Sorting/filtering overdue tasks

const Task = mongoose.model("Task", taskSchema);

module.exports = Task;
