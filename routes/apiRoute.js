const express = require("express");
const router = express.Router();
const SongModel = require("../SongModel");

router.get("/api", async (req, res) => {
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

router.get("/api/filter", async (req, res) => {
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
    console.log("SINGLE QUERY");
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
        const r = Math.floor(Math.random() * results.length);

        res.status(200);
        res.json(results[r]);
      }
      //EXPLICIT
    } else if (query.hasOwnProperty("explicit")) {
      console.log("explicit query");

      if (query.explicit !== "true" && query.explicit !== "false") {
        res.status(400);
        res.json({
          message: "explicit query can only be true or false",
        });
      } else {
        const results = await SongModel.find({
          explicit: query.explicit,
        });
        console.log(results);

        //404
        //no songs with current artist
        if (results.length == 0) {
          res.status(404);
          res.json({
            message:
              "no songs could be found with current query (explicit=" +
              query.explicit +
              ")",
          });
          //200
        } else {
          const r = Math.floor(Math.random() * results.length);

          res.status(200);
          res.json(results[r]);
        }
      }
      //YEAR
    } else if (query.hasOwnProperty("year")) {
      console.log("year query!");
      res.status(200);

      const results = await SongModel.find({ release_date: query.year });
      console.log(results);

      //404
      if (results.length == 0) {
        res.status(404);
        res.json({
          message: "could not find any songs that came out in " + query.year,
        });
      }
      //200
      else {
        const r = Math.floor(Math.random() * results.length);

        res.json(results[r]);
      }
    } else {
      res.status(400);
      res.json({
        message: "query paramter not supported",
      });
    }
  }
  //MULTI-QUERY
  else {
    const m = new Object();
    if (query.hasOwnProperty("artist")) {
      m.artist_query = query.artist;
    }
    if (query.hasOwnProperty("explicit")) {
      m.explicit = query.explicit;
    }
    if (query.hasOwnProperty("year")) {
      m.release_date = query.year;
    }

    //if there is a explicit query in url, make sure it equals true or false
    if (query.hasOwnProperty("explicit")) {
      if (query.explicit !== "true" && query.explicit !== "false") {
        res.status(400);
        res.json({
          message: "explicit query can only be true or false",
        });
      } else {
        const results = await SongModel.find(m);
        console.log(results);

        //404
        if (results.length == 0) {
          res.status(404);
          res.json({
            message: "cannot find any songs with current query",
          });
        }
        //200
        else {
          res.status(200);

          const r = Math.floor(Math.random() * results.length);

          res.json(results[r]);
        }
      }
    } else {
      const results = await SongModel.find(m);
      console.log(results);

      //404
      if (results.length == 0) {
        res.status(404);
        res.json({
          message: "cannot find any songs with current query",
        });
      }
      //200
      else {
        res.status(200);

        const r = Math.floor(Math.random() * results.length);

        res.json(results[r]);
      }
    }
  }
});

module.exports = router;
