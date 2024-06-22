import type { Artist } from "../../../interfaces";

interface PropData {
  topArtist: {
    _id: string;
    numOfLyrics: number;
    artist_data: Artist[];
  }[];
}

export default function TopArtist(prop: PropData) {
  return (
    <div id="popular_artists_div">
      <div style="text-align: center">
        <img src="/imgs/icons/trending.svg" alt="trending icon" />
        <h2>Popular Artists</h2>
        <p style="margin-top: 0px">
          👑 <b>{prop.topArtist[0].artist_data[0].name}</b> is currently the
          most popular artist with {prop.topArtist[0].numOfLyrics} lyrics
        </p>
      </div>

      <div id="top_artist_div">
        {prop.topArtist.map((x) => {
          return (
            <a href={`/${x._id}`}>
              {" "}
              <img
                src={`/imgs/artists/${x._id}.png`}
                alt={`${x.artist_data[0].name}`}
              />
              <span style="margin-left: 5px">
                <b>{x.artist_data[0].name}</b>
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
