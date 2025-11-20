require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true
      },
      connectTimeout: 20000,

      allowPublicKeyRetrieval: true
    }
  }
);

sequelize.authenticate()
  .then(() => console.log('✅ Conexión exitosa a Railway'))
  .catch(err => console.error('❌ Error de conexión:', err));

module.exports = sequelize;
