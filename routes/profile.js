const express = require('express')
const dotenv = require('dotenv')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const User = require('../model/user')
const Cloudinary = require('../utils/cloudinary')
const Uploader = require('../utils/multer')

const router = express.Router()
dotenv.config()


//edit profile
router.post('/edit_profile', Uploader.single('image'), async(req, res) =>{
    const {token, fullname, email, phone_no, age, gender} = req.body
    if(!token)
        return res.status(400).send({status: 'error', msg:'All fields must be filled'})

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET)

        let Muser = await User.findOne({_id: user._id}, {fullname: 1, email: 1, phone_no: 1, age: 1, gender: 1, img_id: 1, img_url: 1}).lean()
        if(!Muser)
            return res.status(200).send({status: 'ok', msg: 'No user found'})

        let img_id= "", img_url = ""
        // check if user passed in an image to upload
        if(req.file)
        // checks if there was a profile picture there before and destory
        if(Muser.img_id)
            await Cloudinary.uploader.destroy(Muser.img_id)

        //upload new picture
        const{secure_url, public_id} = await Cloudinary.uploader.upload(req.file.path, {
            folder: "user-images",
          })
        img_id = public_id
        img_url = secure_url

        //update user document
        Muser = await User.findOneAndUpdate({_id: user._id}, {
            fullname: fullname || Muser.fullname,
            email: email || Muser.email,
            phone_no: phone_no || Muser.phone_no,
            age: age || Muser.age,
            gender: gender || Muser.gender,
            img_id: img_id || Muser.img_id,
            img_url: img_url || Muser.img_url
        }, {new: true}).lean()

        return res.status(200).send({status: 'ok', msg: 'Edited successfully', Muser})

    } catch (error) {
        console.log(error)
        if(error.name == "JsonWebTokenError")
            return res.status(400).send({status: 'error', msg: 'Invalid token'})

        return res.status(500).send({status: 'error', msg:'An error occured'})
    }
})

// endpoint to view profile
router.post('/view_profile', async(req, res) =>{
    const {token }= req.body
    if(!token)
        return res.status(400).send({status: 'error', msg: 'Token required'})

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET)

        const Muser = await User.findOne({_id: user._id}).lean()
        if(!Muser)
            return res.status(200).send({status: 'ok', msg: 'No user Found'})

        return res.status(200).send({status: 'ok', msg: 'Successful', Muser})
        
    } catch (error) {
        console.log(error)
        if(error.name == "JsonWebTokenError")
            return res.status(400).send({status: 'error', msg: 'Invalid token'})

        return res.status(500).send({status: 'error', msg:'An error occured'})
    }
})

//endpoint to view single profile
router.post('/view_single_profile', async(req, res) =>{
    const {token, user_id} = req.body
    if(!token || !user_id)
        return res.status(400).send({status: 'error', msg: 'All fields must be filled'})
    
    try {
        jwt.verify(token, process.env.JWT_SECRET)
        const Muser = await User.findOne({_id: user_id}).lean()

        return res.status(200).send({status: 'ok', msg: 'Successful', Muser})
        
    } catch (error) {
        console.log(error)
        if(error.name == "JsonWebTokenError")
            return res.status(400).send({status: 'error', msg: 'Invalid token'})

        return res.status(500).send({status: 'error', msg:'An error occured'}) 
    }
})


// change password
router.post('/change_password', async(req, res) =>{
    const {token, password, new_password, confirm_new_password} = req.body
    if(!token || !password || !new_password || !confirm_new_password)
        return res.status(400).send({status: 'error', msg: 'All fields must be filled'})

    try {
        //verify user
        const user = jwt.verify(token, process.env.JWT_SECRET)

        //get user document
        let Muser = await User.findOne({_id: user._id}, {password: 1}).lean()

        //confirm password matches with database password
        const correct = await bcrypt.compare(password, Muser.password)

        if(correct ){
             if(new_password !== confirm_new_password)
                return res.status(400).send({status: 'error', msg: 'New password fields missmatch'})

             const hashedpassword = await bcrypt.hash(new_password, 10)
             await User.findOneAndUpdate({_id: user._id}, {password: hashedpassword}, {new: true}).lean()

             return res.status(200).send({status: 'ok', msg: 'Password successfully updated'})
        }

        return res.status(400).send({status: 'error', msg: 'Password missmatch'})
            
    } catch (error) {
        console.log(error)
        if(error.name == "JsonWebTokenError")
            return res.status(400).send({status: 'error', msg: 'Invalid token'})

        return res.status(500).send({status: 'error', msg:'An error occured'})
    }
})

module.exports = router