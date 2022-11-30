export default interface lyric {
  _id?: any; //remove when sending back json to client
  lyrics: string;
  artist: string;
  song: string;
  year: number;
  explicit: boolean;
  artist_query: string;
}
