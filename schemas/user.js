const mongoose = require('mongoose')
const bcrypt = require('bcrypt')

//link any related schemas below

const Userschema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
})

const User = mongoose.model("User", Userschema)
module.exports = User