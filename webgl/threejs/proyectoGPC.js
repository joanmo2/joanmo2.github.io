/** 
 * Seminario GPC #3. FormaBasica
 * Dibujar formas basicas con animacion 
 */

 // Variables imprescindibles
 var renderer, scene, camera;

 // Variables locales
 var car = new THREE.Object3D();;
 //variables camara
 var r = t = 50
 var l = b = -r;
 var cameraControler;
 var planta;

 //Var eje palanca
 var ejePalancaDer,pointToRotateAround;

 //Objetos y variables de tiempo
 var antes = Date.now();
 var keyboard;
 var updateFcts	= [];


 // Acciones
 init();
 loadScene();
 setupGui();
 render();

 //Fuente: https://discourse.threejs.org/t/round-edged-box/1402/6
 function createBoxWithRoundedEdges( width, height, depth, radius0, smoothness ) {
    let shape = new THREE.Shape();
    let eps = 0.00001;
    let radius = radius0 - eps;
    shape.absarc( eps, eps, eps, -Math.PI / 2, -Math.PI, true );
    shape.absarc( eps, height -  radius * 2, eps, Math.PI, Math.PI / 2, true );
    shape.absarc( width - radius * 2, height -  radius * 2, eps, Math.PI / 2, 0, true );
    shape.absarc( width - radius * 2, eps, eps, 0, -Math.PI / 2, true );
    let geometry = new THREE.ExtrudeBufferGeometry( shape, {
      amount: depth - radius0 * 2,
      bevelEnabled: true,
      bevelSegments: smoothness * 2,
      steps: 1,
      bevelSize: radius,
      bevelThickness: radius0,
      curveSegments: smoothness
    });
    
    geometry.center();
    
    return geometry;
  }

