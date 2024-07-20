const express = require('express')
const router = express.Router()
const dotenv = require('dotenv')
dotenv.config()
const jwt = require('jsonwebtoken')

const Comment = require('../model/comment')
const Post = require('../model/posts')

//endpoint to comment 
router.post('/post_comment', async (req, res) => {
    const {token, comment, post_id} = req.body
    if(!token || !comment || !post_id)
        return res.status(400).send({status: 'error', msg: 'All fields must be filled'})

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET)
        const timestamp = Date.now()
        
        const Mcomment = new Comment()
        Mcomment.comment = comment
        Mcomment.post_id = post_id
        Mcomment.user_id = user._id
        Mcomment.timestamp = timestamp

        await Mcomment.save()

        await Post.findOneAndUpdate({_id: post_id}, {
            $inc: {comment_count: 1},
            $push: {comments: Mcomment._id}
        })

        return res.status(200).send({status: 'ok', msg: 'Comment posted successfully', Mcomment})


    } catch (error) {
        console.log(error)
    if(error.name == "JsonWebTokenError")
        return res.status(400).send({status: 'error', msg: 'Invalid token'})

    return res.status(500).send({status: 'error', msg:'An error occured'})
    }
})
module.exports = router