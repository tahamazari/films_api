const express = require('express')
const films_router = express.Router()
const films_table = require('../queries/film_queries.js')

//FILMS REQUESTS GO HERE
//get all films
films_router.get('/api/films/', films_table.get_films)
films_router.get('/api/films/:id', films_table.get_film_by_id)
films_router.post('/api/films/create_film', films_table.create_film)
films_router.delete('/api/films/:id', films_table.delete_film)
films_router.put('/api/films/update/:id', films_table.update_film)

module.exports = films_router