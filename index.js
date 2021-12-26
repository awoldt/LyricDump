require("dotenv").config();

const express = require("express");
const app = express();
const path = require("path");
const dbConnect = require("./DB_connect");

app.set("view engine", "ejs");

dbConnect();

const apiRoutes = require("./routes/apiRoute");

app.get("/", (req, res) => {
  res.status(200);
  res.sendFile(path.join(__dirname + "/", "index.html"));
});

app.get("/artists", (req, res) => {
  res.status(200);
  res.render("artists", {
    data: "heyyy",
  });
});

app.use(apiRoutes);

app.listen(8080, () => {
  console.log("App running on port 8080");
});
