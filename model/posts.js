const mongoose = require('mongoose')
const Schema = mongoose.Schema

const postSchema = new Schema({
    author_id : String,
    title: String,
    content: String,
    comment_count: {type: Number, default: 0},
    comments: [String],
    likes: {type: Number, default: 0},
    like_ids: [String],
    timestamp : Number
}, {collection: 'Post'})

const model = mongoose.model('posts', postSchema)
module.exports = model