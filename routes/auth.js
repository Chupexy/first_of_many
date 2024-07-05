const express = require('express')
const router = express.Router()
const User = require('../model/user')
const bcrypt = require('bcrypt')


//endpoint to signup
router.post('/signup', async(req, res) =>{
    const {fullname, email, password, phone_no} = req.body

    //crosscheck whats gotten from the req.body
    if(!fullname || !email || !password || !phone_no){
         return res.status(400).send({status: 'error', msg:'All fields must be filled'})
    }
       
    try {
         const timestamp = Date.now()
         const hashedpassword = await bcrypt.hash(password, 10)

         //create user document
         const user = new User()
         user.fullname = fullname
         user.email = email
         user.password = hashedpassword
         user.phone_no = phone_no
         user.gender = ""
         user.timestamp = timestamp
         user.age = 

         await user.save()
         return res.status(200).send({status: 'ok', msg:'Account created successfully'})
        
    } catch (error) {
        console.log(error)
        return res.status(500).send({status: 'error', msg:'An error occured'})
    }
})

module.exports = router