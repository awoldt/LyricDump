import type { DisplayLyric } from "../../../utils";

interface PropData {
  lyrics: DisplayLyric[];
}

export default function FeaturedLyrics(prop: PropData) {
  return (
    <div style="margin-top: 50px">
      <div style="text-align: center">
        <h2 style="text-align: center">Featured Lyrics</h2>{" "}
        <p>Featured lyrics will update every 24 hours at midnight UTC</p>
      </div>

      <div class="lyric-display-div">
        {prop.lyrics.map((x) => {
          return (
            <a href={`/${x.artist_query}`}>
              {" "}
              <div>
                <div style="display: flex; align-items: center">
                  {x.has_profile_img && (
                    <img
                      src={`/imgs/artists/${x.artist_query}.png`}
                      alt={x.artist_name}
                    />
                  )}
                  {!x.has_profile_img && <img src={`/imgs/noprofile.png`} />}
                  <span style="display: inline-block; margin-left: 5px">
                    <b>{x.artist_name}</b>
                  </span>
                </div>

                <p>
                  {x.lyric}
                  <br />
                  <span class="lyric-songandyear">
                    {x.song} ({x.year})
                  </span>
                </p>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
