const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  artist_query: String,
  img_href: String,
  name: String,
  nicknames: Array,
  description: String,
  social_links: Array,
  music_links: Array
});

const artistProfile =
  mongoose.models.artistProfile || mongoose.model("artistProfile", profileSchema); //make sure model exists before creating new one

module.exports = artistProfile;
