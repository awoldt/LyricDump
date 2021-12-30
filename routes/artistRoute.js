const express = require("express");
const router = express.Router();
const SongModel = require("../SongModel");
const ArtistProfile = require("../ArtistProfile");

//fetches all songs and orders them by artists, num of songs by each artist, and link to each artistpage
async function organizeAristList() {
  const allSongs = await SongModel.find();

  var artistQueries = new Array();
  allSongs.forEach((x) => {
    if (artistQueries.indexOf(x.artist) == -1) {
      artistQueries.push(x.artist);
    }
  });

  artistQueries = artistQueries.sort(); //artist A-Z by order of display name, not query name

  const returnData = await Promise.all(
    artistQueries.map(async (x) => {
      const y = await SongModel.find({ artist: x });

      return {
        artist_name: y[0].artist,
        artist_href: "/artists/" + y[0].artist_query,
        artist_num_of_songs: y.length,
      };
    })
  );

  console.log("ALL DATA BELOW");

  return returnData;
}

//gets the range of years the artist's lyrics are from
async function getYearsRange(songs) {
  console.log("yers range!!");
  console.log(songs);

  var x = new Array();
  songs.forEach((item) => {
    if (x.indexOf(item.release_date) == -1) {
      x.push(item.release_date);
    }
  });

  //artist has lyrics in only one year
  if (x.length == 1) {
    return null;
  }
  //artist has songs in multiple years
  else {
    return x.sort();
  }
}

router.get("/artists", async (req, res) => {
  res.status(200);

  const allArtistData = await organizeAristList();

  res.render("artists", {
    artist_data: allArtistData,
  });
});

router.get("/artists/:id", async (req, res) => {
  res.status(200);
  const artistData = await SongModel.find({ artist_query: req.params.id });

  console.log(artistData);

  const yearsRange = await getYearsRange(artistData);

  const hasExplicitSong = await SongModel.find({
    artist_query: req.params.id,
    explicit: true,
  });

  const artistProfile = await ArtistProfile.find({
    artist_query: req.params.id,
  });

  res.render("artistPage", {
    artist_data: artistData,
    has_explicit_song: hasExplicitSong,
    artist_profile: artistProfile,
    lyrics_years_range: yearsRange,
  });
});

module.exports = router;
