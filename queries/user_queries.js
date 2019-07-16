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

module.exports = {
    Users
}

