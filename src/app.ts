import express from "express";
import path from "path";
import router from "./routes";
import compression from "compression";
import { MongoClient } from "mongodb";
import lyric from "./interfaces/lyric";
import artist from "./interfaces/artist";
const mongoClient = new MongoClient(
  "mongodb+srv://awoldt:OVyWeV7LosswdGUg@aws-us-east-1.94lch.mongodb.net/?retryWrites=true&w=majority"
);
export const LYRICS = mongoClient
  .db("badrapapi-PROD")
  .collection<lyric>("lyrics");
export const ARTISTS = mongoClient
  .db("badrapapi-PROD")
  .collection<artist>("artists");

const app = express();
app.set("views", path.join(__dirname, "..", "/views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "..", "/public")));
app.use(compression());

app.use("/", router); //all routes for app

app.listen("8080", async () => {
  try {
    await mongoClient.connect();
    console.log("\nsuccessfully connected to databse!");
    console.log("\nApp running on port 8080!\n");
  } catch (e) {
    console.log(e);
    console.log("could not establish connection to database");
  }
});
