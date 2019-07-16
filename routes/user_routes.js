const express = require('express')
const users_router = express.Router()
const users_table = require('../queries/user_queries.js')
const films_table = require('../queries/film_queries.js')
const jwt = require('jsonwebtoken');


const verify_token = (req, res, next) => {
    const bearer_header = req.headers['authorization']
    if(typeof(bearer_header) != 'undefined'){
        const bearer = bearer_header.split(' ')
        const token = bearer[1]
        req.token = token
        next()
    }
    else {
        res.status(500).send("Forbidden")
    }
}

//Sequelize
users_router.get('/api/accounts', verify_token, users_table.Users.getUsers)
users_router.get('/api/accounts/:id', verify_token, users_table.Users.getById)
users_router.post('/api/accounts/signUp', users_table.Users.signUp)
users_router.put('/api/accounts/updateUser', users_table.Users.updateUser)
users_router.put('/api/accounts/updatePassword', users_table.Users.updatePassword)
users_router.post('/api/accounts/login', users_table.Users.login)


module.exports = users_router