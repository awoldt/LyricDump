export interface PageMetadata {
  title: string;
  description: string;
  ogImage: string | null;
  canonicalLink: string;
  styles: string[] | null;
}

export interface NEW_Lyric {
  id: number;
  fk_artist_id: number;
  lyric_text: string;
  song: string;
  year: number;
  explicit: boolean;
  explanation: string | null;
}

export interface NEW_Artist {
  id: number;
  name: string;
  query: string;
  has_profile_img: boolean;
  description: string | null;
  related_artists: string[];
}

export async function GetArtistPageData(artistQuery: string) {
  try {
    const client = await pool.connect();

    const artist = (
      await client.query<NEW_Artist>(
        `
      SELECT * FROM artists WHERE query = $1;
      `,
        [artistQuery]
      )
    ).rows;
    const lyrics = (
      await client.query<NEW_Lyric>(
        `
      SELECT * FROM lyrics WHERE fk_artist_id = $1 ORDER BY year desc;
      `,
        [artist[0].id]
      )
    ).rows;
    let relatedArtists: null | NEW_Artist[] = null;
    if (artist[0].related_artists.length > 0) {
      relatedArtists = (
        await client.query<any>(
          `
      SELECT name, has_profile_img, query FROM artists WHERE query = ANY($1::text[]);
      `,
          [artist[0].related_artists]
        )
      ).rows;
    }

    client.release();

    return {
      artist: artist[0],
      lyrics,
      relatedArtists,
    };
  } catch (error) {
    console.log(error);
    return null;
  }
}

/////////////////////////////////////////////////////

import {
  ArtistsCollection,
  HomepageLyricsCollection,
  LyricsCollection,
  pool,
} from "./db";
import type { Artist, DisplayLyric, Lyric } from "./interfaces";

export async function GetRelatedArtists(artistID: string) {
  try {
    const artist = await ArtistsCollection.findOne({ artist_id: artistID });
    if (artist === null || artist.related_artists === null) return null;

    const relatedArtistsData = (
      await ArtistsCollection.find({
        artist_id: { $in: artist.related_artists },
      }).toArray()
    ).map((x) => {
      return {
        name: x.name,
        query: x.artist_id,
        profile_img: x.has_profile_img
          ? `/imgs/artists/${x.artist_id}.png`
          : "/imgs/noprofile.png",
      };
    });

    relatedArtistsData.sort((a, b) => a.name.localeCompare(b.name));

    return relatedArtistsData;
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
