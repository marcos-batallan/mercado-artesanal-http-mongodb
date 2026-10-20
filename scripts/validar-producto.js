const { Producto } = require("../src/modelos/producto");

async function main() {
  const producto = new Producto({
    nombre: "Mate de cerámica",
    categoria: "Cerámica",
    precio: 12000,
    descripcion: "Pieza artesanal esmaltada",
  });
  await producto.validate();
  console.log("Datos válidos. Todavía no guardamos en MongoDB.");
}

main().catch((error) => {
  console.error("Validación rechazada:", error.name);
  if (error.errors) {
    console.error("Campos a revisar:", Object.keys(error.errors).join(", "));
  }
  process.exitCode = 1;
});
