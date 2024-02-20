import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import HomePage from "./views/Home";
import {
  ArtistsCollection,
  ConnectToDb,
  HomepageLyricsCollection,
  type Artist,
  GetRelatedArtists,
} from "./utils";
import ArtistPage from "./views/Artist";
import Nav from "./views/components/Nav";
const app = new Hono();

app.use("*", serveStatic({ root: "./public" }));

if (await ConnectToDb()) {
  app.get("/", async (c) => {
    const lyrics = await HomepageLyricsCollection.find(
      {},
      { projection: { _id: 0 } }
    ).toArray();

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
          <Nav />
          <main>
            <div id="container">
              <HomePage lyrics={lyrics} />
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
