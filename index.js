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
const cronRoute = require("./routes/cronRoute");
const { Storage } = require("@google-cloud/storage");

app.get("/", async (req, res) => {
  try {
    const googleCloudStorage = new Storage({
      keyFilename: "bad-rap-api-v2-c3bb8ce441f7.json",
    });

    const bucketData = await googleCloudStorage
      .bucket("year-json-data")
      .file("homepage.json")
      .createReadStream();
    var buffer = "";
    bucketData
      .on("data", (x) => {
        buffer += x;
      })
      .on("end", () => {
        res.status(200);

        console.log(buffer)

        res.render("homepage.ejs", {
          organized_data: JSON.parse(buffer),
        });
      });
  } catch (e) {
    res.status(500);
    res.send(null);
  }
});

app.use(artistRoutes);
app.use(yearRoutes);
app.use(apiRoutes); //all api backend
app.use(searchRoute);
app.use(cronRoute);

app.get("/sitemap.xml", (req, res) => {
  res.status(200);
  res.sendFile(path.join(__dirname + "/", "sitemap.xml"));
});

app.get("/robots.txt", (req, res) => {
  res.status(200);
  res.sendFile(path.join(__dirname + "/", "robots.txt"));
});

//404
app.use((req, res) => {
  res.status(404);
  res.send("Page not found");
});

app.listen(process.env.PORT, () => {
  console.log("App running on port 8080");
});
