import type { Artist, Lyric, RelatedArtist } from "../utils";

interface PageProps {
  artistData: Artist;
  relatedArtists: RelatedArtist[] | null;
}

export default function ArtistPage(prop: PageProps) {
  return (
    <>
      <img
        src={`/imgs/artists/${prop.artistData.artist_id}.png`}
        alt={`${prop.artistData.name}`}
        id="profile_img"
      />
      <h1>{prop.artistData.name}</h1>
      <hr />
      <div id="lyric_parent_div">
        {prop.artistData.lyrics && (
          <span>{[prop.artistData.lyrics.length]} lyrics</span>
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
      {prop.relatedArtists && prop.relatedArtists.length > 1 && (
        <div>
          <h2>Other artists you might be interested in</h2>
          {prop.relatedArtists.map((x: any) => {
            return (
              <div>
                <img src={x.profile_img} alt="" />
                <span>
                  <b>{x.name}</b>
                </span>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
