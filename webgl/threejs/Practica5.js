/**
 * Seminario GPC #3. FormaBasica
 * Dibujar formas basicas con animacion 
 */

 // Variables imprescindibles
 var renderer, scene, camera;

 // Variables locales
 var plano,base, pieDeBrazo,brazoRobot, nexo,esfera ,angulo = 0;

 var baseAntebrazo, pilarAntebrazo1,pilarAntebrazo2,pilarAntebrazo3,pilarAntebrazo4, cabezaAntebrazo, antebrazoRobot;
 
 var pinzaDer, pinzaIzq, geometryPinza, pinzasRobot

 //variables camara
 var r = t = 50
 var l = b = -r;
 var cameraControler;
 var planta;

 //Objetos y variables de tiempo
 var antes = Date.now();
 var keyboard;
 var updateFcts	= [];


 // Acciones
 init();
 loadScene();
 setupGui();
 render();

function setCameras(ar){
    origen = new THREE.Vector3(0,0,0)
    if(ar>1){
        planta = new THREE.OrthographicCamera(l*ar, r*ar, t, b, -20, 300);
    }else{
        planta = new THREE.OrthographicCamera(l, r, t/ar, b/ar, -20, 300);
    }
    planta.position.set(0,200,0);
    planta.lookAt(origen);
    planta.up = new THREE.Vector3(0,0,-1);

    camera = new THREE.PerspectiveCamera( 55, ar, 0.1, 10000);
    camera.position.set(400,400,400);
    camera.lookAt(origen);

    scene.add(camera);
    scene.add(planta)

}

 function init(){
    // Crear el motor, la escena y la camara
    
    // Motor de render
    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth,window.innerHeight);
    renderer.setClearColor(new THREE.Color(0xFFFFFF));
    renderer.shadowMap.enabled = true;
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

    // Luces
	var luzAmbiente = new THREE.AmbientLight(0xFFFFFF, 0.2);
	scene.add( luzAmbiente );

	var luzPuntual = new THREE.PointLight(0xFFFFFF,0.5);
	luzPuntual.position.set( -0, 20, -0 );
	scene.add( luzPuntual );

	var luzDireccional = new THREE.DirectionalLight(0xFFFFFF,0.5);
	luzDireccional.position.set(-100,50,100 );
	scene.add(luzDireccional);

	var luzFocal = new THREE.SpotLight(0xFFFFFF,0.5);
	luzFocal.position.set( 500,450,20 );
	luzFocal.target.position.set(0,0,0);
	luzFocal.angle = Math.PI/5;
	luzFocal.penumbra = 0.2;
    luzFocal.castShadow = true;
    luzFocal.shadow.camera.near = 0.1;
    luzFocal.shadow.camera.far = 5000;
    luzFocal.shadow.camera.fov = 5000;
	scene.add(luzFocal);

 }


 function loadScene(){
    // Cargar la escena con objetos

    // Texturas
	var path = "images/";
    var texturaSuelo = new THREE.TextureLoader().load(path+'pisometalico_1024.jpg');
    
	texturaSuelo.magFilter = THREE.LinearFilter;
	texturaSuelo.minFilter = THREE.LinearFilter;
	texturaSuelo.repeat.set(1,1);
    texturaSuelo.wrapS = texturaSuelo.wrapT = THREE.MirroredRepeatWrapping;

    var texturaPieRobot = new THREE.TextureLoader().load(path+'metalRobot.jpg');
    var texturaOroRobot = new THREE.TextureLoader().load(path+'oroRobot.jpg');

    var paredes = [ path+'posx.jpg',path+'negx.jpg',
					path+'posy.jpg',path+'negy.jpg',
					path+'posz.jpg',path+'negz.jpg'
                  ];
   var mapaEntorno = new THREE.CubeTextureLoader().load(paredes);
   var materialBrillante = new THREE.MeshPhongMaterial({color:'white',
		                                                 specular:'white',
		                                                 shininess: 50,
		                                                 envMap:mapaEntorno });

   // Materiales
   var material = new THREE.MeshLambertMaterial({color:'red'});
   var matsuelo = new THREE.MeshLambertMaterial({color:'white', map: texturaSuelo});
   var matPieRobot = new THREE.MeshLambertMaterial({color:'white', map: texturaPieRobot});
   var matOroRobot = new THREE.MeshPhongMaterial({color:'white', 
   specular:'white',shininess: 50,map: texturaOroRobot});

   // Geometrias
   var geoplano = new THREE.PlaneGeometry(1000, 1000, 20, 20);
   var geocilindro = new THREE.CylinderGeometry( 50, 50, 15,40);
   var geocilindroGirado = new THREE.CylinderGeometry( 20, 20, 18, 15);
   var geoCuboide = new THREE.BoxGeometry( 18, 120, 12 );
   var geoesfera = new THREE.SphereGeometry(20,20,20);

   var geoBaseAntebrazo = new THREE.CylinderGeometry(22,22,6,22)
   var geoPilarAntebrazo = new THREE.BoxGeometry(4,80,4)
   var geoCabezaAntebrazo = new THREE.CylinderGeometry(15,15,40,30)
   
   geometryPinza = new THREE.Geometry();
   geometryPinza.vertices.push(
      new THREE.Vector3(0,0,0),     //0
      new THREE.Vector3(0,20,0),    //1
      new THREE.Vector3(19,20,0),   //2
      new THREE.Vector3(19,0,0),    //3
      new THREE.Vector3(0,0,-4),    //4
      new THREE.Vector3(0,20,-4),   //5
      new THREE.Vector3(19,20,-4),  //6
      new THREE.Vector3(19,0,-4),   //7
      new THREE.Vector3(38,17,-2),  //8
      new THREE.Vector3(38,2,-2),   //9
      new THREE.Vector3(38,17,-4),  //10
      new THREE.Vector3(38,2,-4),    //11
   )

   geometryPinza.faces.push(
      //front
      new THREE.Face3(0, 2, 1),
      new THREE.Face3(0, 3, 2),
      //izq
      new THREE.Face3(0, 5, 1),
      new THREE.Face3(0, 4, 5),
      //top
      new THREE.Face3(1, 6, 5),
      new THREE.Face3(1, 2, 6),
      //der
      new THREE.Face3(2, 7, 6),
      new THREE.Face3(2, 3, 7),
      //bottom
      new THREE.Face3(0, 4, 7),
      new THREE.Face3(0, 7, 3),
      //back
      new THREE.Face3(4, 5, 6),
      new THREE.Face3(4, 6, 7),

      //secondSquare
      //front
      new THREE.Face3(3, 8, 2),
      new THREE.Face3(3, 9, 8),
      //izq
      new THREE.Face3(3,6,2),
      new THREE.Face3(3,7,6),
      //top
      new THREE.Face3(2, 10, 6),
      new THREE.Face3(2, 8, 10),
      //der
      new THREE.Face3(8, 11, 10),
      new THREE.Face3(8, 9, 11),
      //bottom
      new THREE.Face3(3, 7, 11),
      new THREE.Face3(3, 11, 9),
      //back
      new THREE.Face3(7, 6, 10),
      new THREE.Face3(7, 10, 11),
      
   )

   // Objetos
   

   //Plano
   plano = new THREE.Mesh(geoplano, matsuelo);
   plano.rotation.x = -Math.PI * 0.5;
   plano.receiveShadow = true;

   //Base
   base = new THREE.Mesh(geocilindro,matPieRobot);
   base.rotation.x = Math.PI * 0.5;
   base.position.z +=10;
   base.receiveShadow = true;
   base.castShadow = true;

   //Brazo
   pieDeBrazo = new THREE.Mesh(geocilindroGirado,matPieRobot);
   pieDeBrazo.rotation.x = -Math.PI * 0.5;
   pieDeBrazo.receiveShadow = true;
   pieDeBrazo.castShadow = true;

   nexo = new THREE.Mesh(geoCuboide, matPieRobot);
   nexo.rotation.y = Math.PI * 0.5;
   nexo.position.y += 60;
   nexo.receiveShadow = true;
   nexo.castShadow = true;

   esfera = new THREE.Mesh(geoesfera,materialBrillante);
   esfera.position.y += 120;
   esfera.receiveShadow = true;
   esfera.castShadow = true;


   brazoRobot = new THREE.Object3D();

   //Antebrazo
   baseAntebrazo = new THREE.Mesh(geoBaseAntebrazo,matOroRobot)
   baseAntebrazo.receiveShadow = true;
   baseAntebrazo.castShadow = true;

   pilarAntebrazo1 = new THREE.Mesh(geoPilarAntebrazo,matOroRobot)
   pilarAntebrazo1.position.y += 40;
   pilarAntebrazo1.position.z = 8;
   pilarAntebrazo1.position.x = -8;
   pilarAntebrazo1.receiveShadow = true;
   pilarAntebrazo1.castShadow = true;


   pilarAntebrazo2 = new THREE.Mesh(geoPilarAntebrazo,matOroRobot)
   pilarAntebrazo2.position.y += 40;
   pilarAntebrazo2.position.z = 8;
   pilarAntebrazo2.position.x = 8;
   pilarAntebrazo2.receiveShadow = true;
   pilarAntebrazo2.castShadow = true;


   pilarAntebrazo3 = new THREE.Mesh(geoPilarAntebrazo,matOroRobot)
   pilarAntebrazo3.position.y += 40;
   pilarAntebrazo3.position.z = -8;
   pilarAntebrazo3.position.x = 8;
   pilarAntebrazo3.receiveShadow = true;
   pilarAntebrazo3.castShadow = true;


   pilarAntebrazo4 = new THREE.Mesh(geoPilarAntebrazo,matOroRobot)
   pilarAntebrazo4.position.y += 40;
   pilarAntebrazo4.position.z = -8;
   pilarAntebrazo4.position.x = -8;
   pilarAntebrazo4.receiveShadow = true;
   pilarAntebrazo4.castShadow = true;


   cabezaAntebrazo = new THREE.Mesh(geoCabezaAntebrazo,matOroRobot)
   cabezaAntebrazo.rotation.x += Math.PI * 0.5;
   cabezaAntebrazo.position.y = 80
   cabezaAntebrazo.receiveShadow = true;
   cabezaAntebrazo.castShadow = true;


   antebrazoRobot = new THREE.Object3D()
   antebrazoRobot.position.y = 120

   //pinza
   pinzaIzq = new THREE.Mesh(geometryPinza, material);
   pinzaIzq.position.z = +17
   pinzaIzq.receiveShadow = true;
   pinzaIzq.castShadow = true;

   pinzaDer = new THREE.Mesh(geometryPinza, material);
   pinzaDer.rotation.x += Math.PI ;
   pinzaDer.position.y += 20
   pinzaDer.position.z = -17
   pinzaDer.receiveShadow = true;
   pinzaDer.castShadow = true;


   pinzasRobot = new THREE.Object3D()
   pinzasRobot.position.z -= 10
   pinzasRobot.rotation.x = Math.PI/2;
   // Construir la escena
   //Orden de las cosas siempre: ESCALADO, ROTACION y TRASLACION


   scene.add(plano);
   //creamos la base
   plano.add(base);

   //creamos el Brazo del robot
   brazoRobot.add(pieDeBrazo)
   brazoRobot.add(nexo)
   brazoRobot.add(esfera)
   base.add(brazoRobot)

   //creamos antebrazo
   antebrazoRobot.add(baseAntebrazo)
   antebrazoRobot.add(pilarAntebrazo1)
   antebrazoRobot.add(pilarAntebrazo2)
   antebrazoRobot.add(pilarAntebrazo3)
   antebrazoRobot.add(pilarAntebrazo4)
   antebrazoRobot.add(cabezaAntebrazo)
   brazoRobot.add(antebrazoRobot)
   
   //creamos pinzas
   pinzasRobot.add(pinzaIzq)
   pinzasRobot.add(pinzaDer)
   cabezaAntebrazo.add(pinzasRobot)

   // Habitacion
	var shader = THREE.ShaderLib.cube;
	shader.uniforms.tCube.value = mapaEntorno;

	var matparedes = new THREE.ShaderMaterial({
		fragmentShader: shader.fragmentShader,
		vertexShader: shader.vertexShader,
		uniforms: shader.uniforms,
		dephtWrite: false,
		side: THREE.BackSide
	});

	var habitacion = new THREE.Mesh( new THREE.CubeGeometry(1000,1000,1000),matparedes);
	scene.add(habitacion);

   keyboard = new THREEx.KeyboardState(renderer.domElement);  
   renderer.domElement.setAttribute("tabIndex", "0");
   renderer.domElement.focus();  
   keyboard.domElement.addEventListener('keydown', function(event){
       if( keyboard.pressed('up')){
        base.position.x -= 2;
       }	
       if( keyboard.pressed('down')){
        base.position.x += 2;
       }	
       if( keyboard.pressed('left')){
        base.position.y -= 2;
       }	
       if( keyboard.pressed('right')){
        base.position.y += 2;
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
    h.add(effectController, "giroAntebrazoY", -180, 180, 1).name("Giro antebrazoY ");
    h.add(effectController, "giroAntebrazoZ", -90, 90, 1).name("Giro antebrazoZ ");
    h.add(effectController, "rotacionPinzas", -40, 220, 1).name("Giro Pinza");
    h.add(effectController, "aperturaPinzas", 0, 15, 1).name("Separaci??n Pinzas");

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
    base.rotation.y = effectController.giroBase * THREE.Math.DEG2RAD;
    brazoRobot.rotation.z = effectController.giroBrazo * THREE.Math.DEG2RAD;
    antebrazoRobot.rotation.y = effectController.giroAntebrazoY * THREE.Math.DEG2RAD;
    antebrazoRobot.rotation.z = effectController.giroAntebrazoZ * THREE.Math.DEG2RAD;
    cabezaAntebrazo.rotation.y = effectController.rotacionPinzas * THREE.Math.DEG2RAD;
    pinzaIzq.rotation.y = (17 - effectController.aperturaPinzas )*THREE.Math.DEG2RAD;
    pinzaDer.rotation.y = (17 - effectController.aperturaPinzas )* THREE.Math.DEG2RAD;
    
    // Incrementar el angulo en 360?? / sg
	antes = ahora;
 }
 
 function render(){
    //Dibujar cada frame
    requestAnimationFrame(render);
    update();

    renderer.clear()

    renderer.setViewport(0,0,innerWidth, innerHeight)
    renderer.render(scene, camera);

    if(innerHeight < innerWidth){
        renderer.setViewport(0,0,innerHeight/4, innerHeight/4)
    }else{
        renderer.setViewport(0,0,innerWidth/4, innerWidth/4)
    }
    renderer.render(scene,planta)
    renderer.domElement.focus();  
 }
