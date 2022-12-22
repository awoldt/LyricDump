import artist_articles from "./artist_articles";

export default interface artist {
  artist_query: string;
  profile_img: string;
  name: string;
  nicknames: string[] | null;
  about?: string[];
  articles?: artist_articles[];
}
