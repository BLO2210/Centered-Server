const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt');

app.use(express.json())
app.use(cors())

//import scheams below
const User = require('./schemas/user')

mongoose.connect('mongodb+srv://centeredappdevs:C4h3f1cyrtoDR6rz@cluster0.awbfnpy.mongodb.net/?retryWrites=true&w=majority')
  .then(() => {
    console.log('DB connected')
  }).catch((error) => {
    console.log(error)
  })


app.post('/register', async (req, res) => {
    const username = req.body.username
    const password = req.body.password

    const user = new User({
        username: username,
        password: password
    })
    const salt = await bcrypt.genSalt(10)

    const passwordHash = await bcrypt.hash(password, salt)
    user.password = passwordHash;

    try {
        await user.save()
        res.status(200).json({ message: 'Registration successful' })
      } catch (error) {
        console.error(error)
        res.status(500).json({ message: 'Internal server error' })
      }
})

app.post('/login', (req, res) => {
    const {username, password} = req.body

    User.findOne({ username })
    .then(user => {
        console.log(user)
        if(!user) {
            return res.state(401).json({success: false, message: 'Incorrect username'})
        }
        bcrypt.compare(password, user.password)
        .then(result => {
            console.log(result)
            if(!result) {
                return res.status(401).json({success: false, message: 'Incorrect password'})
            }

            const token = jwt.sign({ username }, 'SECRETKEY')
            res.json({success:true, token, userId: user._id})
        })
        .catch(err => {
            return res.status(500).json({success:false, message: 'Internal server error'})
        })
    })
    .catfch(err => {
        return res.status(500).json({success: false, message: 'Internal server error'})
    })
})

app.listen(8080, () => {
    console.log('Server is up')
  })