const { DataTypes } = require('sequelize');
const sequelize = require('../../config/db');

const InternacionNotasenfermeria = sequelize.define('InternacionNotasenfermeria', {
  idinternotas: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  idinternacion: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'internacion',
      key: 'idinternacion'
    }
  },
  idenfermero: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'enfermeros',
      key: 'idenfermero'
    }
  },
  fechanota: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  nota: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'internacion_notasenfermeria',
  timestamps: true,
  paranoid: false
});

InternacionNotasenfermeria.associate = (models) => {
  InternacionNotasenfermeria.belongsTo(models.Internacion, {
    foreignKey: 'idinternacion',
    as: 'internacion'
  });
  InternacionNotasenfermeria.belongsTo(models.Enfermero, {
    foreignKey: 'idenfermero',
    as: 'enfermero'
  });
};

module.exports = InternacionNotasenfermeria;
