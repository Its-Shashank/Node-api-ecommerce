const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')


const User = require('../models/user')

// Create user and signup
router.post('/signup', (req, res, next) => {
    User.find({email: req.body.email})
    .then(user => {
        if (user.length >= 1) {
            return res.status(409).json({
                message: 'Mail exists'
            })
        } else {
            bcrypt.hash(req.body.password, 10, (err, hash) => {
                if (err) {
                    return res.status(500).json({err})
                }
                else {
                    const user = new User({
                        _id: new mongoose.Types.ObjectId(),
                        email: req.body.email,
                        password: hash
                    })
                    user.save()
                    .then(result => {
                        res.status(201).json({
                            message: 'User created!',result
                        })
                    })
                    .catch(err => {
                        console.log(err)
                        res.status(500).json({err})
                    })
                }
            })
        }
    })
})

// Login route
router.post('/login', (req, res) => {
    User.find({email: req.body.email})
    .exec()
    .then(user => {
        if (user.length < 1){ 
            return res.status(400).json({
                message: 'Auth failed'
            })
        }
        bcrypt.compare(req.body.password, user[0].password, (err, result) => {
            if (err) {
                return res.status(400).json({
                    message: 'Auth failed'
                })
            }
            if (result) {
                const token = jwt.sign({
                    email: user[0].email,
                    userId: user[0].id
                }, 
                process.env.SECRET, 
                {
                    expiresIn: '1h'
                })
                return res.status(201).json({
                    message: 'Auth successful',
                    token
                })
            }
            res.status(401).json({
                message: 'Auth failed'
            })
        })
    })
    .catch(err => {
        res.status(400).json({err})
    })
})

// Find all users
router.get('/', (req, res, next) => {
    User.find()
    .exec()
    .then(users => {
        const USER = {
            user: users.map(doc => {
                return {
                    email: doc.email,
                    password: doc.password,
                    _id: doc._id
                }
            })
        }
        res.status(200).json({USER})
    })
    .catch(err => {
        res.status(404).json({err})
    })
})

// Remove an existing user
router.delete('/:userId', (req, res, next) => {
    User.deleteOne({_id: req.params.userId})
    .exec()
    .then(deletedUser => {
        if (deletedUser.length >= 1)
        res.status(200).json({message: 'User deleted'})
        else
        res.status(404).json({message: 'No such user already'})
    })
    .catch(err => {
        res.status(404).json({err})
    })
})

// Delete all users
router.delete('/', (req, res, next) => {
    User.deleteMany()
    .exec()
    .then(result => {
        res.status(200).json({
            message: 'You just deleted all users'
        })
    })
    .catch(errr => {
        res.status(404).json(err)
    })
})

module.exports = router