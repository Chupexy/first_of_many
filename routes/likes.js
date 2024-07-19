const express = require('express')
const router = express.Router()
const dotenv = require('dotenv')
dotenv.config()
const jwt = require('jsonwebtoken')

const Post = require('../model/posts')

//endpoint to like a post
router.post('/like_post', async(req, res) =>{
    const {token, post_id} = req.body
if(!token || !post_id)
    return res.status(400).send({status: 'error', msg:'Token required'})

try {
    const user = jwt.verify(token, process.env.JWT_SECRET)

    await Post.findOneAndUpdate({_id: post_id}, {
        $inc: {likes: +1},
        $push: {like_ids: user._id}
    })

    return res.status(200).send({status: 'ok', msg: 'Liked successful'})
    
} catch (error) {
    console.log(error)
    if(error.name == "JsonWebTokenError")
        return res.status(400).send({status: 'error', msg: 'Invalid token'})

    return res.status(500).send({status: 'error', msg:'An error occured'})
}
})

module.exports = router
