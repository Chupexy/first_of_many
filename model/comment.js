const mongoose = require('mongoose')
const Schema = mongoose.Schema

const commentSchema = new Schema({
    comment: String,
    user_id: String, 
    post_id: String,
    timestamp: Number,
    like_count: {type: Number, default: 0},
    comment_reply_count: {type: Number, default: 0},
    comment_replies: [String]
}, {collection: 'Comment'})

const model = mongoose.model('Comments', commentSchema)
module.exports = model