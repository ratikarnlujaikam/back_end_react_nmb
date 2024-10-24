const Sequelize = require("sequelize");

const sequelize = new Sequelize("mp_minebea_thai_2", "minebea_user", "!m4n30B3A*5", {
  host: "Pbpmp01",
  // host: "10.120.122.10", // If you need to switch hosts
  port: 3336, // MySQL default port
  dialect: "mysql",
  dialectOptions: {
    options: { requestTimeout: 600000 }, // MySQL doesn't typically use this option, so it can be omitted
  },
  // Additional pool options (optional)
  pool: {
    max: 5,
    min: 0,
    idle: 10000,
  },
});



sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

module.exports = sequelize;
