const express = require("express");
const router = express.Router();

const { signup, login } = require("../controllers/authController");

// POST /api/auth/signup  → Register new user
router.post("/signup", signup);

// POST /api/auth/login   → Login existing user
router.post("/login", login);

module.exports = router;
