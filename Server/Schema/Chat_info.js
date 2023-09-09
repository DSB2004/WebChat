const mongoose = require('mongoose');
const ChatSchema = new mongoose.Schema({
    Users: {
        type: [String],
    },
    chatroom: { type: String, unique: true }
});

const Chat = mongoose.model('Chat', ChatSchema);
module.exports = Chat;