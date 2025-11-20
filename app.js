require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const sequelize = require('./config/db');
const { estaAutenticado, tieneRol } = require('./src/middlewares/auth');

// Importar rutas API
const atencionMedicaRoutes = require('./src/routes/atencionMedicaRoutes');
const atencionEnfermeriaRoutes = require('./src/routes/atencionEnfermeriaRoutes');
const clasificacionTerapeuticaRoutes = require('./src/routes/clasificacionTerapeuticaRoutes');
const coberturasRoutes = require('./src/routes/coberturasRoutes');
const diagnosticosRoutes = require('./src/routes/diagnosticosRoutes');
const enfermerosRoutes = require('./src/routes/enfermerosRoutes');
const especialidadesRoutes = require('./src/routes/especialidadesRoutes');
const estudiosRoutes = require('./src/routes/estudiosRoutes');
const infraAlasRoutes = require('./src/routes/infraAlasRoutes');
const infraCamasRoutes = require('./src/routes/infraCamasRoutes');
const infraHabitacionesRoutes = require('./src/routes/infraHabitacionesRoutes');
const infraUnidadesRoutes = require('./src/routes/infraUnidadesRoutes');
const infraestructuraRoutes = require('./src/routes/infraestructuraRoutes');
const internacionesRoutes = require('./src/routes/internacionesRoutes');
const medicosRoutes = require('./src/routes/medicosRoutes');
const medicamentosRoutes = require('./src/routes/medicamentosRoutes');
const origenesRoutes = require('./src/routes/origenesRoutes');
const pacientesRoutes = require('./src/routes/pacientesRoutes');
const pacientesAntecedentesRoutes = require('./src/routes/pacientesAntecedentesRoutes');
const rolesRoutes = require('./src/routes/rolesRoutes');
const tiposAltasRoutes = require('./src/routes/tiposAltasRoutes');
const tiposAnestesiasRoutes = require('./src/routes/tiposAnestesiasRoutes');
const tiposAntecedentesRoutes = require('./src/routes/tiposAntecedentesRoutes');
const tiposCirugiasRoutes = require('./src/routes/tiposCirugiasRoutes');
const tiposTerapiasRoutes = require('./src/routes/tiposTerapiasRoutes');
//const unidadesRoutes = require('./src/routes/unidadesRoutes');
const usuariosRoutes = require('./src/routes/usuariosRoutes');
const loginRoutes = require('./src/routes/loginRoutes');

// Importar rutas de vistas
const enfermerosViewRoutes = require('./src/routes/enfermerosViewRoutes');
const medicosViewRoutes = require('./src/routes/medicosViewRoutes');
const pacientesViewRoutes = require('./src/routes/pacientesViewRoutes');

// Crear instancia de Express
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configuración de sesión
app.use(session({
  secret: 'clave-secreta',
  resave: false,
  saveUninitialized: true
}));

// Cache control
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Pasar usuario a las vistas
app.use((req, res, next) => {
  res.locals.usuario = req.session.usuario || null;
  next();
});

// Rutas de login
app.use('/login', loginRoutes);

// Protección general de API
app.use('/api', estaAutenticado);

// Rutas API
app.use('/api/atencionmedica', atencionMedicaRoutes);
app.use('/api/atencionenfermeria', atencionEnfermeriaRoutes);
app.use('/api/clasificaciones', clasificacionTerapeuticaRoutes);
app.use('/api/coberturas', coberturasRoutes);
app.use('/api/enfermeros', enfermerosRoutes);
app.use('/api/especialidades', especialidadesRoutes);
app.use('/api/estudios', estudiosRoutes);
app.use('/api/diagnosticos', diagnosticosRoutes);
app.use('/api/infraalas', infraAlasRoutes);
app.use('/api/infracamas', infraCamasRoutes);
app.use('/api/infrahabitaciones', infraHabitacionesRoutes);
app.use('/api/infraestructura', infraestructuraRoutes);
app.use('/api/infraunidades', infraUnidadesRoutes);
app.use('/api/internaciones', internacionesRoutes);
app.use('/api/medicos', medicosRoutes);
app.use('/api/medicamentos', medicamentosRoutes);
app.use('/api/origenes', origenesRoutes);
app.use('/api/pacientes', pacientesRoutes);
app.use('/api/pacientesantecedentes', pacientesAntecedentesRoutes);
app.use('/api/roles', rolesRoutes);
app.use('/api/tiposaltas', tiposAltasRoutes);
app.use('/api/tiposanestesias', tiposAnestesiasRoutes);
app.use('/api/tiposantecedentes', tiposAntecedentesRoutes);
app.use('/api/tiposcirugias', tiposCirugiasRoutes);
app.use('/api/tiposterapias', tiposTerapiasRoutes);
//app.use('/api/unidades', unidadesRoutes);
app.use('/api/usuarios', usuariosRoutes);

