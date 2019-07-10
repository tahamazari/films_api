const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const cors = require('cors')
const PORT = process.env.PORT || 3000
var cookieParser = require('cookie-parser')
const users_router = require('./routes/user_routes.js')
const films_router = require('./routes/film_routes.js')
const ratings_router = require('./routes/rating_routes.js')

// var whitelist = [
//   'https://react-spa-tintash.herokuapp.com',
// ];
// var corsOptions = {
//   origin: function(origin, callback){
//       var originIsWhitelisted = whitelist.indexOf(origin) !== -1;
//       callback(null, originIsWhitelisted);
//   },
//   credentials: true
// };
// app.use(cors(corsOptions));

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


// app.use(function(request, response, next) {
//   response.header("Access-Control-Allow-Origin", "*");
//   response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
//   next();
// });

app.get('/', (request, response) => {
    response.json({ info: 'Node.js, Express, and Postgres API' })
})

app.listen(PORT, () => {
    console.log('starting server')
    console.log(`App running on port ${PORT}.`)
})