import express from "express";
import path from "path";
import router from "./routes";

const app = express();
app.set("views", path.join(__dirname, "..", "/views"))
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "..", "/public")));

app.use("/", router); //all routes for app

app.listen("8080", () => {
  console.log("\nApp running on port 8080!");
});
