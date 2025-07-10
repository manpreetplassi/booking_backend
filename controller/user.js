const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getDb } = require("../config/db");

const router = express.Router();

// POST /auth/register
// Register a user
async function signUp(req, res) {
  try {
    const { role } = req.body;
    const db = await getDb()

    if (role === "doctor") {
      const { location, experience, fee, speciality, email, password } = req.body;

      // Simple validation
      if (!email || !password || !location || !experience || !fee || !speciality) {
        return res.status(400).json({ message: "Please fill all required fields" });
      }
      const existingUser = await db.collection("doctor").find({ email }).toArray()
      if (existingUser.length) {
        return res.status(409).json({ message: "Email already registered" });
      }
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      // Create user
      const newUser = db.collection("doctor").insertOne({
        role, email, password: hashedPassword, location, experience, fee, speciality
      })

      return res.status(201).json({ message: "User registered successfully", newUser });

    } else {
      const { address, dob, name, email, password } = req.body;

      // Simple validation
      if (!email || !password || !address || !dob || !name) {
        return res.status(400).json({ message: "Please fill all required fields" });
      }
      const existingUser = await db.collection("patient").find({ email }).toArray()
      if (existingUser.length) {
        return res.status(409).json({ message: "Email already registered" });
      }
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      // Create user
      const newUser = db.collection("patient").insertOne({
        role, email, password: hashedPassword, location, experience, fee, speciality
      })

      return res.status(201).json({ message: "User registered successfully", newUser });
    }
  } catch (err) {
    console.error("Registration error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// POST /users/login
// Login user and return JWT token
async function login(req, res) {
  try {
    const { email, password, role } = req.body;
    const db = await getDb()
    let user = null;

    // Simple validation
    if (!email || !password || !role) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }
    if (role === "doctor") {
      user = await db.collection("users").findOne({ email })
    } else {
      user = await db.collection("patient").findOne({ email })
    }
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    // 2. Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Invalid email or password" });

    // 3. Generate JWT
    const payload = { userId: user._id, email: user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};




module.exports = { signUp, login };