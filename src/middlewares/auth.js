function estaAutenticado(req, res, next) {
  if (req.session.usuario) {
    return next();
  }
  res.redirect('/login');
}

function tieneRol(permisosPermitidos = []) {
  return (req, res, next) => {
    const rolUsuario = req.session?.usuario?.rol;
    if (permisosPermitidos.includes(rolUsuario)) {
      return next();
    }
    res.status(403).send('Acceso no autorizado');
  };
}


module.exports = { estaAutenticado, tieneRol };
