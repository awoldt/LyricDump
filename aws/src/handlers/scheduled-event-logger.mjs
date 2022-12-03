import { MongoClient } from "mongodb";
const dbClient = new MongoClient(process.env.MONGODB_CONNECTION_URI);
const NEWLYRICS = dbClient.db(process.env.DB).collection("lyrics");
const new_artists = dbClient.db(process.env.DB).collection("artists");
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
const s3 = new S3Client({
  credentials: {
    accessKeyId: process.env.AWS_IAM_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_IAM_SECRET_ACCESS_KEY,
  },
  region: "us-east-1",
});

export const scheduledEventLoggerHandler = async (event, context) => {
  //make sure random lyric has an artist stored in db with profile img
  let artists = await new_artists.find({}).toArray();
  artists = artists.map((x) => {
    return x.artist_query;
  });

  //filter all the lyrics returned
  const allLyrics = await NEWLYRICS.find({}).toArray();
  const lyricsWithAritstProfilePics = [];

  allLyrics.forEach((x) => {
    if (
      artists.includes(x.artist_query) &&
      !lyricsWithAritstProfilePics.includes(x.artist_query)
    ) {
      lyricsWithAritstProfilePics.push(x.artist_query);
    }
  });

  //all the lyrics that have artists with profile imgs
  const validLyrics = await NEWLYRICS.find({
    artist_query: { $in: lyricsWithAritstProfilePics },
  }).toArray();

  //now pick 4 random lyrics and combine with artist profile img
  //cannot have the same artist twice
  //cannot be explicit
  //cannot be longer than 50 characters
  let selectedFeaturedLyrics = [];
  let randomIndexUsed = [];
  let artistsUsed = [];
  while (selectedFeaturedLyrics.length !== 4) {
    let r = Math.floor(Math.random() * validLyrics.length);

    if (
      !randomIndexUsed.includes(r) &&
      !artistsUsed.includes(validLyrics[r].artist_query) &&
      !validLyrics[r].explicit &&
      validLyrics[r].lyrics.length < 50
    ) {
      randomIndexUsed.push(r);
      artistsUsed.push(validLyrics[r].artist_query);
      //get artist profile pic
      const artistData = await new_artists
        .find({ artist_query: validLyrics[r].artist_query })
        .toArray();

      const v = {
        lyrics: validLyrics[r].lyrics,
        artist: validLyrics[r].artist,
        artist_img: artistData[0].profile_img,
        artist_query: artistData[0].artist_query,
      };
      selectedFeaturedLyrics.push(v);
    }
  }

  const uploadUpdatedFeaturedLyrics = new PutObjectCommand({
    Bucket: "badrapapi",
    Key: "homepage_featured_lyrics.json",
    Body: JSON.stringify(selectedFeaturedLyrics),
  });
  const didS3Upload = await s3.send(uploadUpdatedFeaturedLyrics);
  console.log(didS3Upload);
};
