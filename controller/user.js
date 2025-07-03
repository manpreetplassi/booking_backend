const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { db } = require("../config/db");

const router = express.Router();

// POST /auth/register
// Register a user
async function signUp(req, res) {
  try {
    const { email, password } = req.body;

    // Simple validation
    if (!email || !password) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }
    // const existingUser = await User.findOne({ email });
    const existingUser = await db.collection("users").find({})
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    } else{
      return res.status(409).json({ message: "hi", existingUser });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      age: age || null,
      weight: weight || null,
    });

    await newUser.save();

    return res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// POST /users/login
// Login user and return JWT token
// router.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // 1. Check if user exists
//     const user = await User.findOne({ email });
//     if (!user) return res.status(401).json({ message: "Invalid email or password" });

//     // 2. Check password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

//     // 3. Generate JWT
//     const payload = { userId: user._id, email: user.email };
//     const token = jwt.sign(payload, process.env.JWT_SECRET, {
//       expiresIn: process.env.JWT_EXPIRES_IN || "1d",
//     });

//     res.status(200).json({
//       message: "Login successful",
//       token,
//       user: {
//         name: user.name,
//         email: user.email,
//         age: user.age,
//         weight: user.weight,
//       },
//     });
//   } catch (err) {
//     console.error("Login error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });




module.exports = { signUp };