const mongoose = require('mongoose');

const songSchema = new mongoose.Schema({
  lyrics: String,
  artist: String, 
  artist_query: String,
  song: String,
  release_date: String, 
  explicit: Boolean,
  date_added: Date
});

const Song =
  mongoose.models.Song || mongoose.model("Song", songSchema); //make sure model exists before creating new one

module.exports = Song;
