// server.js
const run = require("./config/db");
const express = require("express");
const login = require("./controller/user");
const router = require("./routes/user");
const app = express();
const PORT = process.env.PORT || 3000;

app.use("/", router)
app.use("/ok", (req, res) => {
    res.send("ok in")
}
)
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
run()

// .then(() => {
//     console.log(`server connected to MongoDB`);
// }).catch((err) => {
//     console.error("Failed to connect to MongoDB", err);
// });
