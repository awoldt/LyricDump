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

async function getRelatedArtists(current_artist) {
  //only grab artists that have profiles in database
  const x = await ArtistProfile.find();
  //randomly pick 3 artists
  const y = new Array();
  const indexs = new Array();
  while (y.length !== 3) {
    const randomIndex = Math.floor(Math.random() * x.length); //0 and length of artists with profiles

    if (indexs.indexOf(randomIndex) == -1) {
      indexs.push(randomIndex);
      //make sure not same artist as page viewing
      if (x[randomIndex].artist_query !== current_artist) {
        y.push(x[randomIndex]);
      }
    }
  }

  return y;
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
        console.log("FROMMMM BUICKETTTT");

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
    res.status(200);
    const yearsRange = await getYearsRange(artistData);

    const hasExplicitSong = await SongModel.find({
      artist_query: req.params.id,
      explicit: true,
    });

    const profile = await getProfile(artistData[0]);

    const relatedRappers = await getRelatedArtists(req.params.id);

    res.render("artistPage", {
      artist_data: artistData,
      has_explicit_song: hasExplicitSong,
      lyrics_years_range: yearsRange,
      artist_profile: profile,
      related_artists: relatedRappers,
    });
  }
});

module.exports = router;