// Vista HTML desde infraestructura
app.use('/infraestructura', estaAutenticado, infraestructuraRoutes);

// Configuración de vistas
app.set('view engine', 'pug');
app.set('views', './views');

// Rutas de vistas
app.get('/', (req, res) => res.render('index'));
app.get('/layout', estaAutenticado, (req, res) => res.render('layout'));
app.get('/medicos', estaAutenticado, tieneRol([1]), (req, res) => res.render('medicos'));
app.get('/enfermeros', estaAutenticado, tieneRol([1]), (req, res) => res.render('enfermeros'));
app.get('/pacientes', estaAutenticado, tieneRol([1, 2, 3, 4]), (req, res) => res.render('pacientes'));
app.get('/historiaclinica', estaAutenticado, tieneRol([1, 3, 4]), (req, res) => res.render('historiaclinica'));
app.get('/antecedentespersonales', estaAutenticado, tieneRol([1, 3]), (req, res) => res.render('antecedentespersonales'));
app.get('/internacion', estaAutenticado, tieneRol([1, 2]), (req, res) => res.render('internacion'));
app.get('/internacionCambiarPaciente', estaAutenticado, tieneRol([1]), (req, res) => res.render('internacionCambiarPaciente'));  
app.get('/infraestructura/camas-ocupadas', estaAutenticado, tieneRol([1, 2, 3, 4]), (req, res) => res.render('listarcamasocupadas'));
app.get('/infraestructura/camas-ocupacion-porcentaje', estaAutenticado, tieneRol([1, 2, 3, 4]), (req, res) => res.render('listarporcentajeocupacion'));
app.get('/infraestructura', estaAutenticado, tieneRol([1]), (req, res) => res.render('infraestructura'));
app.get('/atencionmedica', estaAutenticado, tieneRol([1, 3]), (req, res) => res.render('atencionmedica'));
app.get('/atencionenfermeria', estaAutenticado, tieneRol([1, 4]), (req, res) => res.render('atencionenfermeria'));
app.get('/usuarios', estaAutenticado, tieneRol([1]), (req, res) => res.render('usuarios'));
app.get('/medicamentos', estaAutenticado, tieneRol([1]), (req, res) => res.render('medicamentos'));
app.get('/coberturas', estaAutenticado, tieneRol([1]), (req, res) => res.render('coberturas'));
app.get('/cambiarpassword', estaAutenticado, tieneRol([1, 2, 3, 4]), (req, res) => res.render('cambiarpassword'));

// Rutas de vistas MVC ordenadas
app.use('/', enfermerosViewRoutes);
app.use('/', medicosViewRoutes);
app.use('/', pacientesViewRoutes);

// Sincronización de la base de datos y arranque del servidor
sequelize.sync()
  .then(() => {
    console.log('Base de datos sincronizada correctamente');
    if (require.main === module) {
      const PORT = process.env.PORT || 3000;
      app.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
      });
    }
  })
  .catch((err) => {
    console.error('No se pudo conectar a la base de datos.');
    console.error('Detalles:', err.message);
  });

  // Manejo de errores 404
app.use((req, res, next) => {
  res.status(404).render('404', { url: req.originalUrl });
});

module.exports = app; // Exportar para Vercel
