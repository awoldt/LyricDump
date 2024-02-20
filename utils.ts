import { MongoClient } from "mongodb";

export interface HomepageLyric {
  lyric: string;
  song: string;
  year: number;
  artist_query: string;
  artist: string;
}

export interface Artist {
  artist_id: string;
  name: string;
  has_profile_img: boolean;
  description: string;
  related_artists: string[] | null;
  lyrics?: Lyric[];
}

export interface Lyric {
  artist_id: string;
  lyric: string;
  song: string;
  explicit: boolean;
  year: number;
  explanation: string | null;
}

export interface RelatedArtist {
  name: string;
  profile_img: string;
}

const dbClient = new MongoClient(process.env.MONGODB_CONNECTION_STRING!);
export const HomepageLyricsCollection = dbClient
  .db("lyricdump-PROD")
  .collection<HomepageLyric>("homepage-lyrics");

export const ArtistsCollection = dbClient
  .db("lyricdump-PROD")
  .collection<Artist>("artists_v2");

export async function ConnectToDb() {
  try {
    await dbClient.connect();
    return true;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function GetRelatedArtists(artistId: string) {
  /* 
    Will fetch all artists stored in related_artists array in 
    db, will also cross reference, if one artist has their name
    in related_artists array in another artist but none in their own,
    will still show up 
  */

  try {
    const artist = await ArtistsCollection.findOne({ artist_id: artistId });
    if (artist === null) return null;

    let RETURN_ARTISTS: RelatedArtist[] = [];
    let addedArtists: string[] = [];

    // if artist has related_artists array present in their db document
    if (artist.related_artists !== null) {
      const relatedArtists = await ArtistsCollection.find({
        artist_id: { $in: artist.related_artists },
      }).toArray();

      console.log(relatedArtists);

      for (let i = 0; i < relatedArtists.length; i++) {
        if (!addedArtists.includes(relatedArtists[i].artist_id)) {
          RETURN_ARTISTS.push({
            name: relatedArtists[i].name,
            profile_img: !relatedArtists[i].has_profile_img
              ? "/imgs/noprofile.png"
              : `/imgs/artists/${relatedArtists[i].artist_id}.png`,
          });
          addedArtists.push(relatedArtists[i].artist_id);
        }
      }
    }

    // if this artist does not have any related artists, check to see if their name
    // appears in any related_artist array in entire db

    const appearsIn = await ArtistsCollection.find({
      related_artists: { $in: [artistId] },
    }).toArray();

    console.log(appearsIn);

    for (let i = 0; i < appearsIn.length; i++) {
      if (!addedArtists.includes(appearsIn[i].artist_id)) {
        RETURN_ARTISTS.push({
          name: appearsIn[i].name,
          profile_img: !appearsIn[i].has_profile_img
            ? "/imgs/noprofile.png"
            : `/imgs/artists/${appearsIn[i].artist_id}.png`,
        });
        addedArtists.push(appearsIn[i].artist_id);
      }
    }

    return RETURN_ARTISTS;
  } catch (err) {
    console.log(err);
    return null;
  }
}
