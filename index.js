const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const cors = require('cors')
const PORT = process.env.PORT || 3000
var cookieParser = require('cookie-parser')
const users_router = require('./routes/user_routes.js')
const films_router = require('./routes/film_routes.js')
const ratings_router = require('./routes/rating_routes.js')



app.use(cors())
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)
app.use(cookieParser("tintash"))
app.use(users_router)
app.use(films_router)
app.use(ratings_router)


app.get('/', (request, response) => {
    response.json({ info: 'Node.js, Express, and Postgres API' })
})

app.listen(PORT, () => {
    console.log('starting server')
    console.log(`App running on port ${PORT}.`)
})