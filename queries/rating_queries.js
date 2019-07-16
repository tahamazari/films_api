const Pool = require('pg').Pool
const jwt = require('jsonwebtoken');
const pool = new Pool({
    user: 'nrgoqggosvxrhw',
    host: 'ec2-174-129-41-127.compute-1.amazonaws.com',
    database: 'dau95st8sst9b1',
    password: '03faee6488795156194c5d384a38e9fe8eaf62bf3d78642bcd8afdf1d98b31d0',
    port: 5432,
  })
const models = require('../models/index')
const Sequelize = require('sequelize');

// jwt.verify(request.token, 'tintash', (err, auth_data) => {
//     if(err){
//         response.status(403).send("Access Denied")
//     }
//     else {
        
//     }           
// })

class Ratings {
    static rateFilm(req, res){
        const {user_id, film_id, rating} = req.body
        return models.rating.findOne({where: {user_id, film_id}})
        .then((data) => {
            console.log(data)
            if(data == null){
                return models.rating.create({user_id, film_id, rating})
                .then((rateData) => {
                    res.status(200).json({success: true, message: `Film with id: ${film_id} rated by user with id: ${user_id}`, rateData})
                })
                .catch(err => res.status(400).json({success: false, message: "Sorry could not rate film"}))
            }
            else {
                res.status(400).json({success: false, message: "You have already rated this film. Edit your previous rating instead!"})
            }
        })
        .catch(err => res.status(400).json({success: false, message: "Sorry could not rate film"}))
    }

    static ratingsOfFilm(req, res){
        const {id} = req.params
        return models.rating.findOne({where: {film_id: id}})
        .then((data) => {
            if(data != null){
                res.status(200).json({success: true, message: `Fetched all ratings for film with Id: ${id}`, data})
            }
            else {
                res.status(400).json({success: true, message: `No ratings for film with Id: ${id}`})
            }
        })
        .catch(err => res.status(400).json({success: false, message: "Sorry could not fetch ratings for your film"}))
    }

    static allRatings(req, res){
        return models.rating.findAll()
        .then(data => {
            res.status(200).json({success: true, message: `Fetched all ratings`, data})
        })
        .catch(err => res.status(400).json({success: false, message: "Sorry, no ratings found"}))
    }

    static updateRating(req, res){
        const {user_id, film_id, rating} = req.body
        return models.rating.update({rating}, {where: {user_id, film_id}})
        .then(data => {
            res.status(200).json({success: true, message: `Film rating updated for User: ${user_id} and Film: ${film_id}`})
        })
        .catch(err => res.status(400).json({success: false, message: "Sorry, can't edit rating at the moment"}))
    }

    static averageFilmRatings(req,res){
        const {film_id} = req.params
        return models.rating.findAll({
            attributes: [[Sequelize.fn('avg', Sequelize.col('rating')), 'average']],
            raw: true,
        })
        .then(data => {
            res.status(200).json({success: true, message: `Fetched average ratings for film with Id: ${film_id}`, data:  parseInt(data[0].average).toFixed(2)})
        })
        .catch(err => res.status(400).json({success: false, message: `Sorry, couldn't fetch average ratings for film with Id: ${film_id}`}))
    }
}

const give_rating = (request, response) => {
    jwt.verify(request.token, 'tintash', (err, auth_data) => {
        if(err){
            response.status(403).send("Access Denied")
        }
        else {
            const {film_id, user_id, rating} = request.body
            pool.query('SELECT * FROM ratings WHERE film_id = $1 AND user_id = $2', [film_id, user_id], (err, result) => { 
                if(err){
                    throw err
                }
                else if(result.rows.length == 0){
                    pool.query('INSERT INTO ratings(film_id, user_id, rating) VALUES($1, $2, $3)', [film_id, user_id, rating], (error, results) => {
                        if(error){
                            throw error
                        }
                        
                        response.status(200).json({message: "Successfully rated this film"})
                    })
                }

                else {
                    response.status(409).json({message: "You have already rated this film. Edit your previous rating instead!"})
                }
                
            })
        }           
    })
}

const fetch_ratings_for_film = (request, response) => {
    jwt.verify(request.token, 'tintash', (err, auth_data) => {
        if(err){
            response.status(403).send("Access Denied")
        }
        else {
            const id = Number(request.params.id)

            pool.query('SELECT * FROM ratings WHERE film_id = $1', [id], (error, results) => {
                if(error){
                    throw error
                }

                const ratings = results.rows.map((value) => {
                    return value.rating
                })

 
                let average = (ratings.reduce((total, val) => total + val) / ratings.length).toFixed(1)
                console.log(average)
                
                response.status(200).json({
                    average: average
                })
            })
        }           
    })
}

const fetch_all_ratings = (request, response) => {
    jwt.verify(request.token, 'tintash', (err, auth_data) => {
        if(err){
            response.status(403).send("Access Denied")
        }
        else {
            pool.query('SELECT * FROM ratings ORDER BY id ASC', (error, results) => {
                if(error){
                    throw error
                }
                
                response.status(200).send({
                    ratings: results.rows
                })
            })
        }           
    })
}

const fetch_average_ratings = (request, response) => {
    jwt.verify(request.token, 'tintash', (err, auth_data) => {
        if(err){
            response.status(403).send("Access Denied")
        }
        else {
            let id = request.params.id
console.log(request.params)
            pool.query('SELECT cast(avg(rating) as decimal(10,1)) FROM ratings where film_id = $1', [id], (error, results) => {
                if(error){
                    throw error
                }
                
                response.status(200).json({
                    average: results.rows[0].avg
                })
            })
        }           
    })
}

const update_rating = (request, response) => {
    jwt.verify(request.token, 'tintash', (err, auth_data) => {
        if(err){
            response.status(403).send("Access Denied")
        }
        else {
            const id = parseInt(request.params.id)
            const { rating, film_id } = request.body
          
            pool.query(
              'UPDATE ratings SET rating = $1 WHERE user_id = $2 AND film_id = $3',
              [rating, id, film_id],
              (error, results) => {
                if (error) {
                  throw error
                }
                response.status(200).json({message: `Your new rating for this film is : ${rating}`})
              }
            )
        }           
    })
}

const delete_rating = (request, response) => {
    jwt.verify(request.token, 'tintash', (err, auth_data) => {
        if(err){
            response.status(403).send("Access Denied")
        }
        else {
            const id = parseInt(request.params.id)
  
            pool.query('DELETE FROM ratings WHERE id = $1', [id], (error, results) => {
              if (error) {
                throw error
              }
              response.status(200).send(`Rating deleted with ID: ${id}`)
            })
        }           
    })
}

const particular_rating = (request, response) => {
    jwt.verify(request.token, 'tintash', (err, auth_data) => {
        if(err){
            response.status(403).send("Access Denied")
        }
        else {
            const id = parseInt(request.params.id)
  
            pool.query('SELECT * FROM ratings WHERE id = $1', [id], (error, results) => {
              if (error) {
                throw error
              }
        
              const { film_id, user_id, rating } = results.rows[0]
              response.status(200).json({
                  id: id,
                  film_id: film_id,
                  user_id: user_id,
                  rating: rating
              })
            })
        }           
    })
}

module.exports = {
    give_rating,
    fetch_ratings_for_film,
    fetch_all_ratings,
    update_rating,
    delete_rating,
    particular_rating,
    fetch_average_ratings,
    Ratings
}
