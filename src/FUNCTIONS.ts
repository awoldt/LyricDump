import { MongoClient } from "mongodb";
import lyric from "./interfaces/lyric";
import artist from "./interfaces/artist";
import homepage_display_stats from "./interfaces/homepage_display_stats";
const mongoClient = new MongoClient(
  "mongodb+srv://awoldt:OVyWeV7LosswdGUg@aws-us-east-1.94lch.mongodb.net/?retryWrites=true&w=majority"
);
const LYRICS = mongoClient.db("badrapapi-PROD").collection<lyric>("lyrics");
const ARTISTS = mongoClient.db("badrapapi-PROD").collection<artist>("artists");

import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import top_artists from "./interfaces/top_artists_aggregate";
import artist_page_data from "./interfaces/artist_page_data";
const s3 = new S3Client({
  credentials: {
    accessKeyId: "AKIAXEY2SYGHPVS6ASBU",
    secretAccessKey: "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",
  },
  region: "us-east-1",
});

export async function GET_RANDOM_LYRIC(isExplicit: boolean) {
  try {
    const lyrics: lyric[] = await LYRICS.find({
      explicit: isExplicit,
    }).toArray();
    const randomLyric = lyrics[Math.floor(Math.random() * lyrics.length)];
    //remove _id
    delete randomLyric._id;
    return randomLyric;
  } catch (e) {
    console.log(e);
    return null;
  }
}

export async function GET_HOMEPAGE_DISPLAY_STATS() {
  try {
    const allLyrics = await LYRICS.find({}).toArray();

    let uniqueArtists: string[] = [];
    allLyrics.forEach((x: lyric) => {
      if (!uniqueArtists.includes(x.artist_query)) {
        uniqueArtists.push(x.artist_query);
      }
    });

    //get all years featured
    const years: number[] = allLyrics
      .map((x: lyric) => {
        return x.year;
      })
      .sort();

    const data: homepage_display_stats = {
      numberOfArtists: uniqueArtists.length.toString(),
      numberOfLyrics: (Math.floor(allLyrics.length / 10) * 10).toString(), //rounds down to nearest 10th place
      years: [years[0].toString(), years[years.length - 1].toString()],
    };
    return data;
  } catch (e) {
    console.log(e);
    return null;
  }
}

export async function GET_FEATURED_LYRICS() {
  //fetches the json file containing lyrics to show on homepage
  //this json file is updated every 24hrs from aws lambda function

  try {
    const getFeaturedLyrics = new GetObjectCommand({
      Bucket: "badrapapi",
      Key: "homepage_featured_lyrics.json",
    });
    const didGetFeaturedLyrics = await s3.send(getFeaturedLyrics);
    return JSON.parse(await didGetFeaturedLyrics.Body?.transformToString()!);
  } catch (e) {
    console.log(e);
    return null;
  }
}

export async function GET_MOST_POPULAR_ARTISTS() {
  try {
    //orders artists by most lyrics to least
    const data = await LYRICS.aggregate<top_artists>([
      {
        $group: {
          _id: {
            artistName: "$artist_query",
            artistNameClean: "$artist",
          },
          numOfLyrics: {
            $count: {},
          },
        },
      },
      {
        $sort: {
          numOfLyrics: -1,
        },
      },
    ]).toArray();

    //only need top 12 artists
    return data.slice(0, 12);
  } catch (e) {
    console.log(e);
    return null;
  }
}

export async function GET_RECENTLY_ADDED_LYRICS() {
  try {
    const lyrics: lyric[] = (await LYRICS.find({}).toArray()).reverse();
    return lyrics.slice(0, 12);
  } catch (e) {
    console.log(e);
    return null;
  }
}

export async function GET_ARTISTPAGE_DATA(artist: string) {
  //need to return all artists lyrics AND artist profile
  try {
    const artistLyrics: lyric[] = await LYRICS.find({
      artist_query: artist,
    })
      .sort({ year: -1 })
      .toArray();

    if (artistLyrics.length === 0) {
      return null;
    } else {
      const artistProfile = await ARTISTS.find({
        artist_query: artist,
      }).toArray();

      //artist does not have profile stored
      if (artistProfile.length === 0) {
        const returnData: artist_page_data = {
          lyrics: artistLyrics,
          profile: null,
        };

        return returnData;
      }
      //artist has profile
      else {
        const returnData: artist_page_data = {
          lyrics: artistLyrics,
          profile: artistProfile[0],
        };

        return returnData;
      }
    }
  } catch (e) {
    console.log(e);
    return null;
  }
}

export async function GET_RAPPERS_WHO_CUSS_THE_MOST() {
  //runs an aggregate on all the lyrics stored in database and groups all the explicit lyrics to an individual artist
  try {
    const data = await LYRICS.aggregate([
      {
        $match: {
          explicit: true,
        },
      },
      {
        $group: {
          _id: {
            artistName: "$artist",
            artistQuery: "$artist_query",
          },
          totalCussWordLyrics: {
            $count: {},
          },
        },
      },
      {
        $limit: 12,
      },
      {
        $match: {
          totalCussWordLyrics: {
            $gt: 1,
          },
        },
      },
    ])
      .sort({ totalCussWordLyrics: -1 })
      .toArray();
    console.log(data);
  } catch (e) {
    console.log(e);
  }
}
