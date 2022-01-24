const express = require("express");
const router = express.Router();
const SongModel = require("../SongModel");
const ArtistProfile = require("../ArtistProfile");

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

async function organizeYearData(yearData) {
  const alex = await Promise.all(
    yearData.map(async (year, yearIndex) => {
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

      const dataWithImages = await Promise.all(
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

          return null;
        })
      );

      return { year: year.year, artist_data: asdf };
    })
  );

  return alex;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////

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

  const organizedData = await organizeYearData(returnData);
  const mostLyrics = yearsWithMostLyrics(returnData);

  res.render("year", {
    years_with_most_lyrics: mostLyrics,
    organized_data: organizedData,
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
