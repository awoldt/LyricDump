require("dotenv").config();
var favicon = require("serve-favicon");

const express = require("express");
const app = express();
const path = require("path");
const dbConnect = require("./DB_connect");

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(favicon(path.join(__dirname, "public", "favicon.ico")));

dbConnect();

const apiRoutes = require("./routes/apiRoute");
const artistRoutes = require("./routes/artistRoute");
const yearRoutes = require("./routes/yearRoute");
const searchRoute = require("./routes/searchRoute");

app.get("/", (req, res) => {
  res.status(200);
  res.sendFile(path.join(__dirname + "/", "index.html"));
});

app.use(artistRoutes);
app.use(yearRoutes);
app.use(apiRoutes); //all api backend
app.use(searchRoute);

app.get("/sitemap.xml", (req, res) => {
  res.status(200);
  res.sendFile(path.join(__dirname + "/", "sitemap.xml"));
});

app.get("/robots.txt", (req, res) => {
  res.status(200);
  res.sendFile(path.join(__dirname + "/", "robots.txt"));
});

app.use((req, res) => {
  res.status(404);
  res.send("Page not found");
});

app.listen(8080, () => {
  console.log("App running on port 8080");
});
