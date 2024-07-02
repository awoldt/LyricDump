import type { DisplayLyric } from "../../../interfaces";

interface PropData {
  lyrics: DisplayLyric[];
}

export default function RecentlyAddedLyrics(prop: PropData) {
  return (
    <div class="lyric-container">
      <h2>RECENTLY ADDED</h2>
      <br />
      {prop.lyrics.map((x) => {
        return (
          <a
            href={`/${x.artist_query}`}
            itemscope
            itemtype="https://schema.org/MusicComposition"
            style="width: 100%;"
          >
            <div class="lyric-holder">
              <div>
                <p itemprop="lyrics">
                  {x.lyric}&ensp;
                  <span itemprop="name">
                    {"["}
                    {x.song}
                    {"]"}
                  </span>
                </p>
              </div>
              <div class="profile-img-holder">
                {x.has_profile_img && (
                  <img
                    src={`/imgs/artists/${x.artist_query}.png`}
                    alt={x.artist_name}
                    class="profile-img"
                  />
                )}
                {!x.has_profile_img && (
                  <img src={`/imgs/noprofile.png`} class="profile-img" />
                )}
                <span itemprop="lyricist">{x.artist_name}</span>
              </div>
              {/* <span style="margin-top: 10px; display: block; color: lightgrey">
                      Added on {x.added_on?.toDateString()}
                    </span> */}
            </div>
          </a>
        );
      })}
    </div>
  );
}
