function crearControladorProductos(servicio) {
  async function listar(req, res) {
    const productos = await servicio.listar();
    res.render("productos/lista", {
      titulo: "Productos Artesanales",
      productos,
    });
  }

  function mostrarFormulario(req, res) {
    res.render("productos/nuevo", {
      titulo: "Nuevo producto",
      error: null,
      valores: {},
    });
  }

  async function mostrarDetalle(req, res) {
    const producto = await servicio.obtenerPorId(req.params.id);
    if (!producto) {
      return res.status(404).render("no-encontrado", {
        titulo: "Producto no encontrado",
        mensaje: "No existe ningún producto con ese identificador",
      });
    }
    res.render("productos/detalle", {
      titulo: producto.nombre,
      producto,
    });
  }

  async function crear(req, res) {
    await servicio.crear(req.productoValidado);
    res.redirect("/productos");
  }

  async function listarApi(req, res) {
    const productos = await servicio.listar(req.query.categoria);
    res.json(productos);
  }
  return {
    listar,
    mostrarFormulario,
    mostrarDetalle,
    crear,
    listarApi,
  };
}
module.exports = { crearControladorProductos };
