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
<<<<<<< HEAD
    <div class="lyric-container">
      <h2>POPULAR ARTISTS</h2>
      <br />
      <div
        class="lyric-holder"
        style="flex-direction: row; width: fit-content; flex-wrap: wrap; border: 0px; justify-content: center; gap: 2rem;"
      >
        {prop.topArtist.map((x) => {
          return (
            <a href={`/${x._id}`}>
              <div
                class="profile-img-holder"
                style="width: fit-content; flex-direction: column;"
              >
                <img
                  src={`/imgs/artists/${x._id}.png`}
                  alt={`${x.artist_data[0].name}`}
                  class="profile-img"
                  style="border-radius: 100rem; height: 120px; width: 120px;"
                />
                <span>{x.artist_data[0].name}</span>
              </div>
=======
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
>>>>>>> 9d151a1ee6620d031f0d85cdb889b003213b5213
            </a>
          );
        })}
      </div>
    </div>
  );
}
