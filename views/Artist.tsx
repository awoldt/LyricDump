import type { Artist, Lyric, RelatedArtist } from "../utils";

interface PageProps {
  artistData: Artist;
  relatedArtists: RelatedArtist[] | null;
}

export default function ArtistPage(prop: PageProps) {
  return (
    <>
      {prop.artistData.has_profile_img && (
        <img
          src={`/imgs/artists/${prop.artistData.artist_id}.png`}
          alt={`${prop.artistData.name}`}
          id="profile_img"
        />
      )}

      {!prop.artistData.has_profile_img && (
        <img src={`/imgs/noprofile.png`} id="profile_img" />
      )}

      <h1>{prop.artistData.name}'s Worst Lyrics</h1>
      {prop.artistData.description && <p id="artist_description">{prop.artistData.description}</p>}
      <hr />
      <div id="lyric_parent_div">
        {prop.artistData.lyrics && (
          <span>
            <b>{[prop.artistData.lyrics.length]} lyrics</b>
          </span>
        )}{" "}
        {prop.artistData.lyrics &&
          prop.artistData.lyrics.map((x: Lyric) => {
            return (
              <div class="lyric-div">
                {x.explicit && (
                  <>
                    <img src="/imgs/icons/explicit.svg" alt="explicit icon" />
                  </>
                )}
                <p>
                  {x.lyric}{" "}
                  <span>
                    {x.song} ({x.year})
                  </span>
                </p>
              </div>
            );
          })}
      </div>
      {prop.relatedArtists && prop.relatedArtists.length > 0 && (
        <>
          <hr />
          <div style="text-align: left">
            <h2>Other artists you might be interested in</h2>
            {prop.relatedArtists.map((x) => {
              return (
                <a href={`/${x.query}`}>
                  <div class="related-artist">
                    <img src={x.profile_img} alt="" />
                    <span>
                      <b>{x.name}</b>
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </>
      )}
    </>
  );
}
