const express = require('express')
const dotenv = require('dotenv')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const User = require('../model/user')

const router = express.Router()
dotenv.config()


//edit profile
router.post('/edit_profile', async(req, res) =>{
    const {token, fullname, email, phone_no, age, gender} = req.body
    if(!token)
        return res.status(400).send({status: 'error', msg:'All fields must be filled'})

    try {
        const user = jwt.verify(token, process.env.JWT_SECRET)

        let Muser = await User.findOne({_id: user._id}, {fullname: 1, email: 1, phone_no: 1, age: 1, gender: 1}).lean()
        if(!Muser)
            return res.status(200).send({status: 'ok', msg: 'No user found'})

        Muser = await User.findOneAndUpdate({_id: user._id}, {
            fullname: fullname || Muser.fullname,
            email: email || Muser.email,
            phone_no: phone_no || Muser.phone_no,
            age: age || Muser.age,
            gender: gender || Muser.gender
        }, {new: true}).lean()

        return res.status(200).send({status: 'ok', msg: 'Edited successfully', Muser})

    } catch (error) {
        console.log(error)
        if(error == "JsonWebTokenError")
            return res.status(400).send({status: 'error', msg: 'Invalid token'})

        return res.status(500).send({status: 'error', msg:'An error occured'})
    }
})


module.exports = router