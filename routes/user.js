const router = require("express").Router()
const { signUp, login } = require("../controller/user")

router.post("/register", signUp)
router.post("/login", login)

module.exports = router