require("dotenv").config();

const express = require("express");
const app = express();
const path = require("path");
const dbConnect = require("./DB_connect");
const SongModel = require("./SongModel");
const Profile = require("./ArtistProfile");

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

  //get all artist queries first
  const artistLinks = new Array();
  await songs.forEach(async (x) => {
    if (artistLinks.indexOf(x.artist_query) === -1) {
      await artistLinks.push(x.artist_query);
    }
  });
  console.log(artistLinks.sort());

  //findone of each artist name using artist query above
  const artistNames = new Array();
  for (i = 0; i < artistLinks.length; ++i) {
    const name = await SongModel.findOne({ artist_query: artistLinks[i] });
    console.log(name.artist);
    await artistNames.push(name.artist);
  }

  res.render("artists", {
    artist_names: artistNames,
    artists_links: artistLinks,
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

  const profile = await Profile.find({ artist_query: req.params.artist_name });
  console.log("artist profile");
  console.log(profile);

  //if artist has only explicit songs to show, make sure search engines cannot index
  var shouldIndex = false; //will be true if seach engine SHOULD index
  for (var i = 0; i < artistData.length; ++i) {
    if (artistData[i].explicit !== true) {
      shouldIndex = true;
      break;
    }
  }

  res.render("artistPage", {
    artist_data: artistData,
    artist_profile: profile,
    has_explicit_songs: hasExplicitSongs,
    should_index: shouldIndex,
  });
});

app.use(apiRoutes); //all api backend

app.listen(8080, () => {
  console.log("App running on port 8080");
});
