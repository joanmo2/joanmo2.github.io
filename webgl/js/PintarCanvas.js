/*
Seminario 1 PGC. Pintar canvas
*/

function main() {
    // Recuperar el canvas (lienzo)
    var canvas = document.getElementById("canvas")

    if (!canvas) {
        console.log("Error loading canvas");
        return;
    }

    // obtener el contexto del render (herramientas de dibujo)
    var gl = getWebGLContext(canvas);

    // fijar color de borrado del lienzo
    gl.clearColor(0.0, 0.0, 0.3, 1.0);

    // borrar el canvas
    gl.clear(gl.COLOR_BUFFER_BIT);
}