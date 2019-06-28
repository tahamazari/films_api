const express = require('express')
const users_router = express.Router()
const films_router = express.Router()
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

//USERS REQUESTS GO HERE
//get all users
users_router.get('/api/accounts', verify_token, users_table.get_users)
//sign up
users_router.post('/api/accounts/sign_up', users_table.sign_up)

users_router.put('/api/accounts/update/:id', verify_token, users_table.update_user)
users_router.put('/api/accounts/change_password/:id', verify_token, users_table.change_password)

users_router.get('/api/accounts/:id', verify_token, users_table.get_user_by_id)

users_router.post('/api/accounts/login', users_table.login)


module.exports = users_router