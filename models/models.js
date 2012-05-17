var mongoose = require('mongoose');

// Schemas
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var UserSchema = new Schema({
    name: { type: String },
    email: { type: String },
    password: { type: String }
});

var GoalSchema = new Schema ({
    user: { type: ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now }
});

var GameSchema = new Schema({
    gameType: { type: String, enum: ["singles", "doubles"] },
    players: [{ type: ObjectId, ref: 'User' }],
    goals: [GoalSchema],
    state: { type: String, enum: ["in-progress", "complete"] }
});

// Models
exports.User = mongoose.model('User', UserSchema);
exports.Game = mongoose.model('Game', GameSchema);
exports.Goal = mongoose.model('Goal', GoalSchema);


