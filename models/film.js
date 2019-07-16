'use strict';
const rating = require('./index')

module.exports = (sequelize, DataTypes) => {
  const film = sequelize.define('film', {
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    year: DataTypes.DATE
  }, {});
  film.associate = function(models) {
    film.hasMany(models.rating, {foreignKey: 'film_id', sourceKey: 'id'})
  };
  return film;
};