const express = require("express");
const router = express.Router();

const SongModel = require("../SongModel");
const ArtistProfile = require("../ArtistProfile");

const { Storage } = require("@google-cloud/storage");
const googleCloudStorage = new Storage({
  keyFilename: "bad-rap-api-v2-c3bb8ce441f7.json",
});

//sorts array of objects
function alphabetize(a, b) {
  if (a.artist_query < b.artist_query) {
    return -1;
  }
  if (a.artist_query > b.artist_query) {
    return 1;
  }

  return 0;
}

async function organizeYearData(yearData) {
  const o = await Promise.all(
    yearData.map(async (year) => {
      var addedArtists = new Array();
      var added = new Array();

      year.songs_in_year.forEach((songs) => {
        if (added.indexOf(songs.artist_query) == -1) {
          added.push(songs.artist_query);
          addedArtists.push({
            artist_name: songs.artist,
            artist_query: songs.artist_query,
          });
        }
      });

      const asdf = new Array();

      await Promise.all(
        addedArtists.map(async (x) => {
          var img = await ArtistProfile.find({ artist_query: x.artist_query });

          if (img.length == 0) {
            asdf.push({
              artist_name: x.artist_name,
              artist_query: x.artist_query,
              artist_img: null,
            });
          } else {
            asdf.push({
              artist_name: x.artist_name,
              artist_query: x.artist_query,
              artist_img: img[0].img_href,
            });
          }

          asdf.sort(alphabetize);
        })
      );

      return {
        year: year.year,
        total_lyrics: year.songs_in_year,
        artist_data: asdf,
      };
    })
  );

  return o;
}

router.get("/cron/year", async (req, res) => {
  console.log("generating new year json data!");

  //MAKE SURE ITS GOOGLE RUNNING THE CRON JOB
  if (req.headers["user-agent"] !== "Google-Cloud-Scheduler") {
    res.status(403);
    res.send("access denied");
  } else {
    const allSongs = await SongModel.find();
    var y = new Array(); //array of all unqiue years stored in database
    allSongs.forEach((x) => {
      if (y.indexOf(x.release_date) == -1) {
        y.push(x.release_date);
      }
    });
    y = y.sort();

    //will fetch lyric data for each year
    const returnData = await Promise.all(
      y.map(async (x) => {
        const songsInYear = await SongModel.find({ release_date: x });

        return {
          year: x,
          songs_in_year: songsInYear,
        };
      })
    );

    const organizedData = await organizeYearData(returnData);

    try {
      await googleCloudStorage
        .bucket("year-json-data")
        .file("year.json")
        .save(JSON.stringify(organizedData), (err) => {
          if (err) {
            res.status(500);
            console.log(err);
            res.send("error");
          } else {
            res.status(200);
            console.log("NEW YEAR DATA SAVED!");
            res.send(null);
          }
        });
    } catch (e) {
      res.status(500);
      console.log("error updating year data at /cron/year");
      res.send("error");
    }
  }
});

module.exports = router;
