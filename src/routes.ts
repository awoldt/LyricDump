import {
  GET_ARTISTPAGE_DATA,
  GET_FEATURED_LYRICS,
  GET_HOMEPAGE_DISPLAY_STATS,
  GET_MOST_POPULAR_ARTISTS,
  GET_MOST_USED_CUSS_WORDS,
  GET_RANDOM_LYRIC,
  GET_RAPPERS_WHO_CUSS_THE_MOST,
  GET_RECENTLY_ADDED_LYRICS,
} from "./FUNCTIONS";
import lyric from "./interfaces/lyric";
import { Router } from "express";
import homepage_display_stats from "./interfaces/homepage_display_stats";
import featured_lyric from "./interfaces/featured_lyrics";
import top_artists from "./interfaces/top_artists_aggregate";
import artist_page_data from "./interfaces/artist_page_data";
import artist_cuss_word_aggregate from "./interfaces/artist_cuss_word_aggregate";
import curse_word_occurences from "./interfaces/curse_word_occurences";
import { ARTISTS } from "./app";
import path from "path";

const router = Router();

// (/)
router.get("/", async (req, res) => {
  try {
    const homepageStats: homepage_display_stats | null =
      await GET_HOMEPAGE_DISPLAY_STATS();

    const featuredLyrics: featured_lyric[] | null = await GET_FEATURED_LYRICS();

    const initialRandomLyric = await GET_RANDOM_LYRIC(false); //the first lyric displayed cannot be explicit

    res.render("homepage.ejs", {
      featured_lyrics: featuredLyrics,
      homepage_stats: homepageStats,
      random_lyric: initialRandomLyric,
    });
  } catch (e) {
    console.log("error: could not get featured lyrics");
    res.send("error");
  }
});

// (/artists)
router.get("/artists", async (req, res) => {
  const topArtists: top_artists[] | null = await GET_MOST_POPULAR_ARTISTS();

  const recentlyAddedLyrics: lyric[] | null = await GET_RECENTLY_ADDED_LYRICS();

  const aritstsWhoCussTheMost: artist_cuss_word_aggregate[] | null =
    await GET_RAPPERS_WHO_CUSS_THE_MOST();

  const curseWordOccurences: curse_word_occurences[] | null =
    await GET_MOST_USED_CUSS_WORDS();

  res.render("artists", {
    top_artists: topArtists,
    recently_added_lyrics: recentlyAddedLyrics,
    artist_who_cuss_the_most: aritstsWhoCussTheMost,
    curseWordOccurences: curseWordOccurences,
  });
});

// (/artists/:artust_query)
router.get("/artists/:ARTIST_QUERY", async (req, res) => {
  const artistData: artist_page_data | null = await GET_ARTISTPAGE_DATA(
    req.params.ARTIST_QUERY
  );

  if (artistData === null) {
    res
      .status(404)
      .send("Cannot find artist '" + req.params.ARTIST_QUERY + "'");
  } else {
    res.render("artistPage", {
      artist_data: artistData,
    });
  }
});

///////////////////////////////////////////////////
//API ENPOINTS
///////////////////////////////////////////////////

//return random lyric
//must specify if explicit
router.get("/api/rl", async (req, res) => {
  const l: lyric | null = await GET_RANDOM_LYRIC(req.query.explicit === "true");
  l !== null
    ? res.json(l)
    : res.status(500).send("Error while fetching random lyric");
});

router.get("/api/search", async (req, res) => {
  //use search aggregator in mongodb to search artists index for relevant results
  const data = await ARTISTS.aggregate([
    { $match: { $text: { $search: String(req.query.q) } } },
    {
      $project: {
        artistName: "$name",
        artist_query: "$artist_query",
      },
    },
  ]).toArray();

  res.json(data);
});

router.get("/privacy", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "/privacy.html"));
});

export default router;
