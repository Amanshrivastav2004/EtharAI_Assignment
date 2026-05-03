const express = require("express");
const router = express.Router();
const { getUserByEmail } = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

// GET /api/users/by-email?email=...  → find a user by email (for adding members)
router.get("/by-email", protect, getUserByEmail);

module.exports = router;
