import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import {
  ArtistsCollection,
  ConnectToDb,
  type Artist,
  GetRelatedArtists,
  GetHomepageData,
} from "./utils";
import ArtistPage from "./views/Artist";
import Nav from "./views/components/Nav";
import RecentlyAddedLyrics from "./views/components/Home/RecentlyAddedLyrics";
import TopArtist from "./views/components/Home/PopularArtists";
import FeaturedLyrics from "./views/components/Home/FeaturedLyrics";
const app = new Hono();

app.use("*", serveStatic({ root: "./public" }));

if (await ConnectToDb()) {
  app.get("/", async (c) => {
    const homepageData = await GetHomepageData();
    if (homepageData === null) {
      return c.text("There was an error while getting data from backend :(");
    }

    return c.html(
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>
            LyricDump - Collection of the Worst Song Lyrics of all Time
          </title>
          <link rel="stylesheet" href="/styles/global.css" />
          <link rel="stylesheet" href="/styles/home.css" />
        </head>
        <body>
          <main>
            <div id="container">
              <div id="banner_text">
                <h1>A Collection of the Dumbest Song Lyrics of All Time</h1>
                <p>
                  Lyricdump is a archive of some of the worst song lyrics ever.
                  Lyrics so strange that it might make you wonder why an artist
                  had it in their song. Spanning many genres, this site is the
                  one-stop shop for hilarious lyrics to share with friends and
                  family.
                </p>
              </div>

              <FeaturedLyrics lyrics={homepageData.featuredLyrics} />
              <RecentlyAddedLyrics lyrics={homepageData.recentLyrics} />

              <TopArtist topArtist={homepageData.topArtist} />
            </div>
          </main>
        </body>
      </html>
    );
  });

  app.get("/:ARTIST", async (c) => {
    const artist = c.req.param("ARTIST");
    const artistData = await ArtistsCollection.aggregate<Artist>([
      {
        $match: {
          artist_id: artist,
        },
      },
      {
        $project: {
          _id: 0,
          "lyrics._id": 0,
        },
      },
      {
        $lookup: {
          from: "lyrics_v2",
          localField: "artist_id",
          foreignField: "artist_id",
          as: "lyrics",
        },
      },
    ]).toArray();

    if (artistData.length === 0) {
      return c.notFound();
    }

    artistData[0].lyrics?.sort((a: any, b: any) => {
      return b.year - a.year;
    });

    const relatedArtists = await GetRelatedArtists(artist);

    return c.html(
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>rawr</title>
          <link rel="stylesheet" href="/styles/global.css" />
          <link rel="stylesheet" href="/styles/artist.css" />
        </head>
        <body>
          <Nav />
          <main>
            <div id="container" style="text-align: center">
              <ArtistPage
                artistData={artistData[0]}
                relatedArtists={relatedArtists}
              />
            </div>
          </main>
        </body>
      </html>
    );
  });
} else {
  app.get("*", (c) => {
    return c.text("There was an error while connecting to database :(");
  });
}

Bun.serve({
  fetch: app.fetch,
  port: 8080,
});
