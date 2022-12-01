import {
  GET_FEATURED_LYRICS,
  GET_FILTERED_RANDOM_LYRIC,
  GET_HOMEPAGE_DISPLAY_STATS,
  GET_MOST_POPULAR_ARTISTS,
  GET_RANDOM_LYRIC,
} from "./FUNCTIONS";
import lyric from "./interfaces/lyric";
import { Router } from "express";
import filtered_lyric_query from "./interfaces/filtered_query_lyric";
import homepage_display_stats from "./interfaces/homepage_display_stats";
import featured_lyric from "./interfaces/featured_lyrics";
import top_artists from "./interfaces/top_artists_aggregate";

const router = Router();

// (/)
router.get("/", async (req, res) => {
  try {
    const homepageStats: homepage_display_stats | null =
      await GET_HOMEPAGE_DISPLAY_STATS();

    const featuredLyrics: featured_lyric[] | null = await GET_FEATURED_LYRICS();

    res.render("homepage.ejs", {
      featured_lyrics: featuredLyrics,
      homepage_stats: homepageStats,
    });
  } catch (e) {
    console.log("error: could not get featured lyrics");
    res.send("error");
  }
});

// (/artists)
router.get("/artists", async (req, res) => {
  const topArtists: top_artists[] | null = await GET_MOST_POPULAR_ARTISTS();
  console.log(topArtists);

  res.render("artists", {
    top_artists: topArtists,
  });
});

///////////////////////////////////////////////////
//API ENPOINTS
///////////////////////////////////////////////////

// (/api)
router.get("/api", async (req, res) => {
  //?FILTER
  if (Object.keys(req.query).length !== 0) {
    const filter: filtered_lyric_query = req.query;
    const l: object | null = await GET_FILTERED_RANDOM_LYRIC(filter);

    //if no object keys, query doesnt match any lyrics
    if (l !== null) {
      if (Object.keys(l!).length === 0) {
        res.status(404).json({ message: "No lyrics match current query" });
      } else {
        res.send(l);
      }
    } else {
      res
        .status(400)
        .send("Error while fetching random lyric with current query");
    }
  }
  //RANDOM
  else {
    const l: lyric | null = await GET_RANDOM_LYRIC();
    l !== null
      ? res.json(l)
      : res.status(500).send("Error while fetching random lyric");
  }
});

export default router;
