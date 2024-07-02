import type { DisplayLyric } from "../../../interfaces";
import type { NEW_Artist, NEW_Lyric } from "../../../utils";

export interface LyricsWithArtist extends NEW_Lyric {
  query: string;
  has_profile_img: boolean;
  name: string;
}

export default function RecentlyAddedLyrics({
  lyrics,
}: {
  lyrics: LyricsWithArtist[];
}) {
  return (
    <div class="lyric-container">
      <h2>RECENTLY ADDED</h2>
      <br />
      {lyrics.map((x) => {
        return (
          <a
            href={`/${x.query}`}
            itemscope
            itemtype="https://schema.org/MusicComposition"
          >
            <div class="lyric-holder">
              <div class="profile-img-holder">
                {x.has_profile_img && (
                  <img
                    src={`/imgs/artists/${x.query}.png`}
                    alt={x.name}
                    class="profile-img"
                  />
                )}
                {!x.has_profile_img && (
                  <img src={`/imgs/noprofile.png`} class="profile-img" />
                )}
                <span itemprop="lyricist">{x.name}</span>
              </div>
              <p itemprop="lyrics">{x.lyric_text}</p>
              <span itemprop="name">{x.song}</span>
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
