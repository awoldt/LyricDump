import { MongoClient } from "mongodb";
import { z } from "zod";

export const LyricSubmissionModel = z.object({
  lyric: z.string().max(1500).trim(),
  song: z.string().max(250).trim(),
});

export interface DisplayLyric {
  lyric: string;
  song: string;
  year: number;
  artist_name: string;
  artist_query: string;
  has_profile_img: boolean;
  added_on?: Date;
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
  query: string;
}

const dbClient = new MongoClient(process.env.MONGODB_CONNECTION_STRING!);
export const HomepageLyricsCollection = dbClient
  .db("lyricdump-PROD")
  .collection<DisplayLyric>("homepage-lyrics");

export const ArtistsCollection = dbClient
  .db("lyricdump-PROD")
  .collection<Artist>("artists_v2");

export const LyricsCollection = dbClient
  .db("lyricdump-PROD")
  .collection<Lyric>("lyrics_v2");

export const LyricSubmissionCollection = dbClient
  .db("lyricdump-PROD")
  .collection<z.infer<typeof LyricSubmissionModel>>("lyric_submissions");

export async function ConnectToDb() {
  try {
    await dbClient.connect();
    return true;
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function GetHomepageData() {
  /*
    Gets all the information needed to display on root route "/"
  */

  try {
    const featuredLyrics = await HomepageLyricsCollection.find(
      {},
      { projection: { _id: 0 } }
    ).toArray();

    const popularArtists = await LyricsCollection.aggregate<{
      _id: string;
      numOfLyrics: number;
      artist_data: Artist[];
    }>([
      {
        $group: {
          _id: "$artist_id",
          numOfLyrics: { $count: {} },
        },
      },
      {
        $sort: { numOfLyrics: -1, _id: -1 }, // _id sort here will enforce stable order of results
      },
      {
        $limit: 18,
      },
      {
        $lookup: {
          from: "artists_v2",
          localField: "_id",
          foreignField: "artist_id",
          as: "artist_data",
        },
      },
    ]).toArray();

    const recentLyrics: DisplayLyric[] = (
      await LyricsCollection.aggregate([
        {
          $sort: {
            _id: -1,
          },
        },
        {
          $match: { explicit: false },
        },
        {
          $lookup: {
            from: "artists_v2",
            localField: "artist_id",
            foreignField: "artist_id",
            as: "artist_data",
          },
        },
        {
          $limit: 9,
        },
      ]).toArray()
    ).map((x) => {
      return {
        lyric: x.lyric,
        song: x.song,
        year: x.year,
        artist_name: x.artist_data[0].name,
        artist_query: x.artist_data[0].artist_id,
        has_profile_img: x.artist_data[0].has_profile_img,
        added_on: new Date(x._id.getTimestamp()),
      };
    });

    return {
      topArtist: popularArtists,
      featuredLyrics: featuredLyrics,
      recentLyrics: recentLyrics,
    };
  } catch (err) {
    console.log(err);
    return null;
  }
}

export async function GetRelatedArtists(artistId: string) {
  /* 
    Will return most popular artists ALONG with artists stored in 
    related_artists array
  */

  try {
    const artist = await ArtistsCollection.findOne({ artist_id: artistId });
    if (artist === null) return null;

    let recommendedArtists: RelatedArtist[];
    // current artists has related artists stored in their array
    if(artist.related_artists) {
      recommendedArtists = (await ArtistsCollection.find({artist_id: {$in: artist.related_artists}}).toArray()).map((x) => {
        return {
          name: x.name,
          profile_img: x.has_profile_img
            ? `/imgs/artists/${x.artist_id}.png`
            : "/imgs/noprofile.png",
          query: x.artist_id,
        };
      })
    }
    // no artists stored in their array, check to see if they appear in any other related artists arrays
    else {
      recommendedArtists = (await ArtistsCollection.find({related_artists: {$in: [artistId]}}).toArray()).map((x) => {
        return {
          name: x.name,
          profile_img: x.has_profile_img
            ? `/imgs/artists/${x.artist_id}.png`
            : "/imgs/noprofile.png",
          query: x.artist_id,
        };
      })
    }



  
    const popularArtists = (
      await LyricsCollection.aggregate<{
        _id: string;
        numOfLyrics: number;
        artist_data: Artist[];
      }>([
        {
          $group: {
            _id: "$artist_id",
            numOfLyrics: { $count: {} },
          },
        },
        {
          $sort: { numOfLyrics: -1, _id: -1 }, // _id sort here will enforce stable order of results
        },
        {
          $limit: 6,
        },
        {
          $lookup: {
            from: "artists_v2",
            localField: "_id",
            foreignField: "artist_id",
            as: "artist_data",
          },
        },
      ]).toArray()
    ).map((x) => {
      return {
        name: x.artist_data[0].name,
        profile_img: x.artist_data[0].has_profile_img
          ? `/imgs/artists/${x.artist_data[0].artist_id}.png`
          : "/imgs/noprofile.png",
        query: x.artist_data[0].artist_id,
      };
    });

    const p = popularArtists.map(x => {
      return x.query
    })
    // filter out any recommendedArtists that already appear in popularArtists
    recommendedArtists = recommendedArtists.filter((x) => {
      return !p.includes(x.query)
    })

    return {
      recommendedArtists: recommendedArtists,
      popularArtists: popularArtists,
    };
  } catch (err) {
    console.log(err);
    return null;
  }
}

export function GenerateArtistPageMetaDescription(
  lyrics: Lyric[] | undefined,
  artistName: string
) {
  /* 
    Returns a string for a meta description for an artists lyric page,
    contains a list of at most 5 unique songs featured
  */
  if (lyrics === undefined) return null;
  if (lyrics.length === 1) {
    return `Discover ${artistName}'s worst lyrics. Laugh and share with friends and family, explore other popular aritsts.`;
  }

  const songs: string[] = [];
  for (let i = 0; i < lyrics.length; i++) {
    if (songs.length === 6) break;
    if (!songs.includes(lyrics[i].song)) {
      songs.push(lyrics[i].song);
    }
  }

  return `Discover ${artistName}'s worst lyrics from songs like ${songs
    .slice(0, songs.length - 1)
    .join(", ")}, and ${songs[songs.length - 1]}`;
}
