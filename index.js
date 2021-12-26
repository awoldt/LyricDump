require("dotenv").config();

const express = require("express");
const app = express();
const path = require("path");
const SongModel = require("./SongModel");
const dbConnect = require("./DB_connect");

dbConnect();


app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname + "/", "index.html"));
});

app.get("/api", async (req, res) => {
  const songData = await SongModel.find({});

  const randomPick = Math.floor(Math.random() * songData.length); //0 to length of how many songs

  res.json({
    lyrics: songData[randomPick].toObject().lyrics,
    artist: songData[randomPick].toObject().artist,
    song: songData[randomPick].toObject().song,
    release_date: songData[randomPick].toObject().release_date,
    explicit: songData[randomPick].toObject().explicit,
  });
});

app.get("/api/filter", async (req, res) => {
  const query = req.query;
  console.log(query);

  const queryLength = Object.keys(query).length;

  //ERROR: user did not add query paramter in url
  if (queryLength == 0) {
    res.status(400);
    res.json({
      error_mesage: "must add query to url",
    });
    //SINGLE QUERY
  } else if (queryLength == 1) {
    console.log(query);

    //ARTIST
    if (query.hasOwnProperty("artist")) {
      console.log("\nartist query");
      const results = await SongModel.find({
        artist_query: query.artist,
      });
      console.log(results);

      //404
      //no songs with current artist
      if (results.length == 0) {
        res.status(404);
        res.json({
          message:
            "no songs could be found with current artist (" +
            query.artist +
            ")",
        });
        //200
      } else {
        res.status(200);
        res.json({ total_results: results.length, data: results });
      }
    } else {
      res.json({ message: "only artist rn!!!" });
    }

    res.json({
      message: "SINGLE query!",
    });
  }
  //MULTI-QUERY
  else {
    res.status(200);
    res.json({
      message: "multi query",
    });
  }
});

app.listen(8080, () => {
  console.log("App running on port 8080");
});
