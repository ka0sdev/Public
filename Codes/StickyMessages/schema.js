const { model, Schema } = require("mongoose");

module.exports = model(
  "Sticky",
  new Schema({
    GuildID: String,
    ChannelID: String,
    Message: String,
    CreatedBy: String,
    Threshold: Number,
    MessageCount: Number,
    Lastmsg: String,
  })
);
