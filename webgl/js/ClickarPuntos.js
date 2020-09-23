/*
Seminario 1 PGC. Hacer click y pintar un punto rojo
*/

// SHADER DE VERTICES
var VSHADER_SOURCE = 
'attribute vec4 posicion; 						\n' + 
'void main(){ 									\n' +
'	gl_Position = posicion; 					\n' + 
'	gl_PointSize = 10.0; 						\n' + 
'} 												\n';

// SHADER DE FRAGMENTOS
var FSHADER_SOURCE = 
'void main(){ 									\n' +
'	gl_FragColor = vec4(1.0,0.0,0.0,1.0); 		\n' + 
'}												\n';

function main() {
	// Recuperar el canvas (lienzo)
    var canvas = document.getElementById("canvas");

    if (!canvas) {
        console.log("Error loading canvas");
        return;
    }

    // obtener el contexto del render (herramientas de dibujo)
    var gl = getWebGLContext(canvas);

    // fijar color de borrado del lienzo
    gl.clearColor(0.0, 0.0, 0.3, 1.0);

    //Cargar, compilar y montar los shaders en un 'program'
    if(!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE )){
    	console.log("Fallo en la carga de los shaders");
    	return;
    }

    gl.clear(gl.COLOR_BUFFER_BIT);

    //enlace del script con el shader
    var coordenadas = gl.getAttribLocation(gl.program, 'posicion');

    //escuchar eventos de raton
    canvas.onmousedown = function(evento) {click(evento, gl, canvas, coordenadas);};
}

var puntos = [];
function click(evento, gl, canvas, coordenadas){

	// coordenadas del click
	var x = evento.clientX;
	var y = evento.clientY;
	var rect = evento.target.getBoundingClientRect();

	//conversion de coordenadas al sistema de webGL por defecto
	//cuadrado de 2x2 centrado <-- ejercicio

	x = ((x-rect.left)-canvas.width/2) * 2/canvas.width;
	y = (canvas.height/2-(y-rect.top)) * 2/canvas.height;

	//guardar coordenadas
	puntos.push(x); puntos.push(y);

	// borrar el canvas
	gl.clear(gl.COLOR_BUFFER_BIT);

	//insertar las coordenadas como atributo y dibujarlos uno a uno
	for(var i = 0; i < puntos.length; i +=2){
		gl.vertexAttrib3f(coordenadas, puntos[i], puntos[i+1], 0.0);
		gl.drawArrays(gl.POINTS, 0, 1);
	}
}





