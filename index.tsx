import { Hono } from "hono";
import { serveStatic } from "hono/bun";

import ArtistPage from "./views/pages/Artist";
import Nav from "./views/components/Nav";
import Search from "./views/components/Search";
import Homepage from "./views/Home";
import type { Artist } from "./interfaces";
import {
  ArtistsCollection,
  ConnectToDb,
  LyricSubmissionCollection,
  LyricSubmissionModel,
  pool,
} from "./db";
import {
  GenerateArtistPageMetaDescription,
  GetArtistPageData,
  GetHomepageData,
  GetRelatedArtists,
} from "./utils";
const app = new Hono();

await ConnectToDb(); // app must wait for database connection before initializing routes

app.use("*", serveStatic({ root: "./public" }));

app.get("/", async (c) => {
  const homepageData = await GetHomepageData();
  if (homepageData === null) {
    return c.text("There was an error while getting data from backend :(");
  }

  return c.html(
    <Homepage
      featuredLyrics={homepageData.featuredLyrics}
      recentLyrics={homepageData.recentLyrics}
      topArtists={homepageData.topArtist}
    />
  );
});

app.get("/catalogue", async (c) => {
  const numOfArtists = await ArtistsCollection.countDocuments();

  const artistList = await ArtistsCollection.aggregate([
    {
      $group: {
        _id: { $substr: ["$artist_id", 0, 1] },
        artists: { $push: "$$ROOT" },
      },
    },
    {
      $project: {
        artists: { _id: 0 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]).toArray();

  artistList.forEach((x) => {
    x.artists.sort((a: any, b: any) => {
      return a.name - b.name;
    });
  });

  return c.html(
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        ></link>
        <title>List of Artists</title>
        <meta
          name="description"
          content="View the entire list of artists featured on lyricdump. Browse through our collection and discover your favorite aritst's bad lyrics."
        ></meta>
        <link rel="stylesheet" href="/styles/global.css" />
        <link rel="stylesheet" href="/styles/catalogue.css" />
      </head>
      <body>
        <Nav />
        <main>
          <div className="container-holder">
            <div class="container">
              <h2>ALL ARTISTS</h2>
              {/* <h1>
                There are currently {numOfArtists} artists stored in our
                database.
              </h1> */}

              {artistList.map((x) => {
                if (!/^[a-zA-Z]+$/.test(x._id)) {
                  return (
                    <div class="lyric-container">
                      <div style="margin-bottom: 1rem;">
                        <span># ({x.artists.length})</span>
                      </div>
                      {x.artists.map((y: Artist) => {
                        return (
                          <div class="lyric-holder">
                            <a href={`/${y.artist_id}`} class="artist-link">
                              {y.name}
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  );
                } else {
                  return (
                    <div class="lyric-container">
                      <div style="margin-bottom: 1rem;">
                        <span>
                          {x._id.toUpperCase()} ({x.artists.length})
                        </span>
                      </div>
                      {x.artists.map((y: Artist) => {
                        return (
                          <div class="lyric-holder">
                            <a href={`/${y.artist_id}`} class="artist-link">
                              {y.name}
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  );
                }
              })}
            </div>
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        ></link>
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
          <div class="container-holder">
            <div class="container">
              <h2>SUBMIT</h2>
              {/* <p>
                  This site is always looking for new funny lyrics to add, if
                  you If you have any lyrics that you don't see on the site
                  already, be sure to submit your lyrics below!
                </p> */}

              <form method="post" action="/submitlyrics">
                <textarea
                  name="lyric"
                  placeholder="Lyrics"
                  required
                  rows={10}
                ></textarea>
                <input
                  type="text"
                  name="song"
                  placeholder="Song"
                  style="display: block; margin-top: 20px"
                  required
                />

                <button style="margin-top: 2rem">SUBMIT LYRICS</button>
              </form>
            </div>
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

app.get("/privacy", (c) => {
  return c.html(
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        ></link>
        <title>Privacy Policy</title>
        <link rel="stylesheet" href="/styles/global.css" />
      </head>
      <body>
        <Nav />
        <main>
          <div id="container" style="max-width: 700px">
            <h1>Privacy Policy</h1>
            <p style="color: lightgrey">Last updated February 25th, 2024</p>
            <p>
              Thank you for visiting Lyricdump. We respect your privacy and are
              committed to protecting your personal information. This Privacy
              Policy outlines the types of information we collect when you use
              the Site and how we use and safeguard that information.
            </p>
            <p>
              <strong>
                We do not collect any personally identifiable information.
              </strong>
            </p>
            <p>
              We use Google AdSense to serve advertisements on the Site. Google
              may use cookies to personalize ads based on your interests and
              other information collected through your use of the Site and other
              websites. You can learn more about how Google uses your data by
              visiting the{" "}
              <a
                href="https://policies.google.com/privacy?hl=en-US"
                target="_blank"
              >
                Google Privacy & Terms page
              </a>
              .
            </p>

            <p>
              We reserve the right to update or modify this Privacy Policy at
              any time. Any changes will be effective immediately upon posting
              the revised Privacy Policy on the Site. We encourage you to review
              this Privacy Policy periodically for any changes.
              <br />
              <br />
              By using the Site, you consent to the collection and use of your
              information as outlined in this Privacy Policy.
            </p>
            <a href="/">Return home</a>
          </div>
        </main>
      </body>
    </html>
  );
});

app.post("/search", async (c) => {
  const query = c.req.query("q");

  const artist = await ArtistsCollection.find({
    $text: {
      $search: `\"${query}\"`,
    },
  })
    .project({ _id: 0 })
    .toArray();

  return c.json({ results: artist });
});

app.get("/:ARTIST", async (c) => {
  const query = c.req.param("ARTIST").toLowerCase();
  const pageData = await GetArtistPageData(query);
  if (pageData === null) {
    c.status(500);
    return c.text(
      "There was an error while fetching page data :(\n\nTry again later."
    );
  }

  return c.html(
    <ArtistPage
      metaData={{
        title: "test",
        description: "test",
        ogImage: "Test",
        canonicalLink: "test",
        styles: ["artist"],
      }}
      pageData={pageData}
    />
  );
});

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
