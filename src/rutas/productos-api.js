const express = require("express");
const { validarProducto } = require("../middleware/productos");

function crearRouterProductosApi (controladorProductos) {
    const router = express.Router();
    router.get("/", controladorProductos.listarApi);
    router.get("/:id", controladorProductos.obtenerApi);
    router.post("/", validarProducto, controladorProductos.crearApi);
    return router;
}

module.exports = { crearRouterProductosApi };