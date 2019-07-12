'use strict';

module.exports = {
  up: function(queryInterface, Sequelize) {
    // logic for transforming into the new state
    return queryInterface.removeColumn(
      'users',
      'updatedAt'
    );

  },

  down: function(queryInterface, Sequelize) {
    // logic for reverting the changes
    return queryInterface.addColumn(
      'users',
      'updatedAt',
      Sequelize.DATE
    );
  }
};
