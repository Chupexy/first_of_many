const express = require('express')
const router = express.Router()
const dotenv = require('dotenv')
dotenv.config()
const jwt = require('jsonwebtoken')
const Post = require('../model/posts')
const User = require('../model/user')

//endpoint to create a post
router.post('/create_post', async(req, res) => {
    const { title, token, content } = req.body
    if(!token || !title || !content)
        return res.status(400).send({status: 'error', msg: 'All fields must be filled'})

    try {
        const user = jwt.verify(token , process.env.JWT_SECRET)
        const timestamp = Date.now()

        //create post
        const post = new Post()
        post.title = title,
        post.content = content,
        post.timestamp = timestamp, 
        post.author_id = user._id
    
        await post.save()

        //increase post count
        await User.updateOne({_id: user._id}, {$inc: {post_count: +1}})

        res.status(200).send({status: 'success', msg: 'Post created successfully', post})

    } catch (error) {
        if(error.name == "JsonWebTokenError")
            return res.status(400).send({status: 'error', msg: 'Invalid token'})

        return res.status(500).send({status: 'error', msg:'An error occured'})
    }
})

module.exports = router