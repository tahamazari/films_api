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

const valid_film = (film) => {
    if((typeof(film.title) == "string" && film.title.trim() != "") && (typeof(film.year) == "string" && film.year.trim() != "")
     && (typeof(film.description) == "string" && film.description.trim() != "")){
      return film
    }
    else return false
}

class Films {
  
  static createFilm(req, res) {
    if(valid_film(req.body)){
      console.log(req.body)
      const {title, year, description} = req.body
      return models.film.create({title, year, description})
      .then((data) => {
        res.status(200).json({success: true, message: `Film added with title ${title}`})
      })
      .catch(err => res.status(400).json({success: false, message: "Sorry! Film could not be created"})) 
    }
    else {
      res.status(400).json({success: false, message: "Please enter valid film details"})
    }
  }

  static getFilms(req, res){
    return models.film.findAll()
    .then((data) => {
      res.status(200).json({success: true, message: "All films retrieved", data})
    })
    .catch(err => res.status(400).json({success: false, message: "Could not retrieve films"}))
  }

  static getFilmById(req, res){
    const {id} = req.params
    return models.film.findByPk(id)
    .then(data => res.status(200).json({success: true, message: `Film with Id: ${id} retrieved`, data}))
    .catch(err => res.status(400).json({success: false, message: `Could not get film with Id: ${id}`}))
  }

  static deleteFilm(req, res){
    const {id} = req.params
    return models.film.destroy({where: {id: id}})
    .then(data => res.status(200).json({success: true, message: `Film with Id: ${id} deleted`}))
    .catch(err => res.status(400).json({success: false, message: `Could not delete film with Id: ${id}`}))
  }

  static updateFilm(req, res){
    const {title, year, description} = req.body
    const {id} = req.params
    return models.film.update({title, year, description}, {where: {id}})
    .then(() => res.status(200).json({success: true, message: `Film edited with Id: ${id}`}))
    .catch(err => res.status(400).json({success: false, message: `Could not delete film with Id: ${id}`}))
  }

  static filterSearch(req, res){
    const {minYear, maxYear} = req.body
    return models.film.findAll({
        attributes: ['id', 'title', 'year', 'description'],
        where: {
          year: {
            [Sequelize.Op.between]: [minYear, maxYear]
          }
        },
        include: [{
          model: models.rating,
          required: true,
          attributes: ['rating'],
          raw: true,
        }],
        // group: [['title']]
    })
    .then(data => {
      res.status(200).json({success: true, message: "Your data", data})
    })
    .catch(err => res.status(400).json({success: false, message: `Could not fetch requested data`}))
  }
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
    filter_search,
    Films
}

