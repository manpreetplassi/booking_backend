const router = require("express").Router()
const login = require("../controller/user")

router.get("/login", login)

module.exports = router