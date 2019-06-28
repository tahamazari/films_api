const express = require('express')
const films_router = express.Router()
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


//FILMS REQUESTS GO HERE
//get all films
films_router.get('/api/films', verify_token, films_table.get_films)
films_router.get('/api/films/:id', verify_token, films_table.get_film_by_id)
films_router.post('/api/films/create_film', verify_token, films_table.create_film)
films_router.delete('/api/films/:id', verify_token, films_table.delete_film)
films_router.put('/api/films/update/:id', verify_token, films_table.update_film)

module.exports = films_router