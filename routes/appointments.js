const { createAppointment, getAppointment } = require("../controller/appointments")
const router = require("express").Router()

router.post("/create", createAppointment)
router.patch("/get", getAppointment)

module.exports = router