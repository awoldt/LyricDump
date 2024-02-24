import type { Artist, Lyric, RelatedArtist } from "../utils";

interface PageProps {
  artistData: Artist;
  relatedArtists: RelatedArtist[] | null;
}

export default function ArtistPage(prop: PageProps) {
  return (
    <div itemscope itemtype="https://schema.org/Person">
      {prop.artistData.has_profile_img && (
        <img
          src={`/imgs/artists/${prop.artistData.artist_id}.png`}
          alt={`${prop.artistData.name}`}
          id="profile_img"
          itemprop="image"
        />
      )}
      {!prop.artistData.has_profile_img && (
        <img src={`/imgs/noprofile.png`} id="profile_img" />
      )}

      <h1>
        <span itemprop="name">{prop.artistData.name}</span>'s Worst Lyrics
      </h1>
      {prop.artistData.description && (
        <p id="artist_description" itemprop="description">
          {prop.artistData.description}
        </p>
      )}
      <hr />
      <div id="lyric_parent_div">
        {prop.artistData.lyrics && (
          <span style="margin-bottom: 20px; display: block">
            <b>{[prop.artistData.lyrics.length]} lyrics</b>
          </span>
        )}{" "}
        {prop.artistData.lyrics &&
          prop.artistData.lyrics.map((x: Lyric) => {
            return (
              <div
                class="lyric-div"
                itemscope
                itemtype="https://schema.org/MusicComposition"
              >
                <div style="display: flex">
                  {x.explicit && (
                    <>
                      <img src="/imgs/icons/explicit.svg" alt="explicit icon" />
                    </>
                  )}
                  <p>
                    <span itemprop="lyrics">{x.lyric}</span>
                    <span>
                      - <span itemprop="name">{x.song}</span> (
                      <span itemprop="copyrightYear">{x.year}</span>)
                    </span>
                  </p>
                </div>

                {x.explanation && (
                  <p class="explanation-text">
                    <i>{x.explanation}</i>
                  </p>
                )}
              </div>
            );
          })}
      </div>
      {prop.relatedArtists && prop.relatedArtists.length > 0 && (
        <>
          <hr />
          <h2>Other artists you might be interested in</h2>
          <div id="related_artists_div">
            {prop.relatedArtists.map((x) => {
              return (
                <div class="related-artist">
                  <a href={`/${x.query}`}>
                    <img src={x.profile_img} alt={x.name} />
                    <span>
                      <b>{x.name}</b>
                    </span>
                  </a>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
