import pg from "pg";
const { Pool } = pg;
export const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
  database: process.env.DB_DATABASE,
  max: 22,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  ssl: {
    rejectUnauthorized: false,
  },
});

////////////////////////////////////////////////////////

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