function setCameras(ar){
    origen = new THREE.Vector3(0,0,0)

    if(ar>1){
        //planta = new THREE.OrthographicCamera(l*ar, r*ar, t, b, -20, 300);
    }else{
        //planta = new THREE.OrthographicCamera(l, r, t/ar, b/ar, -20, 300);
    }
    //planta.position.set(0,200,0);
    //planta.lookAt(origen);
    //planta.up = new THREE.Vector3(0,0,-1);

    camera = new THREE.PerspectiveCamera( 50, ar, 0.1, 10000);
    camera.position.set(0,500,700);
    camera.lookAt(origen);

    scene.add(camera);
    //scene.add(planta)

}

 function init(){
    // Crear el motor, la escena y la camara
    
    // Motor de render
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth,window.innerHeight);
    renderer.setClearColor(new THREE.Color(0xFFFFFF));
    renderer.autoClear = false;
    document.getElementById("container").appendChild(renderer.domElement);

    // Escena
    scene = new THREE.Scene();

    // Camara
    var ar = window.innerWidth / innerHeight;
    setCameras(ar)



    //Controlador de camara
    cameraControler = new THREE.OrbitControls(camera, renderer.domElement)
    cameraControler.target.set(0,0,0)
    cameraControler.noKeys = true;

 }



 function loadScene(){
    //Materiales
    var material = new THREE.MeshBasicMaterial({color:'red', wireframe:true});

   // Geometrias 
   var geoplano = new THREE.PlaneGeometry(500, 700, 20, 20);
   var geoesfera = new THREE.SphereGeometry(8,8,10);
   var geopalancaround = createBoxWithRoundedEdges( 75, 8, 20, 3, 1 )
   var geocilindro = new THREE.CylinderBufferGeometry( 40, 40, 20, 32 );
   var geocilindroBolardo = new THREE.CylinderBufferGeometry( 10, 10, 20, 20 );
   var georebotelargo = createBoxWithRoundedEdges( 100, 8, 20, 3, 1 )
   var georebotecorto = createBoxWithRoundedEdges(70, 8, 20,3, 1)
   var geotopepista = new THREE.SphereGeometry( 250, 12, 7, 0, Math.PI);


   //Objetos
   var plano = new THREE.Mesh(geoplano, material);
   plano.rotation.x = -Math.PI * 0.25;

   var bola = new THREE.Mesh(geoesfera,material)

   
   var palancaIzq = new THREE.Mesh(geopalancaround,material)
   palancaIzq.position.x += 19;
   palancaIzq.position.y -= 18;
   palancaIzq.position.z += 10;
   palancaIzq.rotation.z -= Math.PI * 0.25;

   var palancaDer = new THREE.Mesh(geopalancaround,material)
   palancaDer.position.x -= 19;
   palancaDer.position.y -= 18;
   palancaDer.position.z += 10;
   palancaDer.rotation.z += Math.PI * 0.25;
   
   //Ejes sobre los que pivotan las palancas
   ejePalancaDer = new THREE.Object3D();
   ejePalancaDer.position.set(74,-182,0)
   ejePalancaDer.add(palancaDer)

   ejePalancaIzq = new THREE.Object3D();
   ejePalancaIzq.position.set(-74,-182,0)
   ejePalancaIzq.add(palancaIzq)

   var estrellaCentral = new THREE.Mesh(geocilindro,material)
   estrellaCentral.rotation.x += Math.PI * 0.5;
   estrellaCentral.position.z += 10

   //Rebotes de la parte superior
   var reboteLargoIzq = new THREE.Mesh(georebotelargo,material);
   reboteLargoIzq.position.x += 90;
   reboteLargoIzq.position.y += 100;
   reboteLargoIzq.position.z += 10;
   reboteLargoIzq.rotation.z -= Math.PI * 0.25;

   var reboteLargoDer = new THREE.Mesh(georebotelargo,material);
   reboteLargoDer.position.x -= 90;
   reboteLargoDer.position.y += 100;
   reboteLargoDer.position.z += 10;
   reboteLargoDer.rotation.z += Math.PI * 0.25;

   var reboteCortoIzq1 = new THREE.Mesh(georebotecorto,material)
   reboteCortoIzq1.position.x -= 80;
   reboteCortoIzq1.position.y += 150;
   reboteCortoIzq1.position.z += 10;
   reboteCortoIzq1.rotation.z += Math.PI * 0.25;

   var reboteCortoIzq2 = new THREE.Mesh(georebotecorto,material)
   reboteCortoIzq2.position.x -= 80;
   reboteCortoIzq2.position.y += 190;
   reboteCortoIzq2.position.z += 10;
   reboteCortoIzq2.rotation.z += Math.PI * 0.25;

   var reboteCortoDer1 = new THREE.Mesh(georebotecorto,material)
   reboteCortoDer1.position.x += 80;
   reboteCortoDer1.position.y += 150;
   reboteCortoDer1.position.z += 10;
   reboteCortoDer1.rotation.z -= Math.PI * 0.25;

   var reboteCortoDer2 = new THREE.Mesh(georebotecorto,material)
   reboteCortoDer2.position.x += 80;
   reboteCortoDer2.position.y += 190;
   reboteCortoDer2.position.z += 10;
   reboteCortoDer2.rotation.z -= Math.PI * 0.25;

   //Bolardos
   var distancia = 30

   var bolardoDerecha = new THREE.Mesh(geocilindroBolardo,material)
   bolardoDerecha.position.x = 15
   bolardoDerecha.position.y = reboteCortoDer1.position.y
   bolardoDerecha.position.z += 10
   bolardoDerecha.rotation.x = Math.PI/2

   var bolardoIzquierda = new THREE.Mesh(geocilindroBolardo,material)
   bolardoIzquierda.position.x = bolardoDerecha.position.x - distancia
   bolardoIzquierda.position.y = reboteCortoIzq1.position.y
   bolardoIzquierda.position.z += 10
   bolardoIzquierda.rotation.x = Math.PI/2

   var bolardoArriba = new THREE.Mesh(geocilindroBolardo,material)
   bolardoArriba.position.y = bolardoDerecha.position.y - distancia
   bolardoArriba.position.z += 10
   bolardoArriba.rotation.x = Math.PI/2
   var bolardoAbajo = new THREE.Mesh(geocilindroBolardo,material)
   bolardoAbajo.position.y = bolardoDerecha.position.y + distancia
   bolardoAbajo.position.z += 10
   bolardoAbajo.rotation.x = Math.PI/2

   //Pista
   const width2 = 100, height2 = 300, width_segments =1, height_segments = 100;
   this.plane = new THREE.PlaneGeometry(width2, height2, width_segments, height_segments);
   var curve = new THREE.QuadraticBezierCurve3(
	new THREE.Vector2( -100, 0 ),
	new THREE.Vector2( 200, 200 ),
	new THREE.Vector2( 100, 0 ));
    curveGeometry = new THREE.Geometry();
    curveGeometry.vertices = curve.getPoints( plane.vertices.length/2 );
    curvaPlot = new THREE.Mesh(curveGeometry,material)
    curvaPlot.add(new THREE.AxisHelper(300))
  
   for(let i=0; i<this.plane.vertices.length/2; i++) {
     this.plane.vertices[2*i].z = curveGeometry.vertices[i].y;
     this.plane.vertices[2*i+1].z = curveGeometry.vertices[i].y;
   }

   topePista = new THREE.Mesh(this.plane,  material);
   //this.mesh2.rotation.y += Math.PI/2;
   topePista.rotation.x -= Math.PI/2;
   topePista.rotation.z -=Math.PI/2
   topePista.position.y += 180
   plano.add(topePista);
   topePista.add(new THREE.AxisHelper(300))


   
   //ejePalancaDer.add(new THREE.AxisHelper(300))
   ejePalancaIzq.add(new THREE.AxisHelper(300))


   //Añadimos objetos a la escena
   scene.add(plano)
   plano.add(ejePalancaDer)
   plano.add(ejePalancaIzq)
   plano.add(estrellaCentral)
   plano.add(reboteLargoIzq)
   plano.add(reboteLargoDer)
   plano.add(reboteCortoIzq1)
   plano.add(reboteCortoIzq2)
   plano.add(reboteCortoDer1)
   plano.add(reboteCortoDer2)
   plano.add(bolardoDerecha)
   plano.add(bolardoIzquierda)
   plano.add(bolardoAbajo)
   plano.add(bolardoArriba)
   //plano.add(topePista)
   //plano.add(THREE.AxisHelper(300))
   //palancaRounded.add(THREE.AxisHelper(300))
   //scene.add( THREE.AxisHelper(300)); 



   


   //Eventos de teclado
   keyboard = new THREEx.KeyboardState(renderer.domElement);  
   renderer.domElement.setAttribute("tabIndex", "0");
   renderer.domElement.focus();  
   keyboard.domElement.addEventListener('keydown', function(event){
       if( keyboard.pressed('up')){
       }	
       if( keyboard.pressed('down')){
       }	
       if( keyboard.pressed('left')){
        ejePalancaIzq.rotation.z += 0.1;
       }	
       if( keyboard.pressed('right')){
        ejePalancaDer.rotation.z -= 0.1;
       }	
   })


 }


 function setupGui()
{
	// Definicion de los controles
	effectController = {
        giroBase: 0,
        giroBrazo: 0,
        giroAntebrazoY: 0,
        giroAntebrazoZ: 0,
        rotacionPinzas: 0,
        aperturaPinzas: 15,
		sombras: true,
	};

	// Creacion interfaz
	var gui = new dat.GUI();

	// Construccion del menu
	var h = gui.addFolder("Control Robot");
    h.add(effectController, "giroBase", -180, 180, 1).name("Giro base");
    h.add(effectController, "giroBrazo", -45, 45, 1).name("Giro brazo");
    h.add(effectController, "giroAntebrazoY", -180, 180, 1).name("Giro antebrazo Y");
    h.add(effectController, "giroAntebrazoZ", -90, 90, 1).name("Giro antebrazo Z ");
    h.add(effectController, "rotacionPinzas", -40, 220, 1).name("Giro Pinza");
    h.add(effectController, "aperturaPinzas", 0, 15, 1).name("Separación Pinzas");

}

 function updateAspectRatio(){
    renderer.setSize(window.innerWidth,window.innerHeight)
    var ar = window.innerWidth/window.innerHeight;
    camera.aspect = ar;
    camera.updateProjectionMatrix();
    //planta.updateProjectionMatrix();

 }

 function update(){
    var ahora = Date.now();							// Hora actual
    
    //Actualizar interpoladores
    TWEEN.update()
	antes = ahora;
 }
 
 function render(){
    //Dibujar cada frame
    requestAnimationFrame(render);
    update();

    renderer.clear()

    renderer.setViewport(0,0,innerWidth, innerHeight)
    renderer.render(scene, camera);
 }
