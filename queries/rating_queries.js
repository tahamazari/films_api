const Pool = require('pg').Pool
const jwt = require('jsonwebtoken');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'movies',
  password: '1234',
  port: 5432,
})

// jwt.verify(request.token, 'tintash', (err, auth_data) => {
//     if(err){
//         response.status(403).send("Access Denied")
//     }
//     else {
        
//     }           
// })

const give_rating = (request, response) => {
    jwt.verify(request.token, 'tintash', (err, auth_data) => {
        if(err){
            response.status(403).send("Access Denied")
        }
        else {
            const {film_id, user_id, rating} = request.body

            pool.query('INSERT INTO ratings(film_id, user_id, rating) VALUES($1, $2, $3)', [film_id, user_id, rating], (error, results) => {
                if(error){
                    throw error
                }
                
                response.status(200).json({
                    user_id: user_id,
                    film_id: film_id,
                    rating: rating
                })
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
            const { rating } = request.body
          
            pool.query(
              'UPDATE ratings SET rating = $1 WHERE user_id = $2',
              [rating, id],
              (error, results) => {
                if (error) {
                  throw error
                }
                response.status(200).send(`Rating modified with ID: ${id}`)
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
    fetch_average_ratings
}
