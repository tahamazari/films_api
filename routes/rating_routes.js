const express = require('express')
const ratings_router = express.Router()
const ratings_table = require('../queries/rating_queries.js')

//Ratings REQUESTS GO HERE

ratings_router.post('/api/ratings/give_rating', ratings_table.give_rating)
ratings_router.get('/api/ratings/fetch_ratings_for_film/:id', ratings_table.fetch_ratings_for_film)
ratings_router.get('/api/ratings/fetch_all_ratings', ratings_table.fetch_all_ratings)
ratings_router.put('/api/ratings/update_ratings/:id', ratings_table.update_rating)
ratings_router.delete('/api/ratings/delete_rating/:id', ratings_table.delete_rating)
ratings_router.get('/api/ratings/particular_rating/:id', ratings_table.particular_rating)


module.exports = ratings_router