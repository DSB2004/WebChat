const mongoose = require('mongoose');

const msgSchema = new mongoose.Schema({
    UserID: { type: String, required: true },
    Msg: { type: String },
    chatroom: { type: String },
    Receiver: { type: String },
    Key: { type: Object },
    time: { type: String },
    SeenBy: { type: [String] },
    identifier: { type: String },
    iv: { type: Object }
});


const Msg = mongoose.model('Msg', msgSchema);
module.exports = Msg;