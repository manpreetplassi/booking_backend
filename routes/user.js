const router = require("express").Router()
const { signUp } = require("../controller/user")

router.post("/register", signUp)

module.exports = router