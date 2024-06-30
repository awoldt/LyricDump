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
              class="profile-img"
              alt="no profile"
            />
          )}
          <div>
            <h1 itemprop="name">{prop.artistData.name}</h1>
          </div>
          {/* <div style="width: 45%">
            {prop.artistData.description && (
              <p itemprop="description">{prop.artistData.description}</p>
            )}
          </div> */}
        </div>
      </div>
      <div class="container" itemscope itemtype="https://schema.org/Person">
        <div class="lyric-container">
          {prop.artistData.lyrics && (
            <p class="p-subtitle">
              <img
                src="/imgs/icons/info.svg"
                alt="info icon"
                width={6}
                style="border-radius: 100rem; border: 1px solid black; padding: 0.2rem; width: 1rem; height: 1rem;"
              />
              {prop.artistData.name} Lyrics {"["}
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
                      {x.explanation && (
                        <p class="p-explanation">{x.explanation}</p>
                      )}
                      <div style="display: flex; align-items: flex-start; justify-content: left; gap: 0.2rem;">
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
                <div style="padding: 1rem; border: 1px solid black; border-top: 0px;">
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
    </div>
  );
}
