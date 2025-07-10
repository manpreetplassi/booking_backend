const { createAppointment, getAppointment } = require("../controller/appointments")
const router = require("express").Router()

router.post("/create_appointment", createAppointment())
router.patch("/appointments", getAppointment())
module.exports = router