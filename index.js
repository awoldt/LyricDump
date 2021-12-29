require("dotenv").config();

const express = require("express");
const app = express();
const path = require("path");
const dbConnect = require("./DB_connect");

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

dbConnect();

const apiRoutes = require("./routes/apiRoute");
const artistRoutes = require("./routes/artistRoute");
const yearRoutes = require('./routes/yearRoute');

app.get("/", (req, res) => {
  res.status(200);
  res.sendFile(path.join(__dirname + "/", "index.html"));
});

app.use(artistRoutes);
app.use(yearRoutes);
app.use(apiRoutes); //all api backend


app.listen(8080, () => {
  console.log("App running on port 8080");
});
