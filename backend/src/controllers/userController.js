const User = require("../models/User");

// @desc   Find user by email (for Add Member modal)
// @route  GET /api/users/by-email?email=...
// @access Private
const getUserByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ success: false, message: "Email is required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ success: false, message: "No user found with that email" });

    res.status(200).json({ success: true, data: { _id: user._id, name: user.name, email: user.email } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

module.exports = { getUserByEmail };
