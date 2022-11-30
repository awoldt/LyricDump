import { MongoClient } from "mongodb";
import lyric from "./interfaces/lyric";
import filtered_lyric_query from "./interfaces/filtered_query_lyric";
import homepage_display_stats from "./interfaces/homepage_display_stats";
const mongoClient = new MongoClient(
  "mongodb+srv://awoldt:OVyWeV7LosswdGUg@aws-us-east-1.94lch.mongodb.net/?retryWrites=true&w=majority"
);
const LYRICS = mongoClient.db("badrapapi-PROD").collection<lyric>("lyrics");

import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
const s3 = new S3Client({
  credentials: {
    accessKeyId: "AKIAXEY2SYGHHE3EM245",
    secretAccessKey: "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",
  },
  region: "us-east-1",
});

export async function GET_RANDOM_LYRIC() {
  try {
    const lyrics: lyric[] = await LYRICS.find({}).toArray();
    const randomLyric = lyrics[Math.floor(Math.random() * lyrics.length)];
    //remove _id
    delete randomLyric._id;
    return randomLyric;
  } catch (e) {
    console.log(e);
    return null;
  }
}

export async function GET_FILTERED_RANDOM_LYRIC(
  queryObj: filtered_lyric_query
) {
  //use this function when a url query is in /api route

  //convert release_date and explicit to correct type (all filtered_lyric_query objs come with keys all set to string)
  if (queryObj.hasOwnProperty("explicit")) {
    queryObj.explicit = JSON.parse(queryObj.explicit); //should turn 'true' and 'false' (strings) into true and false (booleans)
  }
  if (queryObj.hasOwnProperty("year")) {
    queryObj.year = Number(queryObj.year);
  }

  try {
    const lyrics: lyric[] = await LYRICS.find(queryObj).toArray();
    let randomLyric: any = {}; //will only populate if any lyics match user query
    if (lyrics.length !== 0) {
      randomLyric = lyrics[Math.floor(Math.random() * lyrics.length)];
      delete randomLyric._id;
    }
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
