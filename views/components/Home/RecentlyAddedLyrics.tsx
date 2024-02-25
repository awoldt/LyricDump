import type { DisplayLyric } from "../../../utils";

interface PropData {
  lyrics: DisplayLyric[];
}

export default function RecentlyAddedLyrics(prop: PropData) {
  return (
    <div style="margin-top: 50px">
      <h2 style="text-align: center">Recently added lyrics</h2>
      <div class="lyric-display-div">
        {prop.lyrics.map((x) => {
          return (
            <a
              href={`/${x.artist_query}`}
              itemscope
              itemtype="https://schema.org/MusicComposition"
            >
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
                    <b itemprop="lyricist">{x.artist_name}</b>
                  </span>
                </div>
                <div>
                  <p>
                    <span itemprop="lyrics">{x.lyric}</span>
                    <br />
                    <span class="lyric-songandyear">
                      <span itemprop="name">{x.song}</span> (
                      <span itemprop="copyrightYear">{x.year}</span>)
                    </span>
                    <span style="margin-top: 10px; display: block; color: lightgrey">
                      Added on {x.added_on?.toDateString()}
                    </span>
                  </p>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
}
