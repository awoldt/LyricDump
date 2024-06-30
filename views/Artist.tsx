import type { Artist, Lyric } from "../interfaces";

interface PageProps {
  artistData: Artist;
  relatedArtists:
    | {
        name: string;
        query: string;
        profile_img: string;
      }[]
    | null;
}

export default function ArtistPage(prop: PageProps) {
  return (
    <div class="container-holder">
      <div class="header">
        <div class="profile-img-holder">
          {prop.artistData.has_profile_img && (
            <img
              src={`/imgs/artists/${prop.artistData.artist_id}.png`}
              alt={`${prop.artistData.name}`}
              class="profile-img"
              itemprop="image"
            />
          )}

          {!prop.artistData.has_profile_img && (
            <img
              src={`/imgs/noprofile.png`}
              id="profile_img"
              alt="no profile"
            />
          )}
          <div>
            <h1 itemprop="name">{prop.artistData.name}</h1>
            {prop.artistData.description && (
              <p itemprop="description">{prop.artistData.description}</p>
            )}
          </div>
        </div>
      </div>
      <div class="container">
        {/* <div itemscope itemtype="https://schema.org/Person"> */}
        <div class="lyric-container">
          {prop.artistData.lyrics && (
            <p class="p-explanation">
              Future Lyrics {"["}
              {[prop.artistData.lyrics.length]}
              {"]"}
            </p>
          )}{" "}
          {prop.artistData.lyrics !== undefined && (
            <>
              {prop.artistData.lyrics.map((x: Lyric, index: number) => {
                return (
                  <div itemscope itemtype="https://schema.org/MusicComposition">
                    <div style="margin-bottom: 4rem;">
                      <p class="p-lyrics" itemprop="lyrics">
                        {x.lyric}
                      </p>
                      <div style="display: flex; align-items: flex-start; justify-content: left; margin-left: 2rem; margin-block: 0.5rem; gap: 0.2rem;">
                        <span>
                          <span itemprop="name">
                            {"["}
                            {x.song}
                          </span>{" "}
                          (<span itemprop="copyrightYear">{x.year}</span>){"]"}
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

                      {x.explanation && (
                        <p class="p-explanation">{x.explanation}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
        {prop.relatedArtists && (
          <div class="related-artists-container">
            <div style="background: black; width: 100%; padding: 1rem;">
              <span style="color: white;">You might also like.</span>
            </div>
            {prop.relatedArtists.map((x) => {
              return (
                <div style="padding: 1rem; border-bottom: 1px solid black;">
                  <a class="profile-img-holder" href={`/${x.query}`}>
                    <img class="profile-img" src={x.profile_img} alt={x.name} />
                    <span>{x.name}</span>
                  </a>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* </div> */}
    </div>
  );
}
