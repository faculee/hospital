const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const PacienteAntecedente = sequelize.define('PacienteAntecedente', {
  idpacienteantecedente: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  idpaciente: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  idmedico: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  idtipoantecedente: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  notasdeltipo: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'pacientes_antecedentes',
  timestamps: true,
  paranoid: false
});

PacienteAntecedente.associate = (models) => {
  PacienteAntecedente.belongsTo(models.Paciente, {
    foreignKey: 'idpaciente',
    as: 'paciente'
  });

  PacienteAntecedente.belongsTo(models.Medico, {
    foreignKey: 'idmedico',
    as: 'medico'
  });

  PacienteAntecedente.belongsTo(models.TipoAntecedente, {
    foreignKey: 'idtipoantecedente',
    as: 'tipoantecedente'
  });
};

module.exports = PacienteAntecedente;
