const express = require("express");
const router = express.Router();

const SongModel = require("../SongModel");
const ArtistProfile = require("../ArtistProfile");

const { Storage } = require("@google-cloud/storage");
const googleCloudStorage = new Storage({
  keyFilename: "bad-rap-api-v2-c3bb8ce441f7.json",
});

const fetch = require("node-fetch");

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
          const n = await SongModel.find({
            release_date: year.year,
            artist_query: x.artist_query,
          });

          if (img.length == 0) {
            asdf.push({
              artist_name: x.artist_name,
              artist_query: x.artist_query,
              artist_img: null,
              num_of_lyrics_in_year: n.length,
            });
          } else {
            asdf.push({
              artist_name: x.artist_name,
              artist_query: x.artist_query,
              artist_img: img[0].img_href,
              num_of_lyrics_in_year: n.length,
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

//fetches all songs and orders them by artists, num of songs by each artist, and link to each artistpage
async function organizeAristList() {
  const allSongs = await SongModel.find();

  var artistQueries = new Array();
  allSongs.forEach((x) => {
    if (artistQueries.indexOf(x.artist) == -1) {
      artistQueries.push(x.artist);
    }
  });

  artistQueries = artistQueries.sort(); //artist A-Z by order of display name, not query name

  const returnData = await Promise.all(
    artistQueries.map(async (x) => {
      const y = await SongModel.find({ artist: x });

      return {
        artist_name: y[0].artist,
        artist_href: "/artists/" + y[0].artist_query,
        artist_num_of_songs: y.length,
      };
    })
  );

  return returnData;
}

//will display the rappers who have the most lyrics stored in the database
//LOOPS THROUGH THE RETURNDATA ARRAY FROM ABOVE FUNCTION
async function rapperWithMostLyrics(x) {
  var rappers = new Array();
  var currentHighestNum = 0;

  x.forEach((artist) => {
    //only want artists with more than 1 lyric
    if (artist.artist_num_of_songs > 1) {
      if (artist.artist_num_of_songs == currentHighestNum) {
        rappers.push(artist.artist_name);
        //rapper has same amount of lyrics as recent hightest, also add
      } else if (artist.artist_num_of_songs > currentHighestNum) {
        rappers.length = 0;
        currentHighestNum = artist.artist_num_of_songs;
        rappers.push(artist.artist_name);
      }
    }
  });

  return rappers;
}

//will go through all the years stored in database and determine the worst
//more than 1 year can be returned
function yearWithMostLyrics(yearData) {
  var yearWithMost = new Array();
  var l = 0; //lyrics in each year
  for (i = 0; i < yearData.length; ++i) {
    if (yearData[i].total_lyrics.length > l) {
      yearWithMost = [];
      l = yearData[i].total_lyrics.length;
      yearWithMost.push(yearData[i].year);
    } else if (yearData[i].total_lyrics.length == l) {
      yearWithMost.push(yearData[i].year);
    }
  }

  return yearWithMost;
}

//returns an array of all the years stored in database
async function generateUniqueYearData(lyricData) {
  var years = new Array();

  for (i = 0; i < lyricData.length; ++i) {
    if (years.indexOf(lyricData[i].release_date) == -1) {
      years.push(lyricData[i].release_date);
    }
  }

  const returnData = await Promise.all(
    years.sort().map(async (y) => {
      const data = await SongModel.find({ release_date: y }).sort({
        date_added: -1,
      });

      //get all the unique artists in each year
      var uniqueArtists = new Array();
      for (i = 0; i < data.length; ++i) {
        if (uniqueArtists.indexOf(data[i].artist_query) == -1) {
          uniqueArtists.push(data[i].artist_query);
        }
      }

      //get the artist_query and artist_name for each unique artist in each year
      //then check to see if artist currently has img stored
      const returnArtistData = await Promise.all(
        uniqueArtists.sort().map(async (aa) => {
          var artistNameData = await SongModel.findOne({ artist_query: aa });

          var artistImg = await ArtistProfile.find({ artist_query: aa });

          if (artistImg.length == 0) {
            return {
              artist_name: artistNameData.artist,
              artist_query: aa,
              artist_img: null,
            };
          } else {
            return {
              artist_name: artistNameData.artist,
              artist_query: aa,
              artist_img: artistImg[0].img_href,
            };
          }
        })
      );

      return {
        year: y,
        lyric_data: data,
        artist_data: returnArtistData,
      };
    })
  );

  return returnData;
}

async function mostRecentSongsAdded() {
  //fetches the last 9 lyrics and displayes to user
  const data = await SongModel.find().sort({ date_added: -1 });
  data.length = 9;

  var explicit = false;

  const returnData = await Promise.all(
    data.map(async (x) => {
      if (x.explicit) {
        explicit = true;
      }

      return {
        artist_name: x.artist,
        artist_query: x.artist_query,
        lyric: x.lyrics,
        explicit: x.explicit,
      };
    })
  );

  //returns 5 most recent lyrics [0], and if there should be explicit alert if any songs are explicit [1]
  return [returnData, explicit];
}

async function getChartData(years) {
  const numLyricsEachYear = await Promise.all(
    years.map(async (x) => {
      const data = await SongModel.find({ release_date: x });
      return data.length;
    })
  );

  //[0] is the labels
  //[1] is data for each label
  return [years, numLyricsEachYear];
}

//gets 4 unique lyrics to show on homepage
//all artists must have an profile image
async function getHomepageDisplayLyrics() {
  const idsUsed = new Array();
  const artistsUsed = new Array();
  const returnData = new Array();

  while (returnData.length != 4) {
    //fetch random explicit lyric
    var x = await fetch("https://badrapapi.com/api/filter?explicit=false");
    x = await x.json();

    //make sure lyric has not already been fetched
    if (idsUsed.indexOf(x._id) == -1) {
      //make sure artist has profile img
      const p = await ArtistProfile.find({ artist_query: x.artist_query });

      if (p.length !== 0) {
        //make sure artist has not already had a lyrc been displayed
        if (artistsUsed.indexOf(x.artist_query) == -1) {
          artistsUsed.push(x.artist_query);
          idsUsed.push(x._id);
          returnData.push({
            lyric: x.lyrics,
            song: x.song,
            release_year: x.release_date,
            artist_img: p[0].img_href,
            artist_name: x.artist,
            artist_query: x.artist_query,
          });
        }
      }
    }
  }

  return returnData;
}

async function getAllUnqiueArtists() {
  const lyrics = await SongModel.find();

  var artists = new Array();
  lyrics.forEach((x) => {
    if (artists.indexOf(x.artist_query) == -1) {
      artists.push(x.artist_query);
    }
  });

  return artists;
}

/////////////////////////////////////////////////////////////////////////////////////////////////////

router.get("/cron/homepage", async (req, res) => {
  //MAKE SURE ITS GOOGLE RUNNING THE CRON JOB
  if (req.headers["user-agent"] !== "Google-Cloud-Scheduler") {
    res.status(403);
    res.send("access denied");
  } else {
    const displayLryics = await getHomepageDisplayLyrics();

    const lyrics = await SongModel.find();

    const uniqueArtists = await getAllUnqiueArtists();

    //get all the unique years in database
    var years = new Array();
    for (i = 0; i < lyrics.length; ++i) {
      if (years.indexOf(lyrics[i].release_date) == -1) {
        years.push(lyrics[i].release_date);
      }
    }

    years = years.sort();

    //get the num of lyrics dividded by 5 excluding the remander ex: 128 lyrics is 125 lyrics
    var r = lyrics.length % 5;
    if (r != 0) {
      r = lyrics.length - (lyrics.length % 5);
    } else {
      r = lyrics.length;
    }

    const returnObj = {
      data: displayLryics,
      numOfLyrics: r,
      numOfArtists: uniqueArtists.length,
      year_range: [years[0], years[years.length - 1]],
    };

    try {
      await googleCloudStorage
        .bucket("year-json-data")
        .file("homepage.json")
        .save(JSON.stringify(returnObj), (err) => {
          if (err) {
            res.status(500);
            console.log(err);
            res.send(null);
          } else {
            res.status(200);
            console.log("HOMEPAGE DATA SAVED!");
            res.send(null);
          }
        });
    } catch (e) {
      res.status(500);
      console.log("error updating year data at /cron/homepage");
      res.send(null);
    }
  }
});

router.get("/cron/year", async (req, res) => {
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

    const chartData = await getChartData(y);

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

    const mostLyricsInYear = yearWithMostLyrics(organizedData);

    const FINALRETURNASDFASD = {
      year_data: organizedData,
      year_with_most_lyrics: mostLyricsInYear,
      chart_data: chartData,
    };

    try {
      await googleCloudStorage
        .bucket("year-json-data")
        .file("year.json")
        .save(JSON.stringify(FINALRETURNASDFASD), (err) => {
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
      res.send(null);
    }
  }
});

router.get("/cron/artists", async (req, res) => {
  //MAKE SURE ITS GOOGLE RUNNING THE CRON JOB
  if (req.headers["user-agent"] !== "Google-Cloud-Scheduler") {
    res.status(403);
    res.send("access denied");
  } else {
    const recentLyricsAdded = await mostRecentSongsAdded();

    const allArtistData = await organizeAristList();
    const mostLyrics = await rapperWithMostLyrics(allArtistData);

    const n = [...allArtistData];

    const popularArtists = n.sort(
      ({ artist_num_of_songs: a }, { artist_num_of_songs: b }) => b - a
    );

    popularArtists.length = 9;

    var returnData = new Object();
    returnData.artist_data = allArtistData;
    returnData.most_lyrics = mostLyrics;
    returnData.popular_artists = popularArtists;
    returnData.recently_added_lyrics = recentLyricsAdded;

    try {
      await googleCloudStorage
        .bucket("year-json-data")
        .file("artists.json")
        .save(JSON.stringify(returnData), (err) => {
          if (err) {
            res.status(500);
            console.log(err);
            res.send(null);
          } else {
            res.status(200);
            console.log("ADDED NEW ARTIST PAGE DATA!");
            res.send(null);
          }
        });
    } catch (e) {
      res.status(500);
      console.log(e);
      res.send(null);
    }
  }
});

router.get("/cron/yearpage", async (req, res) => {
  //MAKE SURE ITS GOOGLE RUNNING THE CRON JOB
  if (req.headers["user-agent"] !== "Google-Cloud-Scheduler") {
    res.status(403);
    res.send("access denied");
  } else {
    const lyrics = await SongModel.find();

    //get all the unqiue years stored in database
    const returnData = await generateUniqueYearData(lyrics);

    try {
      await googleCloudStorage
        .bucket("year-json-data")
        .file("yearPage.json")
        .save(JSON.stringify(returnData), (err) => {
          if (err) {
            res.status(500);
            console.log(err);
            res.send(null);
          } else {
            res.status(200);
            console.log("ADDED NEW YEARPAGE DATA!");
            res.send(null);
          }
        });
    } catch (e) {
      res.status(500);
      console.log(e);
      res.send(null);
    }
  }
});

module.exports = router;
