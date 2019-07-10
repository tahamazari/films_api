const Pool = require('pg').Pool
const jwt = require('jsonwebtoken');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'movies',
  password: '1234',
  port: 5432,
})

const valid_film = (film) => {
    if((typeof(film.title) == "string" && film.title.trim() != "") && (typeof(film.year) == "string" && film.year.trim() != "")
     && (typeof(film.description) == "string" && film.description.trim() != "")){
      return user
    }
    else return false
}

const get_films = (request, response) => {
    jwt.verify(request.token, 'tintash', (err, auth_data) => {
        if(err){
            response.status(403).send("Access Denied")
        }
        else {
            pool.query('SELECT * FROM films ORDER BY id ASC', (error, results) => {
                if (error) {
                  throw error
                }
                response.status(200).json(results.rows)
            })
        }           
    })
}

const get_film_by_id = (request, response) => {
    jwt.verify(request.token, 'tintash', (err, auth_data) => {
        if(err){
            response.status(403).send("Access Denied")
        }
        else {
            const id = parseInt(request.params.id)
  
            pool.query('SELECT * FROM films WHERE id = $1', [id], (error, results) => {
              if (error) {
                throw error
              }
              response.status(200).json(results.rows)
            })
        }           
    })
}

const create_film = (request, response) => {
     if(valid_film(request.body)){
    jwt.verify(request.token, 'tintash', (err, auth_data) => {
        if(err){
            response.status(403).send("Access Denied")
        }
        else {
            const { title, year, description } = request.body
  
            pool.query('INSERT INTO films(title, year, description) VALUES($1, $2, $3)', [title, year, description], (error, results) => {
              if (error) {
                throw error
              }
              response.status(201).json({
                                        title, year, description 
                                         })
            })
        }           
    })
}
else {
response.status(401).send("Invalid film details")
}
}

const delete_film = (request, response) => {
    jwt.verify(request.token, 'tintash', (err, auth_data) => {
        if(err){
            response.status(403).send("Access Denied")
        }
        else {
            const id = parseInt(request.params.id)
  
            pool.query('DELETE FROM films WHERE id = $1', [id], (error, results) => {
              if (error) {
                throw error
              }
              response.status(200).send(`Film deleted with ID: ${id}`)
            })
        }           
    })
}

const update_film = (request, response) => {
    jwt.verify(request.token, 'tintash', (err, auth_data) => {
        if(err){
            response.status(403).send("Access Denied")
        }
        else {
            const id = parseInt(request.params.id)
            const { title, year, description } = request.body
          
            pool.query(
              'UPDATE films SET title = $1, year = $2, description = $3 WHERE id = $4',
              [title, year, description, id],
              (error, results) => {
                if (error) {
                  throw error
                }
                response.status(200).send(`Film modified with ID: ${id}`)
              }
            )
        }           
    })
}

const filter_search = (request, response) => {
    jwt.verify(request.token, 'tintash', (err, auth_data) => {
        if(err){
            response.status(403).send("Access Denied")
        }
        else {
          const select = "SELECT r.film_id as id, title, f.year, f.description, cast(avg(rating) as decimal(10,1))"
          const join = " FROM films as f INNER JOIN ratings as r ON f.id = r.film_id" 
          const group = " group by title, r.film_id, f.year, f.description"
            const {minYear, maxYear, rating} = request.params
            pool.query(
              `${select} ${join} where year between $1 and $2 and rating >= $3 ${group}`,
              [minYear, maxYear, rating],
              (error, results) => {
                if (error) {
                  throw error
                }
                response.status(200).json({results: results.rows})
              }
            )
        }           
    })
}

module.exports = {
    get_films,
    // get_film_by_id,
    create_film,
    delete_film,
    update_film,
    filter_search
}

