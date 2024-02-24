import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import {
  ArtistsCollection,
  ConnectToDb,
  type Artist,
  GetRelatedArtists,
  GetHomepageData,
  GenerateArtistPageMetaDescription,
  LyricSubmissionModel,
  LyricSubmissionCollection,
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
                  family.{" "}
                  <a href="/submitlyrics" style="color: inherit">
                    Have any funny lyrics you would like to see on this site?
                  </a>
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

  app.get("/submitlyrics", (c) => {
    return c.html(
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>Submit Lyrics</title>
          <meta
            name="description"
            content="Submit your funny bad song lyrics to be featured on the site. Must include the lyric and song which it came from."
          ></meta>
          <link rel="stylesheet" href="/styles/global.css" />
          <link rel="stylesheet" href="/styles/submitlyrics.css" />
        </head>
        <body>
          <Nav />
          <main>
            <div id="container">
              <div id="banner_text">
                <h1>Submit Lyrics to be Featured on Lyricdump</h1>
                <p>
                  This site is always looking for new funny lyrics to add, if
                  you If you have any lyrics that you don't see on the site
                  already, be sure to submit the lyrics below!
                </p>
              </div>

              <form method="post" action="/submitlyrics">
                <textarea
                  name="lyric"
                  placeholder="Lyrics"
                  required
                  style="display: block; width: 70%"
                  rows={20}
                  cols={90}
                ></textarea>
                <input
                  type="text"
                  name="song"
                  placeholder="Song"
                  style="display: block; margin-top: 20px"
                  required
                />

                <button style="margin-top: 40px">Submit</button>
              </form>
            </div>
          </main>
        </body>
      </html>
    );
  });

  app.post("/submitlyrics", async (c) => {
    const body = await c.req.parseBody();

    const l = LyricSubmissionModel.safeParse(body);
    if (!l.success) {
      return c.text("There was an error while parsing form data", 500);
    }

    await LyricSubmissionCollection.insertOne(l.data);

    return c.html("lyrics successfully submitted <a href='/'>Return home</a>");
  });

  //anything below this comment is an artist route

  app.get("/:ARTIST", async (c) => {
    const artist = c.req.param("ARTIST").toLowerCase();
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
    const metaDescription = GenerateArtistPageMetaDescription(
      artistData[0].lyrics,
      artistData[0].name
    );

    return c.html(
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
          <title>{artistData[0].name}'s Worst Lyrics</title>
          {metaDescription && (
            <meta name="description" content={metaDescription}></meta>
          )}
          <link
            rel="canonical"
            href={`https://lyricdump.com/${artistData[0].artist_id}`}
          />
          <meta
            property="og:title"
            content={`${artistData[0].name}'s Worst Lyrics`}
          />
          <meta
            property="og:url"
            content={`https://lyricdump.com/${artistData[0].artist_id}`}
          />
          <meta property="og:site_name" content="Lyricdump" />

          {artistData[0].has_profile_img && (
            <meta
              property="og:image"
              content={`https://lyricdump.com/imgs/artists/${artistData[0].artist_id}.png`}
            />
          )}
          <meta
            property="og:description"
            content={`Discover ${artistData[0].name}'s Worst Lyrics`}
          />

          <meta name="twitter:card" content="summary_large_image" />
          <meta
            name="twitter:title"
            content={`${artistData[0].name}'s Worst Lyrics`}
          />
          <meta
            name="twitter:description"
            content={`Discover ${artistData[0].name}'s Worst Lyrics`}
          />
          {artistData[0].has_profile_img && (
            <meta
              name="twitter:image"
              content={`https://lyricdump.com/imgs/artists/${artistData[0].artist_id}.png`}
            />
          )}

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

// permanently redirect any request that matches old sites url artist route
// ex: /artists/{ARTIST} => /{ARTIST}
app.get("/artists/:ARTIST", (c) => {
  const artist = c.req.param("ARTIST").toLowerCase();
  return c.redirect(`/${artist}`, 301);
});

Bun.serve({
  fetch: app.fetch,
  port: 8080,
});
