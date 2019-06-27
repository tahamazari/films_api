const Pool = require('pg').Pool
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'movies',
  password: '1234',
  port: 5432,
})



//User functions
const valid_user_sign_up = (user) => {
    if((typeof(user.name) == "string" && user.name.trim() != "") && (typeof(user.email) == "string" && user.email.trim() != "")
     && (typeof(user.password) == "string" && user.password.trim() != "")){
      return user
    }
    else return false
}

const valid_user_login = (user) => {
    if((typeof(user.email) == "string" && user.email.trim() != "")
     && (typeof(user.password) == "string" && user.password.trim() != "")){
      return user
    }
    else return false
}
  


const get_users = (request, response) => {
    jwt.verify(request.token, 'tintash', (err, auth_data) => {
        if(err){
            response.status(403).send("Access Denied")
        }
        else {
            pool.query('SELECT * FROM users ORDER BY id ASC', (error, results) => {
                if (error) {
                  throw error
                }
                response.status(200).json({
                    rows: results.rows, 
                    auth_data
                })
            })
        }
    })
}

const sign_up = (request, response) => {
    if(valid_user_sign_up(request.body)){
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

const login = (request, response) => {
    if(valid_user_login(request.body)){
        pool.query('SELECT * FROM users WHERE email = $1', [request.body.email], (error, results) => {
            if (error) {
              throw error
            }
            else {
                if(results.rows.length != 0){
                    bcrypt.compare(request.body.password, results.rows[0].password)
                    .then(hash_response => {
                        if(hash_response){
                            response.cookie('user_id', results.rows[0].id, {
                                httpOnly: true,
                                secure: true,
                                signed: true
                            })

                            jwt.sign({user: results.rows[0]}, 'tintash', (jwt_error, token) => {
                                response.status(200).json({
                                    token: token
                                })
                            })
                            // console.log(response.cookie('user_id', results.rows[0].id))
                            // console.log(hash_response, results.rows[0].password, request.body.password)
                            // response.status(200).json(results.rows[0])
                        }
                        else {
                            console.log(hash_response, results.rows[0].password, request.body.password)
                            response.status(400).json("Wrong password, please try again!")
                        }
                    })
                }
                else {
                    response.status(200).send("Sorry, user not found")
                }
            }
          })
    }
    else {
        response.status(400).send("Invalid login credentials")
    }
}

module.exports = {
    get_users,
    sign_up,
    update_user,
    get_user_by_id,
    login
  }

