const { model, Schema } = require('mongoose');

module.exports = model(
    'stickyData',
    new Schema({
        _id: String,
        channelID: String,
        message: String,
        title: String,
        image: String,
        createdBy: String,
        threshold: Number,
        messageCount: Number,
        lastMessage: String,
    }, {
        versionKey: false,
    })
);