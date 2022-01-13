const express = require("express");
const router = express.Router();
const SongModel = require("../SongModel");
const Fuse = require("fuse.js");

router.get("/api/search", async (req, res) => {
  const artistQuery = req.query.artist;
  const songs = await SongModel.find(); //obj to filter through

  //404
  if (artistQuery == undefined) {
    res.status(400);
    res.json({ error: "invalid request" });
  } else {
    res.status(200);
    const fuse = new Fuse(songs, {
      shouldSort: true,
      threshold: 0,
      keys: ["artist"],
    });

    res.json(fuse.search(artistQuery));
  }
});

module.exports = router;
