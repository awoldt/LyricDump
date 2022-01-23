const express = require("express");
const router = express.Router();
const SongModel = require("../SongModel");
const ArtistProfile = require("../ArtistProfile");

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
  res.status(200);
  const allArtistData = await organizeAristList();
  const mostLyrics = await rapperWithMostLyrics(allArtistData);
  const n = [...allArtistData];

  const popularArtists = n.sort(
    ({ artist_num_of_songs: a }, { artist_num_of_songs: b }) => b - a
  );

  popularArtists.length = 5;

  res.render("artists", {
    artist_data: allArtistData,
    most_lyrics: mostLyrics,
    popular_artists: popularArtists,
  });
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
