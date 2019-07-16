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
films_router.get('/api/films/filter/:minYear/:maxYear/:rating', verify_token, films_table.filter_search)

films_router.post('/api/films/createFilm', films_table.Films.createFilm)
films_router.get('/api/films', films_table.Films.getFilms)
films_router.get('/api/films/:id', films_table.Films.getFilmById)
films_router.delete('/api/films/:id', films_table.Films.deleteFilm)
films_router.put('/api/films/update/:id', films_table.Films.updateFilm)
films_router.post('/api/films/filter', films_table.Films.filterSearch)

module.exports = films_router 