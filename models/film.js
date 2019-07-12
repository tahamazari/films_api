'use strict';
module.exports = (sequelize, DataTypes) => {
  const film = sequelize.define('film', {
    title: DataTypes.STRING,
    description: DataTypes.STRING,
    year: DataTypes.DATE
  }, {});
  film.associate = function(models) {
    // associations can be defined here
  };
  return film;
};