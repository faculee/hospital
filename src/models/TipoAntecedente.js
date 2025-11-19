const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const TipoAntecedente = sequelize.define('TipoAntecedente', {
  idtipoantecedente: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  denominacionantecedente: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true
    }
  }
}, {
  tableName: 'tipoantecedentes',
  timestamps: false,
  paranoid: false
});

TipoAntecedente.associate = (models) => {
  TipoAntecedente.hasMany(models.PacienteAntecedente, {
    foreignKey: 'idtipoantecedente',
    as: 'antecedentes'
  });
};

module.exports = TipoAntecedente;
