const mongoose = require('mongoose')

mongoose.connect("mongodb+srv://saxenapragyansh:Bittu%402005@cluster0.vtqcziz.mongodb.net/chesssy")

const playerSchema = mongoose.Schema({
    fullname: String,
    usernmae: String,
    email: String,
    password: String,
    age: Number,
})

module.exports = mongoose.model("player", playerSchema)