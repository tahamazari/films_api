var Sequelize = require('sequelize');


const sequelize = new Sequelize('films', 'postgres', '1234');

const models = {
    user: sequelize.import('./user'),
    film: sequelize.import('./film'),
    rating: sequelize.import('./rating')
}


Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = models;