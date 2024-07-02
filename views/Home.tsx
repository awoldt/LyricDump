import type { Artist, DisplayLyric } from "../interfaces";
import FeaturedLyrics from "./components/Home/FeaturedLyrics";
import TopArtist from "./components/Home/PopularArtists";
import RecentlyAddedLyrics from "./components/Home/RecentlyAddedLyrics";
import Nav from "./components/Nav";

interface PageProps {
  featuredLyrics: DisplayLyric[];
  recentLyrics: DisplayLyric[];
  topArtists: {
    _id: string;
    numOfLyrics: number;
    artist_data: Artist[];
  }[];
}

export default function Homepage(props: PageProps) {
  return (
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
        <meta property="og:image" content="https://lyricdump.com/favicon.ico" />

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
        <Nav />
        <main>
          <div class="container-holder">
            <div className="container">
              <div style="display: flex; gap: 4rem; align-items: center; justify-content: center;">
                <div>
                  <div style="display: flex; align-items: center; gap: 0.8rem; margin-bottom: 2rem;">
                    <span style="width: fit-content; font-weight: 600;">
                      LYRIC DUMP
                    </span>
                    <div style="width: 80%; height: 1px; background-color: black;"></div>
                  </div>
                  <div>
                    <span style="font-size: clamp(2rem, 4vw, 3rem); line-height: 1.4;">
                      A Collection of the Funniest Song Lyrics of All Time.
                    </span>
                    <div style="margin-top: 1rem;">
                      <p>
                        Lyric Dump is an archive of some of the most bizarre and
                        cringe-worthy song lyrics ever. These lyrics are so
                        strange that you'll wonder why the artist included them.
                        Covering many genres, this site is your go-to
                        destination for sharing hilarious lyrics with friends
                        and family.
                      </p>
                    </div>
                  </div>
                </div>
                <img
                  src="/imgs/test.jpg"
                  width={3300}
                  height={2400}
                  style="object-fit: cover; box-shadow: rgba(0, 0, 0, 0.05) 0px 0px 0.75rem 0px; width: 800px; height: 500px;"
                />
              </div>
              <FeaturedLyrics lyrics={props.featuredLyrics} />
              <RecentlyAddedLyrics lyrics={props.recentLyrics} />
              <TopArtist topArtist={props.topArtists} />
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
