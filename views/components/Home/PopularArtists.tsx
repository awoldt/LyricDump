import type { NEW_Artist } from "../../../utils";

export interface PopularArtists extends NEW_Artist {
  lyrics_count: number;
}

export default function TopArtist({
  mostPopularArtists,
}: {
  mostPopularArtists: PopularArtists[];
}) {
  return (
    <div id="popular_artists_div">
      <div style="text-align: center">
        <img src="/imgs/icons/trending.svg" alt="trending icon" />
        <h2>Popular Artists</h2>
        <p style="margin-top: 0px">
          👑 <b>{mostPopularArtists[0].name}</b> is currently the most popular
          artist with {mostPopularArtists[0].lyrics_count} lyrics
        </p>
      </div>

      <div id="top_artist_div">
        {mostPopularArtists.map((x) => {
          return (
            <a href={`/${x.query}`}>
              {" "}
              <img src={`/imgs/artists/${x.query}.png`} alt={`${x.name}`} />
              <span style="margin-left: 5px">
                <b>{x.name}</b>
              </span>
            </a>
          );
        })}
      </div>
    </div>
  );
}
