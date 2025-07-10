const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { getDb } = require("../config/db");

const router = express.Router();

// POST /auth/register
// Register a user
async function createAppointment(req, res) {
  try {
    const { doctorId, patientId } = req.body;
    const db = await getDb()
    // Simple validation
    if (!doctorId || !patientId) {
      return res.status(400).json({ message: "Please fill all required fields" });
    }

    // Create user
    const appointment = db.collection("appointments").insertOne({
      doctorId, patientId
    })

    return res.status(201).json({ message: "Appointment created successfully", appointment });
  } catch (err) {
    console.error("error:", err);
    return res.status(500).json({ message: "Server error", err });
  }
};

async function getAppointment(req, res) {
  try {
    const { _id, role } = req.body;
    let appointments;
    if (role === "doctor") {
      appointments = await db.collection("doctor").findMany({ _id }).toArray()
    } else {
      appointments = await db.collection("patient").findMany({ _id }).toArray()
    }
    if(!appointments.length){
      return res.status(404).json({ message: "No appointment booked!"})
    }
    return res.status(200).json(appointments)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ message: "server error", error })
  }
}

module.exports = { createAppointment, getAppointment };