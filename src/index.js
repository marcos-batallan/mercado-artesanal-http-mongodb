const { leerConfiguracion } = require("./config/entorno");
const {
  conectarBaseDatos,
  desconectarBaseDatos,
} = require("./config/base-datos");
const { crearServicioProductosMongo } = require("./servicios/productos-mongo");
const { crearApp } = require("./app");

async function main() {
  const { puerto, formatoRegistro } = leerConfiguracion();
  await conectarBaseDatos();
  const servicioProductos = crearServicioProductosMongo();
  const app = crearApp({ servicioProductos, formatoRegistro });
  const servidor = app.listen(puerto, () => {
    console.log(`Aplicación disponible en http://localhost:${puerto}`);
  });

  let cerrando = false;

  function cerrar() {
    if (cerrando) return;
    cerrando = true;
    servidor.close(async () => {
      try {
        await desconectarBaseDatos();
      } catch (error) {
        console.error("Error al cerrar:", error.name);
        process.exitCode = 1;
      }
    });
  }
  process.once("SIGINT", cerrar);
  process.once("SIGTERM", cerrar);
  servidor.on("error", (error) => {
    console.error("No se pudo escuchar el puerto:", error.code);
    process.exitCode = 1;
    desconectarBaseDatos().catch((fallo) => {
      console.error("Error al cerrar:", fallo.name);
    });
  });
}

main().catch(async (error) => {
  console.error("No se pudo iniciar la aplicación:", error.name);
  console.error("Revisar entorno, DNS, red, acceso de Atlas y puerto.");
  process.exitCode = 1;
  try {
    await desconectarBaseDatos();
  } catch (fallo) {
    console.error("Error al cerrar:", fallo.name);
  }
});

function prepararAreaProductos(req, res, next) {
  res.locals.seccion = "Productos artesanales";
  next();
}

function validarProducto(req, res, next) {
  const valores = req.body ?? {};
  const nombre =
    typeof valores.nombre === "string" ? valores.nombre.trim() : "";
  const categoria =
    typeof valores.categoria === "string" ? valores.categoria.trim() : "";
  const descripcion =
    typeof valores.descripcion === "string" ? valores.descripcion.trim() : "";
  const precioRecibido = valores.precio;
  const tipoPrecioValido =
    typeof precioRecibido === "number" ||
    (typeof precioRecibido === "string" && precioRecibido.trim() !== "");
  const precio = tipoPrecioValido ? Number(precioRecibido) : NaN;
  if (
    !nombre ||
    !categoria ||
    !descripcion ||
    !Number.isFinite(precio) ||
    precio < 1
  ) {
    if (req.baseUrl === "/api/productos") {
      return res.status(400).json({
        error: "Completá los campos con un precio mayor o igual a 1.",
      });
    }
    return res.status(400).render("productos/nuevo", {
      titulo: "Nuevo producto",
      error: "Completá los campos con un precio mayor o igual a 1.",
      valores,
    });
  }
  req.productoValidado = { nombre, categoria, precio, descripcion };
  next();
}

module.exports = { prepararAreaProductos, validarProducto };
