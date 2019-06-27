const Pool = require('pg').Pool
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'movies',
  password: '1234',
  port: 5432,
})


const get_films = (request, response) => {
    pool.query('SELECT * FROM films ORDER BY id ASC', (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
    })
}

const get_film_by_id = (request, response) => {
    const id = parseInt(request.params.id)
  
    pool.query('SELECT * FROM films WHERE id = $1', [id], (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
    })
}

const create_film = (request, response) => {
    const { title, year, description } = request.body
  
    pool.query('INSERT INTO films(title, year, description) VALUES($1, $2, $3)', [title, year, description], (error, results) => {
      if (error) {
        throw error
      }
      response.status(201).send(`Movie Title: ${request.body.title}`)
    })
}

const delete_film = (request, response) => {
    const id = parseInt(request.params.id)
  
    pool.query('DELETE FROM films WHERE id = $1', [id], (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).send(`Film deleted with ID: ${id}`)
    })
}

const update_film = (request, response) => {
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

module.exports = {
    get_films,
    get_film_by_id,
    create_film,
    delete_film,
    update_film
  }

