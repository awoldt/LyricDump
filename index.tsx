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
  LyricsCollection,
} from "./utils";
import ArtistPage from "./views/Artist";
import Nav from "./views/components/Nav";
import RecentlyAddedLyrics from "./views/components/Home/RecentlyAddedLyrics";
import TopArtist from "./views/components/Home/PopularArtists";
import FeaturedLyrics from "./views/components/Home/FeaturedLyrics";
import Search from "./views/components/Search";
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
          <title>
            LyricDump - Collection of the Worst Song Lyrics of all Time
          </title>

          <meta
            name="description"
            content="Lyricdump is a collection of the dumbest song lyrics of all time. Easily browse your favorite artists and discover funny lyrics to share with friends and family."
          ></meta>

          <link rel="canonical" href="https://lyricdump.com" />
          <meta
            property="og:title"
            content="LyricDump - Collection of the Worst Song Lyrics of all Time"
          />
          <meta property="og:url" content="https://lyricdump.com" />
          <meta property="og:site_name" content="Lyricdump" />
          <meta
            property="og:image"
            content="https://lyricdump.com/favicon.ico"
          />

          <meta
            property="og:description"
            content="Lyricdump is a collection of the dumbest song lyrics of all time. Easily browse your favorite artists and discover funny lyrics to share with friends and family."
          />

          <meta name="twitter:card" content="summary_large_image" />
          <meta
            name="twitter:title"
            content="LyricDump - Collection of the Worst Song Lyrics of all Time"
          />
          <meta
            name="twitter:description"
            content="Lyricdump is a collection of the dumbest song lyrics of all time. Easily browse your favorite artists and discover funny lyrics to share with friends and family."
          />

          <meta
            name="twitter:image"
            content="https://lyricdump.com/favicon.ico"
          />

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
                  family. <br></br>
                  <br></br>
                  <a href="/submitlyrics">
                    Have any funny lyrics?
                  </a>
                  <input
                    type="search"
                    name="search_query"
                    id="homepage_search_input"
                    placeholder="Search any artist"
                  />
                  <div id="search_results"></div>
                  <a
                    href="/catalogue"
                    style="display: block; margin-top: 20px; text-decoration: none; width: fit-content; margin: auto"
                    title="View all artists"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      class="bi bi-person-fill"
                      viewBox="0 0 16 16"
                    >
                      <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6" />
                    </svg>{" "}
                    View artist catalogue
                  </a>
                  <script src="/scripts/search.js"></script>
                </p>
              </div>

              <FeaturedLyrics lyrics={homepageData.featuredLyrics} />
              <RecentlyAddedLyrics lyrics={homepageData.recentLyrics} />

              <TopArtist topArtist={homepageData.topArtist} />

              <a
                href="/privacy"
                style="text-align: center;  display: block; margin-top: 50px;"
              >
                Privacy Policy
              </a>
            </div>
          </main>
        </body>
      </html>
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
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
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
            <div id="container">
              <h1>
                There are currently <b>{numOfArtists}</b> artists stored in our
                database.
              </h1>
              <p style="margin-bottom: 45px">
                Browse our collections of artists. If you don't see your
                favorite artist listed here,{" "}
                <a href="/submitlyrics">submit them.</a>
              </p>
              {artistList.map((x) => {
                if (!/^[a-zA-Z]+$/.test(x._id)) {
                  return (
                    <div>
                      {x.artists.map((y: Artist) => {
                        return (
                          <a href={`/${y.artist_id}`} class="artist-link">
                            {y.name}
                          </a>
                        );
                      })}
                    </div>
                  );
                } else {
                  return (
                    <div>
                      <hr />
                      <span class="letter-header">
                        {x._id.toUpperCase()} ({x.artists.length})
                      </span>
                      {x.artists.map((y: Artist) => {
                        return (
                          <a href={`/${y.artist_id}`} class="artist-link">
                            {y.name}
                          </a>
                        );
                      })}
                    </div>
                  );
                }
              })}
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
            <div id="container">
              <div id="banner_text">
                <h1>Submit Lyrics</h1>
                <p>
                  This site is always looking for new funny lyrics to add, if
                  you If you have any lyrics that you don't see on the site
                  already, be sure to submit your lyrics below!
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

  app.get("/privacy", (c) => {
    return c.html(
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1.0"
          />
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
                Thank you for visiting Lyricdump. We respect your privacy and
                are committed to protecting your personal information. This
                Privacy Policy outlines the types of information we collect when
                you use the Site and how we use and safeguard that information.
              </p>
              <p>
                <strong>
                  We do not collect any personally identifiable information.
                </strong>
              </p>
              <p>
                We use Google AdSense to serve advertisements on the Site.
                Google may use cookies to personalize ads based on your
                interests and other information collected through your use of
                the Site and other websites. You can learn more about how Google
                uses your data by visiting the{" "}
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
                the revised Privacy Policy on the Site. We encourage you to
                review this Privacy Policy periodically for any changes.
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

          <script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4106301283765460"
            crossorigin="anonymous"
          ></script>
        </head>
        <body>
          <Nav />

          <div id="container" style="padding-top: 10px">
            <Search />
            <div style="text-align: center">
              <main>
                {" "}
                <ArtistPage
                  artistData={artistData[0]}
                  relatedArtists={relatedArtists}
                />
              </main>
            </div>
          </div>
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
