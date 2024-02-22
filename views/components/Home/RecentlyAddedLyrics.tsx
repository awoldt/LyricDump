import type { RecentLyrics } from "../../../utils";

interface PropData {
  lyrics: RecentLyrics[];
}

export default function RecentlyAddedLyrics(prop: PropData) {
  return (
    <div id="recent_lyrics_div">
      <h2>Recently added lyrics</h2>
      {prop.lyrics.map((x) => {
        return (
          <a href={`/${x.artist_query}`} class="recent-lyric">
            {" "}
            <p>
              {x.lyric}{" "}
              <span class="lyric-songandyear">
                {x.artist_name} - {x.song} ({x.year})
              </span>
            </p>
          </a>
        );
      })}
    </div>
  );
}
