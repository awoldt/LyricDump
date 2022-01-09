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

function metaDescriptionGeneration(x) {
  //more than 3 artists
  if (x.length > 3) {
    var randomIndexUsed = new Array(); //stores the random index to be picked from artist array
    var artistsToDisplay = new Array();

    //pick 3 random names
    for (i = 0; i < 3; ++i) {
      var randomPick = Math.floor(Math.random() * x.length);

      //if random artist has not been added
      if (randomIndexUsed.indexOf(randomPick) == -1) {
        randomIndexUsed.push(randomPick); //push index of x used
        artistsToDisplay.push(x[randomPick].artist); //push the random artists
        //artist has been added
      } else {
        var randomPick2 = Math.floor(Math.random() * x.length);

        //while the index has already been used
        while (randomIndexUsed.indexOf(randomPick2) == 1) {
          randomPick2 = Math.floor(Math.random() * x.length);
        }

        artistsToDisplay.push(x[randomPick2].artist);
      }
    }

    return (
      "Some of the worst rap lyrics of " +
      x[0].release_date +
      " including lyrics from artists like " +
      artistsToDisplay[0] +
      ", " +
      artistsToDisplay[1] +
      ", and " +
      artistsToDisplay[2]
    );
  }
  //less than 3 artists
  else {

    if(x.length == 3) {
      return (
        "Some of the worst rap lyrics of " +
        x[0].release_date +
        " including lyrics from artists " +
        x[0].artist +
        ", " +
        x[1].artist + 
        ', and ' +
        x[2].artist
      );
    }
    else if (x.length == 2) {
      return (
        "Some of the worst rap lyrics of " +
        x[0].release_date +
        " including lyrics from artists " +
        x[0].artist +
        " and " +
        x[1].artist
      );
    } else if (x.length == 1) {
      return (
        "Some of the worst rap lyrics of " +
        x[0].release_date +
        " including lyrics from " +
        x[0].artist
      );
    }
  }
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

  const metaDescripton = metaDescriptionGeneration(songs);

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
      meta_description: metaDescripton,
    });
  }
});

module.exports = router;
