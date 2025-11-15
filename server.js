// server.js
const { run } = require("./config/db");
const express = require("express");
const login = require("./controller/user");
const router = require("./routes/user");
const appointments = require("./routes/appointments");
const bodyParser = require("body-parser");
const cors = require("cors")
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json())
app.use(cors())
app.use("/", router)
app.use("/appointments", appointments)

run()

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
