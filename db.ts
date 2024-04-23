import { MongoClient } from "mongodb";
import type { Artist, DisplayLyric, Lyric } from "./interfaces";
import { z } from "zod";

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

export const LyricSubmissionModel = z.object({
  lyric: z.string().max(1500).trim(),
  song: z.string().max(250).trim(),
});

export async function ConnectToDb() {
  try {
    await dbClient.connect();
    console.log("succesfully connected to database!");
  } catch (err) {
    console.log(err);
    await dbClient.close();
    throw new Error("Error while connecting to database :(");
  }
}
