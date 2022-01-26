const express = require("express");
const router = express.Router();
const SongModel = require("../SongModel");
const ArtistProfile = require("../ArtistProfile");

const { Storage } = require("@google-cloud/storage");

function alphabetize(a, b) {
  if (a.artist_query < b.artist_query) {
    return -1;
  }
  if (a.artist_query > b.artist_query) {
    return 1;
  }

  return 0;
}

async function featuresArtists(lyrics) {
  var artists = new Array();
  var artistsAdded = new Array();

  await Promise.all(
    lyrics.map(async (x) => {
      var obj = new Object();
      if (artistsAdded.indexOf(x.artist_query) == -1) {
        artistsAdded.push(x.artist_query);
        obj.artist_query = x.artist_query;
        obj.artist_name = x.artist;

        var img = await ArtistProfile.find({ artist_query: x.artist_query });
        if (img.length == 0) {
          obj.artist_img = null;
        } else {
          obj.artist_img = img[0].img_href;
        }

        artists.push(obj);
      }
    })
  );

  artists.sort(alphabetize);

  return artists;
}

function generateYearNavigation(years, currentYear) {
  //find where year is in data
  var indexAt = years.indexOf(currentYear);

  //first year
  if (indexAt == 0) {
    return new Array(null, indexAt + 1);
  }
  //last
  else if (indexAt == years.length - 1) {
    return new Array(indexAt - 1, null);
  }
  //everyyear inbetween
  else {
    return new Array((indexAt -= 1), (indexAt += 2));
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get("/year", async (req, res) => {
  try {
    const googleCloudStorage = new Storage({
      keyFilename: "bad-rap-api-v2-c3bb8ce441f7.json",
    });

    const bucketData = await googleCloudStorage
      .bucket("year-json-data")
      .file("year.json")
      .createReadStream();
    var buffer = "";
    bucketData
      .on("data", (x) => {
        buffer += x;
      })
      .on("end", () => {
        res.status(200);

        res.render("year", {
          organized_data: JSON.parse(buffer),
        });
      });
  } catch (e) {
    res.status(500);
    res.send("error getting data :(");
  }
});

router.get("/year/:id", async (req, res) => {
  const songs = await SongModel.find({ release_date: req.params.id }).sort({
    date_added: -1,
  });

  const featuredArtist = await featuresArtists(songs);

  var hasExplicitLyrics = false;

  //check to see if any lyrics contain explicit language
  for (var i = 0; i < songs.length; ++i) {
    if (songs[i].explicit) {
      hasExplicitLyrics = true;
      break;
    }
  }

  //404
  if (songs.length == 0) {
    res.status(404);
    res.send("Cannot find year");
  }
  //200
  else {
    const u = await SongModel.find();

    var yearsAdded = new Array();

    for (i = 0; i < u.length; ++i) {
      if (yearsAdded.indexOf(u[i].release_date) == -1) {
        yearsAdded.push(u[i].release_date);
      }
    }

    var yearIndexes = generateYearNavigation(yearsAdded.sort(), req.params.id);

    res.render("yearPage", {
      year: req.params.id,
      song_data: songs,
      contains_explicit_lyrics: hasExplicitLyrics,
      featured_artists: featuredArtist,
      year_navigation: new Array(yearsAdded.sort(), yearIndexes),
    });
  }
});

module.exports = router;
