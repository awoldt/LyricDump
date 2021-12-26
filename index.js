require("dotenv").config();

const express = require("express");
const app = express();
const path = require("path");
const dbConnect = require("./DB_connect");
const SongModel = require('./SongModel');


app.set("view engine", "ejs");

dbConnect();

const apiRoutes = require("./routes/apiRoute");

app.get("/", (req, res) => {
  res.status(200);
  res.sendFile(path.join(__dirname + "/", "index.html"));
});

app.get("/artists", async (req, res) => {
  res.status(200);



  const songs = await SongModel.find();

  const a = new Array(); //artist_queries
  const b = new Array(); //artists name
  await songs.forEach(x => {
    if(a.indexOf(x.artist_query) === -1) {
      a.push(x.artist_query)
    }
  })
  await songs.forEach(x => {
    if(b.indexOf(x.artist) === -1) {
      b.push(x.artist)
    }
  })


  console.log(a.sort());
  console.log(b.sort());




  res.render("artists", {
    artist_names: b.sort(),
    artists_links: a.sort(),
  });
});

app.use(apiRoutes);

app.listen(8080, () => {
  console.log("App running on port 8080");
});
