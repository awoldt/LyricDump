import type { Artist, DisplayLyric } from "../utils";
import FeaturedLyrics from "./components/Home/FeaturedLyrics";
import TopArtist from "./components/Home/PopularArtists";
import RecentlyAddedLyrics from "./components/Home/RecentlyAddedLyrics";

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
        <main>
          <div id="container">
            <div id="banner_text">
              <h1>A Collection of the Dumbest Song Lyrics of All Time</h1>
              <p>
                Lyricdump is a archive of some of the worst song lyrics ever.
                Lyrics so strange that it might make you wonder why an artist
                had it in their song. Spanning many genres, this site is the
                one-stop shop for hilarious lyrics to share with friends and
                family. <br></br> <br></br>
              </p>

              <div
                style="display:flex; justify-content:space-evenly;"
                id="homepage-display-btns-parent"
              >
                <div class="homepage-display-btn">
                  <a href="submitlyrics" title="Submit your lyrics">
                    Have any funny lyrics?
                  </a>
                </div>
                <div class="homepage-display-btn">
                  <a href="/catalogue" target="View all artists">
                    {" "}
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
                </div>
              </div>

              <input
                type="search"
                name="search_query"
                id="homepage_search_input"
                placeholder="Search any artist"
              />
              <div id="search_results"></div>
              <script src="/scripts/search.js"></script>
            </div>

            <FeaturedLyrics lyrics={props.featuredLyrics} />
            <RecentlyAddedLyrics lyrics={props.recentLyrics} />

            <TopArtist topArtist={props.topArtists} />

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
}
