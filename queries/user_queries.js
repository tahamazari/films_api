const Pool = require('pg').Pool
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken');
// const pool = new Pool({
//   user: 'nrgoqggosvxrhw',
//   host: 'ec2-174-129-41-127.compute-1.amazonaws.com',
//   database: 'dau95st8sst9b1',
//   password: '03faee6488795156194c5d384a38e9fe8eaf62bf3d78642bcd8afdf1d98b31d0',
//   port: 5432,
// })
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
                        response.status(400).json({register: false, message: `User with Email: ${request.body.email} already exists`})
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
                              response.status(201).json({register: true})
                            })
                        })
                    }
                }
            })
    }
    else {
        response.status(400).json({register: false, message: "Invalid user credentials. Try again!"})
    }
}

const update_user = (request, response) => {
    jwt.verify(request.token, 'tintash', (err, auth_data) => {
        if(err){
            response.status(403).send("Access Denied")
        }
        else {
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
    })
}

const change_password = (request, response) => {
    jwt.verify(request.token, 'tintash', (err, auth_data) => {
        if(err){
            response.status(403).send("Access Denied")
        }
        else {
            const id = parseInt(request.params.id)
            const { password } = request.body
        
            bcrypt.hash(password, 10)
            .then((hash) => {
                pool.query('UPDATE users SET password = $1 WHERE id = $2', [hash, id], (error, response) => {
                    if(error){
                        throw error
                    }
                    else {
                        response.status(201).send('User password updated with ID: ' + id)
                    }
                })
            })
        }         
    })
}

const get_user_by_id = (request, response) => {
    jwt.verify(request.token, 'tintash', (err, auth_data) => {
        if(err){
            response.status(403).send("Access Denied")
        }
        else {
            const id = parseInt(request.params.id)
  
            pool.query('SELECT * FROM users WHERE id = $1', [id], (error, results) => {
              if (error) {
                throw error
              }
              response.status(200).json(results.rows)
            })
        }
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
                                if(jwt_error) {
                                    throw jwt_error
                                }
                                response.status(200).json({
                                    token: token,
                                    id: results.rows[0].id,
                                    name: results.rows[0].name,
                                    email: results.rows[0].email,
                                    login: true
                                })
                            })
                            // console.log(response.cookie('user_id', results.rows[0].id))
                            // console.log(hash_response, results.rows[0].password, request.body.password)
                            // response.status(200).json(results.rows[0])
                        }
                        else {
                            console.log(hash_response, results.rows[0].password, request.body.password)
                            response.status(400).json({
                                                  message: "Wrong password, please try again!",
                                                  login: false})
                        }
                    })
                }
                else {
                    response.status(400).json({
                                              message: "Sorry, user not found",
                                              login: false})
                }
            }
          })
    }
    else {
        response.status(400).json({
                                              message: "Invalid login credentials",
                                              login: false})
    }
}

module.exports = {
    get_users,
    sign_up,
    update_user,
    get_user_by_id,
    login,
    change_password
  }

