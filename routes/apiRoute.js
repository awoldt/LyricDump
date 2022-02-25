const express = require("express");
const router = express.Router();
const SongModel = require("../SongModel");

function ifValidQuery(obj) {
  //loop through all queries provided and send 400 if contains any query that is not valid
  for (const key in obj) {
    if (key !== "artist" && key !== "explicit" && key !== "year") {
      return false;
    }
  }
  return true;
}

router.get("/api", async (req, res) => {
  res.status(200);
  res.set("X-Robots-Tag", "noindex");
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

  const queryLength = Object.keys(query).length;

  //ERROR: user did not add query paramter in url
  if (queryLength == 0) {
    res.status(400);
    res.json({
      error_mesage: "must add query to url",
    });
    //SINGLE QUERY
  } else if (queryLength == 1) {
    //ARTIST
    if (query.hasOwnProperty("artist")) {
      const results = await SongModel.find({
        artist_query: query.artist,
      });

      //404
      //no songs with current artist
      if (results.length == 0) {
        res.status(404);
        res.json({
          message:
            "no lyrics could be found with current artist (" +
            query.artist +
            ")",
        });
        //200
      } else {
        res.status(200);
        res.set("X-Robots-Tag", "noindex");
        const randomPick = Math.floor(Math.random() * results.length); //0 to length of how many songs
        res.json(results[randomPick]);
      }
      //EXPLICIT
    } else if (query.hasOwnProperty("explicit")) {
      if (query.explicit !== "true" && query.explicit !== "false") {
        res.status(400);
        res.json({
          message: "explicit query can only be true or false",
        });
      } else {
        const results = await SongModel.find({
          explicit: query.explicit,
        });

        //404
        //no songs with explicit lyrics
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
          res.status(200);
          res.set("X-Robots-Tag", "noindex");
          const randomPick = Math.floor(Math.random() * results.length); //0 to length of how many songs
          res.json(results[randomPick]);
        }
      }
      //YEAR
    } else if (query.hasOwnProperty("year")) {
      const results = await SongModel.find({ release_date: query.year });

      //404
      if (results.length == 0) {
        res.status(404);
        res.json({
          message: "could not find any songs that came out in " + query.year,
        });
      }
      //200
      else {
        res.status(200);
        res.set("X-Robots-Tag", "noindex");

        const randomPick = Math.floor(Math.random() * results.length); //0 to length of how many songs
        res.json(results[randomPick]);
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
    const validQ = ifValidQuery(query);
    //400
    if (validQ == false) {
      res.status(400);
      res.json({ error: "url contains invalid query parameter" });
    }
    //200
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
      //check is explicit query is valid
      if (m.hasOwnProperty("explicit")) {
        if (m.explicit !== "true" && m.explicit !== "false") {
          res.status(400);
          res.json({ error: "explicit query must be either true or false" });
        } else {
          const results = await SongModel.find(m);

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
            res.set("X-Robots-Tag", "noindex");
            const randomPick = Math.floor(Math.random() * results.length); //0 to length of how many songs
            res.json(results[randomPick]);
          }
        }
      }
      //no explicit query
      else {
        const results = await SongModel.find(m);
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
          res.set("X-Robots-Tag", "noindex");

          const randomPick = Math.floor(Math.random() * results.length); //0 to length of how many songs
          res.json(results[randomPick]);
        }
      }
    }
  }
});

module.exports = router;
