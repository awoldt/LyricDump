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
            </a>
          );
        })}
      </div>
    </div>
  );
}
