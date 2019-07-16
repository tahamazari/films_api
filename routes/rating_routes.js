const express = require('express')
const ratings_router = express.Router()
const ratings_table = require('../queries/rating_queries.js')
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

//Ratings REQUESTS GO HERE

// ratings_router.post('/api/ratings/give_rating', verify_token, ratings_table.give_rating)
// ratings_router.get('/api/ratings/fetch_ratings_for_film/:id', verify_token, ratings_table.fetch_ratings_for_film)
// ratings_router.get('/api/ratings/fetch_all_ratings', verify_token, ratings_table.fetch_all_ratings)
// ratings_router.put('/api/ratings/update_ratings/:id', verify_token, ratings_table.update_rating)
ratings_router.delete('/api/ratings/delete_rating/:id', verify_token, ratings_table.delete_rating)
ratings_router.get('/api/ratings/particular_rating/:id', verify_token, ratings_table.particular_rating)
// ratings_router.get('/api/ratings/average_rating/:id', verify_token, ratings_table.fetch_average_ratings)


ratings_router.post('/api/ratings/rateFilm', ratings_table.Ratings.rateFilm)
ratings_router.get('/api/ratings/fetchRatings/:id', ratings_table.Ratings.ratingsOfFilm)
ratings_router.get('/api/ratings/fetchRatings', ratings_table.Ratings.allRatings)
ratings_router.put('/api/ratings/updateRating', ratings_table.Ratings.updateRating)
ratings_router.get('/api/ratings/averageRatings/:film_id', ratings_table.Ratings.averageFilmRatings)

module.exports = ratings_router
