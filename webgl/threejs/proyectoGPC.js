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

 // Mundo fisico
var world, reloj;

var bola;

 //Var eje palanca
 var ejePalancaDer,pointToRotateAround;
 var rotacionPalanca = Math.PI * 0.23;

 //Objetos y variables de tiempo
 var antes = Date.now();
 var keyboard;
 var updateFcts	= [];


 // Acciones
 initPhysicWorld();
 initVisualWorld();
 loadScene();
 setupGui();
 render();


 function esfera( radio, posicion, material ){
	var masa = 1;
	this.body = new CANNON.Body( {mass: masa, material: material} );
	this.body.addShape( new CANNON.Sphere( radio ) );
	this.body.position.copy( posicion );
	this.visual = new THREE.Mesh( new THREE.SphereGeometry( radio ), 
        new THREE.MeshBasicMaterial({color:'red', wireframe:true}));
	this.visual.position.copy( this.body.position );
}


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
    origen = new THREE.Vector3(0,200,0)

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

/**
 * Inicializa el mundo fisico con un
 * suelo y cuatro paredes de altura infinita
 */
function initPhysicWorld() {
  	// Mundo 
  	world = new CANNON.World(); 
   	world.gravity.set(0,-500,0); 
   	//world.broadphase = new CANNON.NaiveBroadphase(); 
    world.solver.iterations = 10; 

    // Material y comportamiento
    var groundMaterial = new CANNON.Material("groundMaterial");
    var materialEsfera = new CANNON.Material("sphereMaterial");
    var materialEstrella = new CANNON.Material("starMaterial")
    world.addMaterial( materialEsfera );
    world.addMaterial( groundMaterial );
    world.addMaterial(materialEstrella);

    var sphereGroundContactMaterial = new CANNON.ContactMaterial(groundMaterial,materialEsfera,
      { friction: 0.7, 
          restitution: 0.3 });
    var sphereStarContactMaterial = new CANNON.ContactMaterial(materialEsfera,materialEstrella,
      { friction: 0.1, 
        restitution: 20.0});
    world.addContactMaterial(sphereGroundContactMaterial);
    world.addContactMaterial(sphereStarContactMaterial);

    //Suelo
    var groundShape = new CANNON.Plane();
    var ground = new CANNON.Body({ mass: 0, material: groundMaterial });
    ground.addShape(groundShape);
    ground.position.set(0,-350,0);
    ground.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), -Math.PI/2);

    //Estrella
    var estrellaShape = new CANNON.Cylinder(40, 40, 20, 32)
    var plane = new CANNON.Body({ mass: 0, material: materialEstrella });
    plane.addShape(estrellaShape)
    plane.position.z += 10

    world.addBody(plane);

    //Palanca derecha
    var palancaShpe = new CANNON.

}

 function initVisualWorld(){
    // Crear el motor, la escena y la camara
    
    // Motor de render
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth,window.innerHeight);
    renderer.setClearColor(new THREE.Color(0xFFFFFF));
    renderer.autoClear = false;
    document.getElementById("container").appendChild(renderer.domElement);

    // Reloj
	  reloj = new THREE.Clock();
	  reloj.start();

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
    var geopared = new THREE.PlaneGeometry(100, 350, 20, 20);
    //var geoesfera = new THREE.SphereGeometry(8,8,10);
    var geopalancaround = createBoxWithRoundedEdges( 60, 8, 20, 3, 1 )
    var geocilindro = new THREE.CylinderBufferGeometry( 40, 40, 20, 32 );
    var geocilindroBolardo = new THREE.CylinderBufferGeometry( 10, 10, 20, 20 );
    var georebotelargo = createBoxWithRoundedEdges( 100, 8, 20, 3, 1 )
    var georebotecorto = createBoxWithRoundedEdges(70, 8, 20,3, 1)
    var geocilindrofondo = new THREE.CylinderBufferGeometry( 20, 20, 20, 32 );
    var georebotepalanca = createBoxWithRoundedEdges( 85, 8, 20, 3, 1 )
    var geoparedcubrepalanca = createBoxWithRoundedEdges( 100, 8, 20, 3, 1 )

    scene.add(new THREE.AxisHelper(300))
   //Objetos
    var plano = new THREE.Mesh(geoplano, material);
    plano.rotation.x = -Math.PI * 0.25;
    plano.add(new THREE.AxisHelper(300))

    bola = new esfera(12,new CANNON.Vec3(1,150,0),"sphereMaterial")
    plano.add(bola.visual)
    world.addBody(bola.body)

    //Palancas
    var palancaIzq = new THREE.Mesh(geopalancaround,material)
    palancaIzq.position.x += 19;
    palancaIzq.position.y -= 18;
    palancaIzq.position.z += 10;
    palancaIzq.rotation.z -= rotacionPalanca;

    var palancaDer = new THREE.Mesh(geopalancaround,material)
    palancaDer.position.x -= 19;
    palancaDer.position.y -= 18;
    palancaDer.position.z += 10;
    palancaDer.rotation.z += rotacionPalanca;
    
    //Ejes sobre los que pivotan las palancas
    ejePalancaDer = new THREE.Object3D();
    ejePalancaDer.position.set(65,-182,0)
    ejePalancaDer.add(palancaDer)

    ejePalancaIzq = new THREE.Object3D();
    ejePalancaIzq.position.set(-65,-182,0)
    ejePalancaIzq.add(palancaIzq)

    var estrellaCentral = new THREE.Mesh(geocilindro,material)
    estrellaCentral.rotation.x += Math.PI * 0.5;
    estrellaCentral.position.z += 10

    //Cubre-palanca que está en horizontal
    cubrePalancaIzq = new THREE.Mesh(geopalancaround,material)
    cubrePalancaIzq.position.x = -90
    cubrePalancaIzq.position.y = -162
    cubrePalancaIzq.position.z += 10
    cubrePalancaIzq.rotation.z -= rotacionPalanca
    plano.add(cubrePalancaIzq)

    cubrePalancaDer = new THREE.Mesh(geopalancaround,material)
    cubrePalancaDer.position.x = 90
    cubrePalancaDer.position.y = -162
    cubrePalancaDer.position.z += 10
    cubrePalancaDer.rotation.z += rotacionPalanca
    plano.add(cubrePalancaDer)

    //Pared cubre-palanca
    var paredCubrePalancaIzq = new THREE.Mesh(geoparedcubrepalanca,material)
    paredCubrePalancaIzq.position.x = cubrePalancaIzq.position.x -23
    paredCubrePalancaIzq.position.y = cubrePalancaIzq.position.y +65
    paredCubrePalancaIzq.position.z += 10
    paredCubrePalancaIzq.rotation.z = Math.PI/2
    plano.add(paredCubrePalancaIzq)

    var paredCubrePalancaDer = new THREE.Mesh(geoparedcubrepalanca,material)
    paredCubrePalancaDer.position.x = cubrePalancaDer.position.x +23
    paredCubrePalancaDer.position.y = cubrePalancaDer.position.y +65
    paredCubrePalancaDer.position.z += 10
    paredCubrePalancaDer.rotation.z = Math.PI/2
    plano.add(paredCubrePalancaDer)

    //Rebotes de cerca de la palanca 
    var rebotePalancaIzq = new THREE.Mesh(georebotepalanca,material)
    rebotePalancaIzq.position.x -= 70;
    rebotePalancaIzq.position.y -= 100;
    rebotePalancaIzq.position.z += 10;
    rebotePalancaIzq.rotation.z -= Math.PI/2.75
    plano.add(rebotePalancaIzq)

    //Rebotes de cerca de la palanca 
    var rebotePalancaDer = new THREE.Mesh(georebotepalanca,material)
    rebotePalancaDer.position.x += 70;
    rebotePalancaDer.position.y -= 100;
    rebotePalancaDer.position.z += 10;
    rebotePalancaDer.rotation.z += Math.PI/2.75;
    plano.add(rebotePalancaDer);

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
    var distancia = 25
    var bolardoDerecha = new THREE.Mesh(geocilindroBolardo,material)
    bolardoDerecha.position.x = distancia
    bolardoDerecha.position.y = reboteCortoDer1.position.y
    bolardoDerecha.position.z += 10
    bolardoDerecha.rotation.x = Math.PI/2

    var bolardoIzquierda = new THREE.Mesh(geocilindroBolardo,material)
    bolardoIzquierda.position.x =  - distancia
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

    //Bolardos laterales
    var bolardoLateralDerecha = new THREE.Mesh(geocilindroBolardo,material)
    bolardoLateralDerecha.position.x = reboteCortoDer1.position.x + 55
    bolardoLateralDerecha.position.y = reboteCortoDer1.position.y
    bolardoLateralDerecha.position.z += 10
    bolardoLateralDerecha.rotation.x = Math.PI/2


    var bolardoLateralIzquierda = new THREE.Mesh(geocilindroBolardo,material)
    bolardoLateralIzquierda.position.x = reboteCortoIzq1.position.x - 55
    bolardoLateralIzquierda.position.y = reboteCortoIzq1.position.y
    bolardoLateralIzquierda.position.z += 10
    bolardoLateralIzquierda.rotation.x = Math.PI/2

    //Estrella fondo
    var estrellaFondo = new THREE.Mesh(geocilindrofondo,material)
    estrellaFondo.position.y = bolardoArriba.position.y + 100
    estrellaFondo.rotation.x += Math.PI * 0.5;
    estrellaFondo.position.z += 10



    //Pista
    const width2 = 100, height2 = 360, width_segments =15, height_segments = 200;
    this.plane = new THREE.PlaneGeometry(width2, height2, width_segments, height_segments);
    var curve =  new THREE.EllipseCurve(
      0, 0,             // ax, aY
      10000, 200,            // xRadius, yRadius
      0, Math.PI, // aStartAngle, aEndAngle
      false             // aClockwise
  );
    
    
    curveGeometry = new THREE.Geometry();
    curveGeometry.vertices = curve.getSpacedPoints( plane.vertices.length/2 );
    curvaPlot = new THREE.Mesh(curveGeometry,material)
    for(let i=0; i<this.plane.vertices.length/2; i++) {
      this.plane.vertices[2*i].z = curveGeometry.vertices[i].y;
      this.plane.vertices[2*i+1].z = curveGeometry.vertices[i].y;
    }

   topePista = new THREE.Mesh(this.plane,  material);
   topePista.rotation.x -= Math.PI/2;
   topePista.rotation.z -=Math.PI/2
   topePista.position.y += 220
   //plano.add(topePista);

   var paredIzq = new THREE.Mesh(geopared,material)
   paredIzq.position.x = -180
   paredIzq.position.y = 75
   paredIzq.rotation.y = Math.PI/2
   //plano.add(paredIzq)

   var paredDer = new THREE.Mesh(geopared,material)
   paredDer.position.x = 180
   paredDer.position.y = 75
   paredDer.rotation.y = Math.PI/2
   //plano.add(paredDer)

   var limites = new THREE.Object3D()
   limites.position.y = -80
   limites.add(topePista)
   limites.add(paredIzq)
   limites.add(paredDer)
   plano.add(limites)
   //topePista.add(new THREE.AxisHelper(300))


   
   //ejePalancaDer.add(new THREE.AxisHelper(300))
   //ejePalancaIzq.add(new THREE.AxisHelper(300))


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
   plano.add(bolardoLateralDerecha)
   plano.add(bolardoLateralIzquierda)
   plano.add(estrellaFondo)

   //plano.add(topePista)
   //plano.add(THREE.AxisHelper(300))
   //palancaRounded.add(THREE.AxisHelper(300))
   //scene.add( THREE.AxisHelper(300)); 



   //Movimiento para las palancas
   var velocidad = 80
   var giroPalancaIzqUp = new TWEEN.Tween( ejePalancaIzq.rotation ).to( {x:0, y:0, z:1.5}, velocidad )
   var giroPalancaDerUp = new TWEEN.Tween( ejePalancaDer.rotation ).to( {x:0, y:0, z:-1.5}, velocidad )
   var giroPalancaIzqDown = new TWEEN.Tween( ejePalancaIzq.rotation ).to( {x:0, y:0, z:0}, velocidad )
   var giroPalancaDerDown = new TWEEN.Tween( ejePalancaDer.rotation ).to( {x:0, y:0, z:0}, velocidad )

   //Eventos de teclado
   keyboard = new THREEx.KeyboardState(renderer.domElement);  
   renderer.domElement.setAttribute("tabIndex", "0");
   renderer.domElement.focus();  

   keyboard.domElement.addEventListener('keydown', function(event){
		if (event.repeat) {
			return;
		}
		if ( keyboard.eventMatches(event, 'left') ){
			giroPalancaIzqUp.start()   
		}
		if ( keyboard.eventMatches(event, 'right') ){
			giroPalancaDerUp.start()   
		}
  })
  
  keyboard.domElement.addEventListener('keyup', function(event){
		if (event.repeat) {
			return;
		}
		if ( keyboard.eventMatches(event, 'left') ){
			giroPalancaIzqDown.start()   
		}
		if ( keyboard.eventMatches(event, 'right') ){
			giroPalancaDerDown.start()   
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
    var segundos = reloj.getDelta();	// tiempo en segundos que ha pasado
	  world.step( segundos );				// recalcula el mundo tras ese tiempo
    //Actualizar interpoladores
    bola.visual.position.copy( bola.body.position )
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
