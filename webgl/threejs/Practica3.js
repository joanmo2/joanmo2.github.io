/**
 * Seminario GPC #2. FormaBasica
 * Dibujar formas basicas con animacion 
 */

 // Variables imprescindibles
 var renderer, scene, camera;

 // Variables locales
 var plano,base, pieDeBrazo,brazoRobot, nexo,esfera ,angulo = 0;

 var baseAntebrazo, pilarAntebrazo1,pilarAntebrazo2,pilarAntebrazo3,pilarAntebrazo4, cabezaAntebrazo, antebrazoRobot;
 
 var pinzaDer, pinzaIzq, geometryPinza, pinzasRobot

 //variables camara
 var r = t = 30
 var l = b = -r;
 var cameraControler;
 var planta;

 // Acciones
 init();
 loadScene();
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

    camera = new THREE.PerspectiveCamera( 50, ar, 0.1, 10000);
    camera.position.set(300,300,300);
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

    window.addEventListener('resize',updateAspectRatio)
 }

 function loadScene(){
   // Cargar la escena con objetos

   // Materiales
   var material = new THREE.MeshBasicMaterial({color:'red', wireframe:true});

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
      new THREE.Face3(0, 7, 4),
      new THREE.Face3(0, 3, 7),
      //back
      new THREE.Face3(4, 6, 5),
      new THREE.Face3(4, 7, 6),

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
       new THREE.Face3(3, 8, 7),
       new THREE.Face3(3,9,8),
      //back
      new THREE.Face3(7, 10, 6),
      new THREE.Face3(7, 11, 10),
      
   )

   // Objetos
   

   //Plano
   plano = new THREE.Mesh(geoplano, material);
   plano.rotation.x = -Math.PI * 0.5;

   //Base
   base = new THREE.Mesh(geocilindro,material);
   base.rotation.x = Math.PI * 0.5;

   //Brazo
   pieDeBrazo = new THREE.Mesh(geocilindroGirado,material);
   pieDeBrazo.rotation.x = -Math.PI * 0.5;

   nexo = new THREE.Mesh(geoCuboide, material);
   nexo.rotation.y = Math.PI * 0.5;
   nexo.position.y += 60;

   esfera = new THREE.Mesh(geoesfera,material);
   esfera.position.y += 120;

   brazoRobot = new THREE.Object3D();

   //Antebrazo
   baseAntebrazo = new THREE.Mesh(geoBaseAntebrazo,material)
   pilarAntebrazo1 = new THREE.Mesh(geoPilarAntebrazo,material)
   pilarAntebrazo1.position.y += 40;
   pilarAntebrazo1.position.z = 8;
   pilarAntebrazo1.position.x = -8;

   pilarAntebrazo2 = new THREE.Mesh(geoPilarAntebrazo,material)
   pilarAntebrazo2.position.y += 40;
   pilarAntebrazo2.position.z = 8;
   pilarAntebrazo2.position.x = 8;

   pilarAntebrazo3 = new THREE.Mesh(geoPilarAntebrazo,material)
   pilarAntebrazo3.position.y += 40;
   pilarAntebrazo3.position.z = -8;
   pilarAntebrazo3.position.x = 8;

   pilarAntebrazo4 = new THREE.Mesh(geoPilarAntebrazo,material)
   pilarAntebrazo4.position.y += 40;
   pilarAntebrazo4.position.z = -8;
   pilarAntebrazo4.position.x = -8;

   cabezaAntebrazo = new THREE.Mesh(geoCabezaAntebrazo,material)
   cabezaAntebrazo.rotation.x -= Math.PI * 0.5;
   cabezaAntebrazo.position.y = 80

   antebrazoRobot = new THREE.Object3D()
   antebrazoRobot.position.y = 120

   //pinza
   pinzaIzq = new THREE.Mesh(geometryPinza, material);
   pinzaIzq.position.z = +10
   pinzaDer = new THREE.Mesh(geometryPinza, material);
   pinzaDer.rotation.x += Math.PI ;
   pinzaDer.position.y += 20
   pinzaDer.position.z = -10

   pinzasRobot = new THREE.Object3D()
   pinzasRobot.position.y += 70
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
   antebrazoRobot.add(pinzasRobot)




   // pieDeBrazo.add( new THREE.AxisHelper(60));
   // nexo.add(new THREE.AxisHelper(30))
   //scene.add( new THREE.AxisHelper(100));
   //nexo.add(new THREE.AxisHelper(100))
   //nexo.add(esfera);
   //antebrazoRobot.add(new THREE.AxisHelper(100))

 }

 function updateAspectRatio(){
    renderer.setSize(window.innerWidth,window.innerHeight)

    var ar = window.innerWidth/window.innerHeight;
    // if(ar>1){
    //     planta.left = l * ar;
    //     planta.right = r * ar;
    //     planta.bottom = b;
    //     planta.top = t;
    // }else{
    //     planta.left = l;
    //     planta.right = r;
    //     planta.bottom = b/ar;
    //     planta.top = t/ar;
    // }

    camera.aspect = ar;
    camera.updateProjectionMatrix();
    //planta.updateProjectionMatrix();

 }

 function update(){

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
 }
