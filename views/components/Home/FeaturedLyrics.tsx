import type { HomepageLyric } from "../../../utils";

interface PropData {
  lyrics: HomepageLyric[];
}

export default function FeaturedLyrics(prop: PropData) {
  return (
    <div id="featured_lyrics_div">
      {prop.lyrics.map((x) => {
        return (
          <a href={`/${x.artist_query}`}>
            {" "}
            <div>
              <img src={`/imgs/artists/${x.artist_query}.png`} alt="" />
              <span>
                <b>{x.artist}</b>
              </span>
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
  );
}
