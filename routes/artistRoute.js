const express = require("express");
const router = express.Router();
const SongModel = require("../SongModel");

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
  console.log(artistQueries);

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
  console.log(returnData);

  return returnData;
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

  res.render("artistPage", {
    artist_data: artistData,
  });
});

module.exports = router;
