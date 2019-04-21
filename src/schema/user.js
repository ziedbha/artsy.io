var mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: { type: String },
    password: { type: String },
    drawings: { type: [String] }
})

module.exports = mongoose.model('User', userSchema);
