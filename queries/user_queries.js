const Pool = require('pg').Pool
const bcrypt = require('bcrypt')
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



class Users {

    static getUsers(req, res) {
        jwt.verify(req.token, 'tintash', (err, auth_data) => {
            if(err){
                res.status(403).send("Access Denied")
            }
            else {
                return models.user.findAll()
                .then((data) => res.status(201).json({ success: true, message: 'All users:', data })) 
                .catch(err => res.status(400).json({success: false, message: "Error"}))
            }           
        }) 
    }

    static getById(req, res){
        jwt.verify(req.token, 'tintash', (err, auth_data) => {
            if(err){
                res.status(403).send("Access Denied")
            }
            else {
                const {id} = req.params
                return models.user.findByPk(id)
                .then((data) => {
                    if(data != null){
                        res.status(201).json({ success: true, message: `Returned user with id ${id}`, data })
                    }
                    else {
                        res.status(404).json({ success: false, message: `User not found`})
                    }
                })  
                .catch(err => res.status(400).json({success: false, message: "Error"}))
            }           
        })
    }

    static signUp(req, res){
        if(valid_user_sign_up(req.body)){
            const {name, email, password} = req.body
            return models.user.findOne({where: {email}})
            .then((data) => {
                if(data){
                    res.status(400).json({success: false, message: `User with email ${email} already exists`})
                }
                else {
                    bcrypt.hash(password, 10)
                    .then((hash) => {
                        console.log(hash, password)
                        return models.user.create({name, email, password: hash})
                        .then(data => res.status(200).json({success: true, message: `User created with email ${email}`}))
                        .catch(err => res.status(404).json({ success: false, message: "Error!"}))
                    })
                }
            })
            .catch(err => res.status(404).json({ success: false, message: "Error!"}))
        }
        else {
            res.status(400).json({success: false, message: "Please enter valid details"})
        }
    }

    static updateUser(req, res){
        jwt.verify(req.token, 'tintash', (err, auth_data) => {
            if(err){
                res.status(403).send("Access Denied")
            }
            else {
                const {id, name, email} = req.body
                return models.user.update({name, email}, {where: {id}})
                .then(() => res.status(201).json({ success: true, message: `Updated user ${name}`}))
                .catch(err => res.status(404).json({ success: false, message: "Could not update user"}))
            }           
        })
    }

    static updatePassword(req, res){
        jwt.verify(req.token, 'tintash', (err, auth_data) => {
            if(err){
                res.status(403).send("Access Denied")
            }
            else {
                const {id, password} = req.body
                return models.user.update({password: password}, {where: {id}})
                .then(() => res.status(201).json({ success: true, message: `Updated user password with id: ${id}`}))
                .catch(err => res.status(404).json({ success: false, message: "Could not update user password"}))
            }           
        })
    }

    static login(req, res){
        if(valid_user_login(req.body)){
            const {email, password} = req.body
            return models.user.findOne({where: {email}})
            .then((data) => {
                if(!data){
                    res.status(400).json({success: false, message: "Could not find user. Try signing up!"})
                }
                else {
                    bcrypt.compare(password, data.password)
                    .then((hash_response) => {
                        if(hash_response){
                            jwt.sign({user: data}, 'tintash', (jwt_error, token) => {
                                if(jwt_error) {
                                    throw jwt_error
                                }
                                res.status(200).json({
                                    token: token,
                                    id: data.id,
                                    name: data.name,
                                    email: data.email,
                                    login: true
                                })
                            })
                        }
                        else {
                            res.status(400).json({success: false, message: "Wrong Password!"})
                        }
                    })
                }
            })
            .catch(err => res.status(400).json({success: false, message: "Could not find user. Try signing up!"}))
        }
        else {
            res.status(401).json({ success: false, message: "Please enter valid user credentials"})
        }
    }
}

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
    change_password,
    Users
  }

