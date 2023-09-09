const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    Name: { type: String },
    Email: { type: String, required: true, unique: true },
    type: { type: String },
    Password: { type: String },
    Photo: { type: String },
    Notification: { type: [Object] },
    Recent_Contact: { type: [Object] },
    Block: { type: [String] }
});

const User = mongoose.model('User', userSchema);
module.exports = User;