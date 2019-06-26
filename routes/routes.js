const app = require('express')
const users_router = app.Router()
const db = require('../queries/user_queries.js')


//get all users
users_router.get('/users', db.get_users)

module.exports = users_router;