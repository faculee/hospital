const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const Medicamento = sequelize.define('Medicamento', {
  idmedicamento: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombremedicamento: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  presentacion: {
    type: DataTypes.STRING(100),
    allowNull: false 
  },
  idclasificacionterapeutica: {
    type: DataTypes.INTEGER
  }
}, {
  tableName: 'medicamentos',
  timestamps: false
});

Medicamento.associate = (models) => {
  Medicamento.belongsTo(models.ClasificacionTerapeutica, {
    foreignKey: 'idclasificacionterapeutica',
    as: 'clasificacionTerapeutica'
  });
  
  Medicamento.hasMany(models.InternacionMedicamento, {
    foreignKey: 'idmedicamento',
    as: 'prescripciones'
  });
};

module.exports = Medicamento;