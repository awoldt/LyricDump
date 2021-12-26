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

        const r = Math.floor(Math.random() * results.length); //0 to length of how many songs


        res.status(200);
        res.json(results[r]);
      }
    } else {
      res.json({ message: "only artist rn!!!" });
    }

  
  }
  //MULTI-QUERY
  else {
    


    const m = new Object();
    if(query.hasOwnProperty('artist')) {
      m.artist_query = query.artist;
    }
    if(query.hasOwnProperty('explicit')) {
      m.explicit = query.explicit;
    }

    console.log(m);

    const results = await SongModel.find(m);
    console.log(results)

    //404
    if(results.length == 0) {
      res.status(404);
      res.json({
        message: 'cannot find any songs with current query'
      })
    }
    //200
    else {
      res.status(200);
      res.json({
        message: 'found data!'
      })
    }







  }
});

app.listen(8080, () => {
  console.log("App running on port 8080");
});
