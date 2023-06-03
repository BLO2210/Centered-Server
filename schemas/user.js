const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  taskName: {
    type: String,
  },
  isComplete: {
    type: Boolean,
    default: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,}
});

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
  tasks: [TaskSchema],
  nutritionRating: {
    type: Number,
    min: 1,
    max: 4,
    required: true,
  },
  exercise: {
    type: Boolean,
    default: false,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const Userschema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  moodRatings: [MoodRatingSchema],
});

const User = mongoose.model('User', Userschema);
module.exports = User;
