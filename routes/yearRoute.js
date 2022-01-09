const express = require("express");
const router = express.Router();
const SongModel = require("../SongModel");

function yearsWithMostLyrics(songs) {
  var years = new Array();
  var currentHighestNum = 0;

  songs.forEach((x) => {
    //only want years with more than 1 lyric
    if (x.songs_in_year.length > 1) {
      if (x.songs_in_year.length == currentHighestNum) {
        years.push(x.year);
      } else if (x.songs_in_year.length > currentHighestNum) {
        years.length = 0;
        currentHighestNum = x.songs_in_year.length;
        years.push(x.year);
      }
    }
  });

  return years;
}

function featuresArtists(lyrics) {
  var artists = new Array();
  var artistsAdded = new Array();

  function alphabetize(a, b) {
    if (a.artist_query < b.artist_query) {
      return -1;
    }
    if (a.artist_query > b.artist_query) {
      return 1;
    }

    return 0;
  }

  for (i = 0; i < lyrics.length; ++i) {
    var obj = new Object();
    //artist is already stored
    if (artistsAdded.indexOf(lyrics[i].artist) == -1) {
      artistsAdded.push(lyrics[i].artist);
      obj.artist_query = lyrics[i].artist_query;
      obj.artist_name = lyrics[i].artist;
      artists.push(obj);
    } 
  }
  artists.sort(alphabetize);
  return artists;
}

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

  const mostLyrics = yearsWithMostLyrics(returnData);

  res.render("year", {
    data: returnData,
    years_with_most_lyrics: mostLyrics,
  });
});

router.get("/year/:id", async (req, res) => {
  const songs = await SongModel.find({ release_date: req.params.id }).sort({
    date_added: -1,
  });

  const featuredArtist = featuresArtists(songs);

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
    res.render("yearPage", {
      year: req.params.id,
      song_data: songs,
      contains_explicit_lyrics: hasExplicitLyrics,
      featured_artists: featuredArtist,
    });
  }
});

module.exports = router;
