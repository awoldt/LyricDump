const express = require("express");
const router = express.Router();
const SongModel = require("../SongModel");

router.get("/year", async (req, res) => {
  res.status(200);

  const allSongs = await SongModel.find();

  var y = new Array();
  allSongs.forEach((x) => {
    if (y.indexOf(x.release_date) == -1) {
      y.push(x.release_date);
    }
  });

  y = y.sort();

  const returnData = await Promise.all(
    y.map(async (x) => {
      const songsInYear = await SongModel.find({ release_date: x });

      return {
        year: x,
        songs_in_year: songsInYear,
      };
    })
  );

  console.log(returnData);

  res.render("year", {
    data: returnData,
  });
});

module.exports = router;
