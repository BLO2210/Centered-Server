const mongoose = require('mongoose')

const MoodRatingSchema = new mongoose.Schema({
    rating: {
        type: Number,
        min: 1,
        max: 10,
        required: true,
    },
    sleepQuality: {
        type: Number,
        min: 1,
        max: 10,
        required: true,
    },
    productivityRating: {
        type: Number,
        min: 1,
        max: 10,
        required: true,
    },
    nutritionRating: {
        type: Number,
        min: 1,
        max: 4,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
})

const Userschema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    moodRatings: [MoodRatingSchema],
})

const User = mongoose.model("User", Userschema)
module.exports = User
