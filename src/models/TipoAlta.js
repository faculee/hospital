const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const TipoAlta = sequelize.define('TipoAlta', {
  idtipoalta: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  denominaciontipo: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  }
}, {
  tableName: 'tipoalta',
  timestamps: false
});

TipoAlta.associate = (models) => {
  TipoAlta.hasMany(models.Internacion, { foreignKey: 'idtipoalta', as: 'internaciones' });
};

module.exports = TipoAlta;
