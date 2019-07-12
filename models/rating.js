'use strict';
module.exports = (sequelize, DataTypes) => {
  const rating = sequelize.define('rating', {
    film_id: DataTypes.INTEGER,
    user_id: DataTypes.INTEGER,
    rating: DataTypes.INTEGER
  }, {});
  rating.associate = function(models) {
    // associations can be defined here
  };
  return rating;
};