import artist from "./artist";
import lyric from "./lyric";

export default interface artist_page_data {
  lyrics: lyric[];
  profile: artist | null;
}
