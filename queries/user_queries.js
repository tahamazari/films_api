const Pool = require('pg').Pool
const bcrypt = require('bcrypt')
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'movies',
  password: '1234',
  port: 5432,
})



//User functions
const valid_user = (user) => {
    if((typeof(user.name) == "string" && user.name.trim() != "") && (typeof(user.email) == "string" && user.email.trim() != "")
     && (typeof(user.password) == "string" && user.password.trim() != "")){
      return user
    }
    else return false
  }
  


const get_users = (request, response) => {
    pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
    })
}

const sign_up = (request, response) => {
    if(valid_user(request.body)){
        pool.query('SELECT COUNT(*) AS count FROM users WHERE email = $1', 
            [request.body.email], function(error, results){
                if (error) {
                    response.status(501).send("Error " + request.body.email)
                  }
                else {
                    if(results.rows[0].count > 0) {
                        console.log(results.rows[0].count)
                        response.status(409).send(`User with Email: ${request.body.email} already exists `)
                    }
                    else {
                        bcrypt.hash(request.body.password, 10)
                        .then((hash) => {
                            const { name, email } = request.body
                            console.log(hash)
                            pool.query('INSERT INTO users(name, email, password) VALUES($1, $2, $3)', [name, email, hash], (db_error, db_results) => {
                              if (db_error) {
                                throw db_error
                              }
                              console.log(request.body)
                              response.status(201).send(`User added with ID: ${db_results.insertId}, ${request.body.name}`)
                            })
                        })
                    }
                }
            })
    }
    else {
        response.status(400).send("Invalid credentials" + request.body.email)
    }
}

const update_user = (request, response) => {
    const id = parseInt(request.params.id)
    const { name, email } = request.body
  
    pool.query(
      'UPDATE users SET name = $1, email = $2 WHERE id = $3',
      [name, email, id],
      (error, results) => {
        if (error) {
          throw error
        }
        response.status(200).send(`User modified with ID: ${id}`)
      }
    )
}

const get_user_by_id = (request, response) => {
    const id = parseInt(request.params.id)
  
    pool.query('SELECT * FROM users WHERE id = $1', [id], (error, results) => {
      if (error) {
        throw error
      }
      response.status(200).json(results.rows)
    })
}

module.exports = {
    get_users,
    sign_up,
    update_user,
    get_user_by_id
  }

