const express = require('express')
const users_router = express.Router()
const films_router = express.Router()
const users_table = require('../queries/user_queries.js')
const films_table = require('../queries/film_queries.js')

//USERS REQUESTS GO HERE
//get all users
users_router.get('/api/accounts', users_table.get_users)
//sign up
users_router.post('/api/accounts/sign_up', users_table.sign_up)

users_router.put('/api/accounts/update/:id', users_table.update_user)

users_router.get('/api/accounts/:id', users_table.get_user_by_id)

module.exports = users_router