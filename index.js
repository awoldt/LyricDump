require("dotenv").config();

const express = require("express");
const app = express();
const path = require("path");
const dbConnect = require("./DB_connect");
const SongModel = require("./SongModel");
const Profile = require('./ArtistProfile')

app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

dbConnect();

const apiRoutes = require("./routes/apiRoute");
const ArtistProfile = require("./ArtistProfile");

app.get("/", (req, res) => {
  res.status(200);
  res.sendFile(path.join(__dirname + "/", "index.html"));
});

app.get("/artists", async (req, res) => {
  res.status(200);

  const songs = await SongModel.find();

  const a = new Array(); //artist_queries
  const b = new Array(); //artists name
  await songs.forEach((x) => {
    if (a.indexOf(x.artist_query) === -1) {
      a.push(x.artist_query);
    }
  });
  await songs.forEach((x) => {
    if (b.indexOf(x.artist) === -1) {
      b.push(x.artist);
    }
  });

  res.render("artists", {
    artist_names: b.sort(),
    artists_links: a.sort(),
  });
});

app.get("/artists/:artist_name", async (req, res) => {
  res.status(200);
  console.log("loading " + req.params.artist_name + " artist page");

  const artistData = await SongModel.find({
    artist_query: req.params.artist_name,
  });
  console.log("arist song data");
  console.log(artistData);

  //determine if artist has any explicit songs
  var hasExplicitSongs = false;
  for (var i = 0; i < artistData.length; ++i) {
    if (artistData[i].explicit == true) {
      hasExplicitSongs = true;
      break;
    }
  }

  const profile = await Profile.find({artist_query: req.params.artist_name});
  console.log('artist profile')
  console.log(profile)

  res.render("artistPage", {
    artist_data: artistData,
    artist_profile: profile,
    has_explicit_songs: hasExplicitSongs,
  });
});

app.use(apiRoutes); //all api backend

app.listen(8080, () => {
  console.log("App running on port 8080");
});
