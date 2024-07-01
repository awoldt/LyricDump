import type { NEW_Artist, NEW_Lyric, PageMetadata } from "../../utils";
import Nav from "../components/Nav";

export default function ArtistPage({
  metaData,
  pageData,
}: {
  metaData: PageMetadata;
  pageData: {
    artist: NEW_Artist;
    lyrics: NEW_Lyric[];
    relatedArtists: null | NEW_Artist[];
  };
}) {
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
        <title>{metaData.title}</title>
        <meta name="description" content={metaData.description}></meta>
        <link rel="canonical" href={metaData.canonicalLink} />
        <meta property="og:title" content={metaData.title} />
        <meta
          property="og:url"
          content={`https://lyricdump.com/${pageData.artist.query}`}
        />
        <meta property="og:site_name" content="Lyricdump" />

        {metaData.ogImage && (
          <meta property="og:image" content={metaData.ogImage} />
        )}
        <meta property="og:description" content={metaData.description} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={metaData.title} />
        <meta name="twitter:description" content={metaData.description} />
        {metaData.ogImage && (
          <meta name="twitter:image" content={metaData.ogImage} />
        )}
        <link rel="stylesheet" href="/styles/global.css" />
        {metaData.styles && (
          <>
            {metaData.styles.map((x) => {
              return <link rel="stylesheet" href={`/styles/${x}.css`} />;
            })}
          </>
        )}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4106301283765460"
          crossorigin="anonymous"
        ></script>
      </head>
      <body>
        <Nav />
        <main>
          <div class="container-holder">
            <div class="header">
              <div class="profile-img-holder">
                <img
                  src={
                    pageData.artist.has_profile_img
                      ? `/imgs/artists/${pageData.artist.query}.png`
                      : "/imgs/noprofile.png"
                  }
                  alt={`${pageData.artist.name}`}
                  class="profile-img"
                  itemprop="image"
                />
                <div>
                  <h1 itemprop="name">{pageData.artist.name}</h1>
                </div>
                {/* <div style="width: 45%">
            {prop.artistData.description && (
              <p itemprop="description">{prop.artistData.description}</p>
            )}
          </div> */}
              </div>
            </div>
            <div
              class="container"
              itemscope
              itemtype="https://schema.org/Person"
            >
              <div class="lyric-container">
                {pageData.lyrics && (
                  <p class="p-subtitle">
                    <img
                      src="/imgs/icons/info.svg"
                      alt="info icon"
                      width={6}
                      style="border-radius: 100rem; border: 1px solid black; padding: 0.2rem; width: 1rem; height: 1rem;"
                    />
                    {pageData.artist.name} Lyrics {"["}
                    {[pageData.lyrics.length]}
                    {"]"}
                  </p>
                )}{" "}
                <>
                  {pageData.lyrics.map((x: NEW_Lyric) => {
                    return (
                      <div
                        itemscope
                        itemtype="https://schema.org/MusicComposition"
                      >
                        <div style="margin-bottom: 4rem;">
                          <p class="p-lyrics" itemprop="lyrics">
                            {x.lyric_text}
                          </p>
                          {x.explanation && (
                            <p class="p-explanation">{x.explanation}</p>
                          )}
                          <div style="display: flex; align-items: flex-start; justify-content: left; gap: 0.2rem;">
                            <span>
                              <span itemprop="name">
                                {"["}
                                {x.song}
                              </span>{" "}
                              (<span itemprop="copyrightYear">{x.year}</span>)
                              {"]"}
                            </span>
                            {x.explicit && (
                              <>
                                <img
                                  src="/imgs/icons/explicit.svg"
                                  alt="explicit icon"
                                  width={16}
                                />
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </>
              </div>
              {pageData.artist.related_artists.length > 0 && (
                <div class="related-artists-container">
                  <div style="background: black; width: 100%; padding: 1rem;">
                    <span style="color: white;">You might also like.</span>
                  </div>
                  {pageData.relatedArtists &&
                    pageData.relatedArtists.map((x) => {
                      return (
                        <div style="padding: 1rem; border: 1px solid black; border-top: 0px;">
                          <a class="profile-img-holder" href={`/${x.query}`}>
                            <img
                              class="profile-img"
                              src={
                                x.has_profile_img
                                  ? `/imgs/artists/${x.query}.png`
                                  : "/imgs/noprofile.png"
                              }
                              alt={x.name}
                            />
                            <span>{x.name}</span>
                          </a>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
