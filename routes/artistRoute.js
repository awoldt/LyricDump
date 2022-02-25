const express = require("express");
const router = express.Router();
const SongModel = require("../SongModel");
const ArtistProfile = require("../ArtistProfile");

const { Storage } = require("@google-cloud/storage");

//gets all years featured in lyrics
async function getYearsRange(songs) {
  var x = new Array();
  songs.forEach((item) => {
    if (x.indexOf(item.release_date) == -1) {
      x.push(item.release_date);
    }
  });

  return x.sort();
}

async function getProfile(a) {
  const x = await ArtistProfile.find({ artist_query: a.artist_query });

  if (x.length == 0) {
    return undefined;
  } else {
    return x;
  }
}

router.get("/artists", async (req, res) => {
  try {
    const googleCloudStorage = new Storage({
      keyFilename: "bad-rap-api-v2-c3bb8ce441f7.json",
    });

    const bucketData = await googleCloudStorage
      .bucket("year-json-data")
      .file("artists.json")
      .createReadStream();
    var buffer = "";
    bucketData
      .on("data", (x) => {
        buffer += x;
      })
      .on("end", () => {
        res.status(200);

        res.render("artists", {
          organized_data: JSON.parse(buffer),
        });
      });
  } catch (e) {
    res.status(500);
    res.send(null);
  }
});

router.get("/artists/:id", async (req, res) => {
  const artistData = await SongModel.find({ artist_query: req.params.id }).sort(
    { date_added: -1 }
  );

  //404
  if (artistData.length == 0) {
    res.status(404);
    res.send("Cannot find artist");
  }
  //200
  else {
    try {
      const googleCloudStorage = new Storage({
        keyFilename: "bad-rap-api-v2-c3bb8ce441f7.json",
      });

      const bucketData = await googleCloudStorage
        .bucket("year-json-data")
        .file("artistpage.json")
        .createReadStream();
      var buffer = "";
      bucketData
        .on("data", (x) => {
          buffer += x;
        })
        .on("end", async () => {
          res.status(200);
          const yearsRange = await getYearsRange(artistData);

          const hasExplicitSong = await SongModel.find({
            artist_query: req.params.id,
            explicit: true,
          });

          const profile = await getProfile(artistData[0]);

          //related_artists index of the current artist
          const r = JSON.parse(buffer).related_artist_data;
          const index = r.findIndex((i) => i.artist === req.params.id);

          res.render("artistPage", {
            artist_data: artistData,
            has_explicit_song: hasExplicitSong,
            lyrics_years_range: yearsRange,
            artist_profile: profile,
            related_artists: r[index].related_artists,
          });
        });
    } catch (e) {
      res.status(500);
      res.send("There are an error while processing your request :(");
    }
  }
});

module.exports = router;
