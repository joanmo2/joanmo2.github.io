/** 
 * Proyecto final GPC
 * Pinball interactivo usando CANNON 
 */

 // Variables imprescindibles
 var renderer, scene, camera;
 var movePalDer = false;
 var movePalIzq = false;

 // Variables locales
 var car = new THREE.Object3D();;

 //variables camara
 var r = t = 50
 var l = b = -r;
 var cameraControler;
 var planta;


 // Mundo fisico
var world, reloj,physics,ground;

//Bodies
var bola,rebotePalancaDerBody,helper;
//Materiales
var groundMaterial,materialEsfera,materialEstrella;
var total = Math.cos(Math.PI * 0.25) * 250;
var palancaDer, palancaIzq;


 //Var eje palanca
 var ejePalancaDer,pointToRotateAround;
 var rotacionPalanca = Math.PI * 0.23;
 var posXder,posYder,posZder;
 var posXizq,pozYizq,posZizq;

 //Objetos y variables de tiempo
 var antes = Date.now();
 var keyboard;

 var acumDer = rotacionPalanca;
 var acumIzq = -rotacionPalanca;


 // Acciones
 initVisualWorld();
 initPhysicWorld();
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
    origen = new THREE.Vector3(200,500,200)
    camera = new THREE.PerspectiveCamera( 50, ar, 0.1, 10000);
    camera.position.set(0,500,500);
    camera.lookAt(origen);

    scene.add(camera);
}

function bodiesAreInContact(bodyA, bodyB){
  for(var i=0; i<world.contacts.length; i++){
      var c = world.contacts[i];
      if((c.bi === bodyA && c.bj === bodyB) || (c.bi === bodyB && c.bj === bodyA)){
          return true;
      }
  }
  return false;
}

/**
 * Inicializa el mundo fisico con un
 * suelo y cuatro paredes de altura infinita
 */
function initPhysicWorld() {
    // Mundo 
    world = new CANNON.World();
    world.broadphase = new CANNON.NaiveBroadphase() 
    world.gravity.set(0,-250,0); 
    world.solver.iterations = 50; 
    helper = new CannonHelper(scene,world)

    // Material y comportamiento
    groundMaterial = new CANNON.Material("groundMaterial");
    materialEsfera = new CANNON.Material("sphereMaterial");
    materialEstrella = new CANNON.Material("starMaterial");
    materialPalanca = new CANNON.Material("palancaMaterial");
    wallMaterial = new CANNON.Material("wallMaterial")
    world.addMaterial( materialEsfera );
    world.addMaterial( groundMaterial );
    world.addMaterial(materialEstrella);
    world.addMaterial(materialPalanca);
    world.addMaterial(wallMaterial)

    var sphereGroundContactMaterial = new CANNON.ContactMaterial(groundMaterial,materialEsfera,
      { friction: 0.7, 
          restitution: 0.3 });
    var sphereStarContactMaterial = new CANNON.ContactMaterial(materialEsfera,materialEstrella,
      { friction: 0.1, 
        restitution: 20.0});
    var spherePalancaContactMaterial = new CANNON.ContactMaterial(materialEsfera,materialEstrella,
      { friction: 0.7, 
        restitution: 1.0});
    var sphereWallContactMaterial = new CANNON.ContactMaterial(materialEsfera,wallMaterial,
      { friction:10, 
        restitution: 10});
    world.addContactMaterial(sphereGroundContactMaterial);
    world.addContactMaterial(sphereStarContactMaterial);
    world.addContactMaterial(spherePalancaContactMaterial);
    world.addContactMaterial(sphereWallContactMaterial);

    //Suelo
    var groundShape = new CANNON.Box(new CANNON.Vec3(350,350,1));
    ground = new CANNON.Body({ mass: 0, material: groundMaterial });
    ground.addShape(groundShape);
    ground.position.set(0,0,0);
    ground.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), -Math.PI/4);
    world.add(ground)

    //cielo

    var cieloShape = new CANNON.Box(new CANNON.Vec3(350,350,1));
    cielo = new CANNON.Body({ mass: 0, material: groundMaterial });
    cielo.addShape(cieloShape);
    cielo.position.set(0,50,0);
    cielo.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), -Math.PI/4);
    world.addBody(cielo)
    //helper.addVisual(cielo)
    world.addBody(ground)

    //helper.addVisual(ground,0xFFFFFF)



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
    var geopared = new THREE.PlaneGeometry(200, 800, 20, 20);
    //var geoesfera = new THREE.SphereGeometry(8,8,10);
    var geopalancaround = createBoxWithRoundedEdges( 70, 8, 20, 3, 1 )
    var geocubrepalancaround = createBoxWithRoundedEdges( 85, 8, 20, 3, 1 )
    var geocilindro = new THREE.CylinderBufferGeometry( 30, 30, 20, 32 );
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
    plano.position.y = 0
    //plano.add(new THREE.AxisHelper(300))

    var aux = Math.sin(-Math.PI * 0.25) * 350;
    var aux2 = Math.cos(-Math.PI * 0.25) * 350;
    bola = new esfera(13,new CANNON.Vec3(+10,aux2-25,aux +50),"sphereMaterial")
    helper.addVisual(bola.body)
    world.addBody(bola.body)
    scene.add(bola.visual)

    //Palancas
    palancaIzq = new THREE.Mesh(geopalancaround,material)
    palancaIzq.position.x += 30;
    palancaIzq.position.y -= 30;
    palancaIzq.position.z += 10;
    palancaIzq.rotation.z -= rotacionPalanca;
    palancaDer = new THREE.Mesh(geopalancaround,material)
    palancaDer.position.x -= 30;
    palancaDer.position.y -= 30;
    palancaDer.position.z += 10;
    palancaDer.rotation.z += rotacionPalanca;
    
    //Ejes sobre los que pivotan las palancas
    ejePalancaDer = new THREE.Object3D();
    ejePalancaDer.position.set(57+24,-185,0)
    ejePalancaDer.add(palancaDer)

    ejePalancaIzq = new THREE.Object3D();
    ejePalancaIzq.position.set(-57-24,-185,0)
    ejePalancaIzq.add(palancaIzq)

    var estrellaCentral = new THREE.Mesh(geocilindro,material)
    estrellaCentral.rotation.x += Math.PI * 0.5;
    estrellaCentral.position.z += 10

    //Estrella FISICA
    var estrellaShape = new CANNON.Cylinder(30, 30, 80, 32)
    var star = new CANNON.Body({ mass: 0, material: materialEstrella });
    star.addShape(estrellaShape)
    star.position.set(0,0,0);
    star.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), -Math.PI/4);
    world.addBody(star)
    helper.addVisual(star)
    //PALANCA Física

    var aux = -Math.sin(-Math.PI * 0.25) * (-215);
    var aux2 = Math.cos(-Math.PI * 0.25) * (-215);

    var palancaIzqShape = new CANNON.Box(new CANNON.Vec3(85/2, 8/2, 40/2))
    palancaIzqBody = new CANNON.Body({ mass: 0, 
      material: materialPalanca ,
    })
    palancaIzqBody.addShape(palancaIzqShape)
    palancaIzqBody.position.set(ejePalancaIzq.position.x + palancaIzq.position.x ,aux,-(aux2)) 
    var quatX = new CANNON.Quaternion();
    var quatZ = new CANNON.Quaternion();
    quatX.setFromAxisAngle(new CANNON.Vec3(1,0,0), -Math.PI/4);
    quatZ.setFromAxisAngle(new CANNON.Vec3(0,0,1), -rotacionPalanca);
    var quaternion = quatX.mult(quatZ);
    quaternion.normalize();
    palancaIzqBody.quaternion.copy(quaternion)
    console.log(palancaIzqBody.rotation)
    world.addBody(palancaIzqBody)
    helper.addVisual(palancaIzqBody)
    //console.log(ejePalancaIzq.position)

    var palancaDerShape = new CANNON.Box(new CANNON.Vec3(85/2, 8/2, 40/2))
    palancaDerBody = new CANNON.Body({ mass: 0, material: materialPalanca ,type: CANNON.Body.KINEMATIC,
    })
    palancaDerBody.addShape(palancaDerShape)
    palancaDerBody.position.set(ejePalancaDer.position.x + palancaDer.position.x ,aux,-(aux2)) 
    var quatX = new CANNON.Quaternion();
    var quatZ = new CANNON.Quaternion();
    quatX.setFromAxisAngle(new CANNON.Vec3(1,0,0), -Math.PI/4);
    quatZ.setFromAxisAngle(new CANNON.Vec3(0,0,1), rotacionPalanca);
    var quaternion = quatX.mult(quatZ);
    quaternion.normalize();
    palancaDerBody.quaternion.copy(quaternion)
    world.addBody(palancaDerBody)
    helper.addVisual(palancaDerBody)

    

    //Cubre-palanca que está en horizontal
    cubrePalancaIzq = new THREE.Mesh(geocubrepalancaround,material)
    cubrePalancaIzq.position.x = -83-24
    cubrePalancaIzq.position.y = -165
    cubrePalancaIzq.position.z += 10
    cubrePalancaIzq.rotation.z -= rotacionPalanca
    plano.add(cubrePalancaIzq)

    cubrePalancaDer = new THREE.Mesh(geocubrepalancaround,material)
    cubrePalancaDer.position.x = 83 +24
    cubrePalancaDer.position.y = -165
    cubrePalancaDer.position.z += 10
    cubrePalancaDer.rotation.z += rotacionPalanca
    plano.add(cubrePalancaDer)

    //Cubre-palanca FISICO
    var aux = -Math.sin(-Math.PI * 0.25) * (-165);
    var aux2 = Math.cos(-Math.PI * 0.25) * (-165);

    var cubrePalancaShape = new CANNON.Box(new CANNON.Vec3(85/2, 8/2, 40/2))
    cubrePalancaBody = new CANNON.Body({ mass: 0, material: materialEstrella })
    cubrePalancaBody.addShape(cubrePalancaShape)
    cubrePalancaBody.position.set(cubrePalancaDer.position.x,aux,-(aux2)) 
    var quatX = new CANNON.Quaternion();
    var quatZ = new CANNON.Quaternion();
    quatX.setFromAxisAngle(new CANNON.Vec3(1,0,0), -Math.PI/4);
    quatZ.setFromAxisAngle(new CANNON.Vec3(0,0,1), rotacionPalanca);
    var quaternion = quatX.mult(quatZ);
    quaternion.normalize();
    cubrePalancaBody.quaternion.copy(quaternion)
    world.addBody( cubrePalancaBody)
    helper.addVisual(cubrePalancaBody)

    cubrePalancaIzqBody = new CANNON.Body({ mass: 0, material: materialEstrella })
    cubrePalancaIzqBody.addShape(cubrePalancaShape)
    cubrePalancaIzqBody.position.set(cubrePalancaIzq.position.x,aux,-(aux2)) 
    var quatX = new CANNON.Quaternion();
    var quatZ = new CANNON.Quaternion();
    quatX.setFromAxisAngle(new CANNON.Vec3(1,0,0), -Math.PI/4);
    quatZ.setFromAxisAngle(new CANNON.Vec3(0,0,1), -rotacionPalanca);
    var quaternion = quatX.mult(quatZ);
    quaternion.normalize();
    cubrePalancaIzqBody.quaternion.copy(quaternion)
    world.addBody( cubrePalancaIzqBody)
    helper.addVisual(cubrePalancaIzqBody)

    //Pared cubre-palanca
    var paredCubrePalancaIzq = new THREE.Mesh(geoparedcubrepalanca,material)
    paredCubrePalancaIzq.position.x = -90-24 -23
    paredCubrePalancaIzq.position.y = -162 +75
    paredCubrePalancaIzq.position.z += 10
    paredCubrePalancaIzq.rotation.z = Math.PI/2
    plano.add(paredCubrePalancaIzq)

    var paredCubrePalancaDer = new THREE.Mesh(geoparedcubrepalanca,material)
    paredCubrePalancaDer.position.x = 90+24 +23
    paredCubrePalancaDer.position.y = -162 + 75
    paredCubrePalancaDer.position.z += 10
    paredCubrePalancaDer.rotation.z = Math.PI/2
    plano.add(paredCubrePalancaDer)

    //PAREDES FÍSICAS
    var aux = -Math.sin(-Math.PI * 0.25) * (-87);
    var aux2 = Math.cos(-Math.PI * 0.25) * (-87);

    var paredCubrePalancaShape = new CANNON.Box(new CANNON.Vec3(100/2, 8/2, 20))
    paredCubrePalancaDerBody = new CANNON.Body({ mass: 0, material: materialEstrella })
    paredCubrePalancaDerBody.addShape(paredCubrePalancaShape)
    paredCubrePalancaDerBody.position.set(cubrePalancaDer.position.x +30,aux,-(aux2)) 
    var quatX = new CANNON.Quaternion();
    var quatZ = new CANNON.Quaternion();
    quatX.setFromAxisAngle(new CANNON.Vec3(1,0,0), -Math.PI/4);
    quatZ.setFromAxisAngle(new CANNON.Vec3(0,0,1), Math.PI/2);
    var quaternion = quatX.mult(quatZ);
    quaternion.normalize();
    paredCubrePalancaDerBody.quaternion.copy(quaternion)
    world.addBody( paredCubrePalancaDerBody)

    paredCubrePalancaIzqBody = new CANNON.Body({ mass: 0, material: materialEstrella })
    paredCubrePalancaIzqBody.addShape(paredCubrePalancaShape)
    paredCubrePalancaIzqBody.position.set(cubrePalancaIzq.position.x -30,aux,-(aux2)) 
    var quatX = new CANNON.Quaternion();
    var quatZ = new CANNON.Quaternion();
    quatX.setFromAxisAngle(new CANNON.Vec3(1,0,0), -Math.PI/4);
    quatZ.setFromAxisAngle(new CANNON.Vec3(0,0,1), -Math.PI/2);
    var quaternion = quatX.mult(quatZ);
    quaternion.normalize();
    paredCubrePalancaIzqBody.quaternion.copy(quaternion)
    world.addBody( paredCubrePalancaIzqBody)
    helper.addVisual( paredCubrePalancaIzqBody)
    helper.addVisual( paredCubrePalancaDerBody)




    

    //Rebotes de cerca de la palanca 
    var rebotePalancaIzq = new THREE.Mesh(georebotepalanca,material)
    rebotePalancaIzq.position.x -= 70;
    rebotePalancaIzq.position.y -= 100;
    rebotePalancaIzq.position.z += 10;
    rebotePalancaIzq.rotation.z -= Math.PI/2.75
    plano.add(rebotePalancaIzq)

    

    //Rebotes de cerca de la palanca VISUAL
    var rebotePalancaDer = new THREE.Mesh(georebotepalanca,material)
    rebotePalancaDer.position.x += 70;
    rebotePalancaDer.position.y -= 100;
    rebotePalancaDer.position.z += 10;
    rebotePalancaDer.rotation.z += Math.PI/2.75;
    plano.add(rebotePalancaDer);

    //Rebote palanca físico
    var aux = Math.sin(-Math.PI * 0.25) * -100;
    var aux2 = Math.cos(-Math.PI * 0.25) * -100;

    var rebotePalancaShape = new CANNON.Box(new CANNON.Vec3(85/2, 8/2, 20))
    rebotePalancaDerBody = new CANNON.Body({ mass: 0, material: materialEstrella })
    rebotePalancaDerBody.addShape(rebotePalancaShape)
    rebotePalancaDerBody.position.set(70,-aux,-(aux2)) 
    var quatX = new CANNON.Quaternion();
    var quatZ = new CANNON.Quaternion();
    quatX.setFromAxisAngle(new CANNON.Vec3(1,0,0), -Math.PI/4);
    quatZ.setFromAxisAngle(new CANNON.Vec3(0,0,1), Math.PI/3.1);
    var quaternion = quatX.mult(quatZ);
    quaternion.normalize();
    rebotePalancaDerBody.quaternion.copy(quaternion)
    world.addBody(rebotePalancaDerBody)

    rebotePalancaIzqBody = new CANNON.Body({ mass: 0, material: materialEstrella })
    rebotePalancaIzqBody.addShape(rebotePalancaShape)
    rebotePalancaIzqBody.position.set(-70,-aux,-(aux2)) 
    var quatX = new CANNON.Quaternion();
    var quatZ = new CANNON.Quaternion();
    quatX.setFromAxisAngle(new CANNON.Vec3(1,0,0), -Math.PI/4);
    quatZ.setFromAxisAngle(new CANNON.Vec3(0,0,1), -Math.PI/3.1);
    var quaternion = quatX.mult(quatZ);
    quaternion.normalize();
    rebotePalancaIzqBody.quaternion.copy(quaternion)
    world.addBody(rebotePalancaIzqBody)
    helper.addVisual(rebotePalancaIzqBody)
    helper.addVisual(rebotePalancaDerBody)

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

    var aux = -Math.sin(-Math.PI * 0.25) * (-bolardoDerecha.position.y+300);
    var aux2 = Math.cos(-Math.PI * 0.25) * (-bolardoDerecha.position.y+300);

    var bolardoShape = new CANNON.Cylinder(10, 10, 40, 20)
    var bolardoDerechaBody = new CANNON.Body({ mass: 0, material: materialEstrella });
    bolardoDerechaBody.addShape(bolardoShape)
    bolardoDerechaBody.position.set(bolardoDerecha.position.x,aux,-aux2);
    bolardoDerechaBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), -Math.PI/4);
    world.addBody(bolardoDerechaBody)
    helper.addVisual(bolardoDerechaBody)


    var bolardoIzquierda = new THREE.Mesh(geocilindroBolardo,material)
    bolardoIzquierda.position.x =  - distancia
    bolardoIzquierda.position.y = reboteCortoIzq1.position.y
    bolardoIzquierda.position.z += 10
    bolardoIzquierda.rotation.x = Math.PI/2

    var bolardoIzqBody = new CANNON.Body({ mass: 0, material: materialEstrella });
    bolardoIzqBody.addShape(bolardoShape)
    bolardoIzqBody.position.set(bolardoIzquierda.position.x,aux,-aux2);
    bolardoIzqBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), -Math.PI/4);
    world.addBody(bolardoIzqBody)
    helper.addVisual(bolardoIzqBody)

    var aux = -Math.sin(-Math.PI * 0.25) * (-bolardoDerecha.position.y+300+distancia);
    var aux2 = Math.cos(-Math.PI * 0.25) * (-bolardoDerecha.position.y+300+distancia);

    var bolardoArriba = new THREE.Mesh(geocilindroBolardo,material)
    bolardoArriba.position.y = bolardoDerecha.position.y - distancia
    bolardoArriba.position.z += 10
    bolardoArriba.rotation.x = Math.PI/2

    var bolardoArribaBody = new CANNON.Body({ mass: 0, material: materialEstrella });
    bolardoArribaBody.addShape(bolardoShape)
    bolardoArribaBody.position.set(bolardoArriba.position.x,aux,-aux2);
    bolardoArribaBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), -Math.PI/4);
    world.addBody(bolardoArribaBody)
    helper.addVisual(bolardoArribaBody)

    var bolardoAbajo = new THREE.Mesh(geocilindroBolardo,material)
    bolardoAbajo.position.y = bolardoDerecha.position.y + distancia
    bolardoAbajo.position.z += 10
    bolardoAbajo.rotation.x = Math.PI/2

    var aux = -Math.sin(-Math.PI * 0.25) * (-bolardoDerecha.position.y+300-distancia);
    var aux2 = Math.cos(-Math.PI * 0.25) * (-bolardoDerecha.position.y+300-distancia);

    var bolardoAbajoBody = new CANNON.Body({ mass: 0, material: materialEstrella });
    bolardoAbajoBody.addShape(bolardoShape)
    bolardoAbajoBody.position.set(bolardoArriba.position.x,aux,-aux2);
    bolardoAbajoBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), -Math.PI/4);
    world.addBody(bolardoAbajoBody)
    helper.addVisual(bolardoAbajoBody)

    //Bolardos laterales
    var bolardoLateralDerecha = new THREE.Mesh(geocilindroBolardo,material)
    bolardoLateralDerecha.position.x = reboteCortoDer1.position.x + 55
    bolardoLateralDerecha.position.y = reboteCortoDer1.position.y
    bolardoLateralDerecha.position.z += 10
    bolardoLateralDerecha.rotation.x = Math.PI/2

    var aux = -Math.sin(-Math.PI * 0.25) * (-bolardoDerecha.position.y+300);
    var aux2 = Math.cos(-Math.PI * 0.25) * (-bolardoDerecha.position.y+300);

    var bolardoLateralDerechaBody = new CANNON.Body({ mass: 0, material: materialEstrella });
    bolardoLateralDerechaBody.addShape(bolardoShape)
    bolardoLateralDerechaBody.position.set(bolardoLateralDerecha.position.x,aux,-aux2);
    bolardoLateralDerechaBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), -Math.PI/4);
    world.addBody(bolardoLateralDerechaBody)
    helper.addVisual(bolardoLateralDerechaBody)


    var bolardoLateralIzquierda = new THREE.Mesh(geocilindroBolardo,material)
    bolardoLateralIzquierda.position.x = reboteCortoIzq1.position.x - 55
    bolardoLateralIzquierda.position.y = reboteCortoIzq1.position.y
    bolardoLateralIzquierda.position.z += 10
    bolardoLateralIzquierda.rotation.x = Math.PI/2

    var bolardoLateralIzqBody = new CANNON.Body({ mass: 0, material: materialEstrella });
    bolardoLateralIzqBody.addShape(bolardoShape)
    bolardoLateralIzqBody.position.set(bolardoLateralIzquierda.position.x,aux,-aux2);
    bolardoLateralIzqBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), -Math.PI/4);
    world.addBody(bolardoLateralIzqBody)
    helper.addVisual(bolardoLateralIzqBody)

    //Estrella fondo
    var estrellaFondo = new THREE.Mesh(geocilindrofondo,material)
    estrellaFondo.position.y = bolardoArriba.position.y + 100
    estrellaFondo.rotation.x += Math.PI * 0.5;
    estrellaFondo.position.z += 10

    var aux = -Math.sin(-Math.PI * 0.25) * (-bolardoArriba.position.y + 350);
    var aux2 = Math.cos(-Math.PI * 0.25) * (-bolardoArriba.position.y + 350);

    var estrellaFondoShape = new CANNON.Cylinder(20, 20, 40, 32)
    var estrellaFondoBody = new CANNON.Body({ mass: 0, material: materialEstrella });
    estrellaFondoBody.addShape(estrellaFondoShape)
    estrellaFondoBody.position.set(estrellaFondo.position.x,aux,-aux2);
    estrellaFondoBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), -Math.PI/4);
    world.addBody(estrellaFondoBody)
    helper.addVisual(estrellaFondoBody)



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
    // for(let i=0; i<this.plane.vertices.length/2; i++) {
    //   this.plane.vertices[2*i].z = curveGeometry.vertices[i].y;
    //   this.plane.vertices[2*i+1].z = curveGeometry.vertices[i].y;
    // }

   topePista = new THREE.Mesh(this.plane,  material);
   topePista.rotation.x -= Math.PI/2;
   topePista.rotation.z -=Math.PI/2
   topePista.position.y += 400
   //plano.add(topePista);
 
   //world.addBody(topeBody)
   //helper.addVisual(topeBody)
   var paredIzq = new THREE.Mesh(geopared,material)
   paredIzq.position.x = -180
   paredIzq.position.y = 75
   paredIzq.rotation.y = Math.PI/2

   var paredDer = new THREE.Mesh(geopared,material)
   paredDer.position.x = 180
   paredDer.position.y = 75
   paredDer.rotation.y = Math.PI/2
   //plano.add(paredDer)

   var paredShape = new CANNON.Box(new CANNON.Vec3(700, 2, 500))

   topeBody = new CANNON.Body({ mass: 0, material: wallMaterial })
   topeBody.addShape(paredShape)
   topeBody.position.set(0,200,-250) 
   var quatX = new CANNON.Quaternion();
   var quatY = new CANNON.Quaternion();
   quatX.setFromAxisAngle(new CANNON.Vec3(1,0,0), -Math.PI/4);
   quatZ.setFromAxisAngle(new CANNON.Vec3(0,0,1),Math.PI);
   var quaternion = quatX.mult(quatZ);
   quaternion.normalize();
   topeBody.quaternion.copy(quaternion)
   world.addBody( topeBody)
   //helper.addVisual(topeBody)

   paredIzqBody = new CANNON.Body({ mass: 0, material: wallMaterial })
   paredIzqBody.addShape(paredShape)
   paredIzqBody.position.set(paredIzq.position.x,0,0) 
   var quatX = new CANNON.Quaternion();
   var quatY = new CANNON.Quaternion();
   quatX.setFromAxisAngle(new CANNON.Vec3(1,0,0), Math.PI/2);
   quatY.setFromAxisAngle(new CANNON.Vec3(0,0,1),Math.PI/2);
   var quaternion = quatX.mult(quatY);
   quaternion.normalize();
   paredIzqBody.quaternion.copy(quaternion)
   world.addBody( paredIzqBody)
   //helper.addVisual(paredIzqBody)

   paredDerBody = new CANNON.Body({ mass: 0, material: wallMaterial })
   paredDerBody.addShape(paredShape)
   paredDerBody.position.set(paredDer.position.x,0,0) 
   var quatX = new CANNON.Quaternion();
   var quatY = new CANNON.Quaternion();
   quatX.setFromAxisAngle(new CANNON.Vec3(1,0,0), Math.PI/2);
   quatY.setFromAxisAngle(new CANNON.Vec3(0,0,1),Math.PI/2);
   var quaternion = quatX.mult(quatY);
   quaternion.normalize();
   paredDerBody.quaternion.copy(quaternion)
   world.addBody( paredDerBody)
   //helper.addVisual(paredDerBody)

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


    //console.log(palancaIzq.quaternion)
    //console.log(palancaIzqBody.quaternion)

   //Movimiento para las palancas
  
   //Eventos de teclado
   keyboard = new THREEx.KeyboardState(renderer.domElement);  
   renderer.domElement.setAttribute("tabIndex", "0");
   renderer.domElement.focus();  
   acumDer = rotacionPalanca;
   posXder = palancaDerBody.position.x;
   posYder = palancaDerBody.position.y;
   posZder = palancaDerBody.position.z;

   posXizq = palancaIzqBody.position.x;
   posYizq = palancaIzqBody.position.y;
   posZizq = palancaIzqBody.position.z;

   keyboard.domElement.addEventListener('keydown', function(event){
		if ( keyboard.eventMatches(event, 'left') ){
      movePalIzq = true;
		}
		if ( keyboard.eventMatches(event, 'right') ){
      movePalDer = true;
    }
  })
  
  keyboard.domElement.addEventListener('keyup', function(event){
		if ( keyboard.eventMatches(event, 'left') ){
      movePalIzq = false; 
		}
		if ( keyboard.eventMatches(event, 'right') ){
      movePalDer = false;
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
    var segundos = reloj.getDelta();
    //Actualizar interpoladores
    if(movePalDer){
      console.log("Moviendo arriba derecha")
      if(acumDer >= -0.4){
        
        palancaDerBody.position.set(posXder,posYder+6,posZder -4.5) 
        var quatX = new CANNON.Quaternion();
        var quatZ = new CANNON.Quaternion();
        quatX.setFromAxisAngle(new CANNON.Vec3(1,0,0), -Math.PI/4);
        quatZ.setFromAxisAngle(new CANNON.Vec3(0,0,1), acumDer-0.2);
        var quaternion = quatX.mult(quatZ);
        quaternion.normalize();
        palancaDerBody.quaternion.copy(quaternion)
        acumDer -= 0.2
        posYder += 6
        posZder -= 4.5
        palancaDer.position.copy(palancaDerBody)
        if(bodiesAreInContact(bola.body,palancaDerBody)){
          console.log("in")
          bola.body.applyImpulse(new CANNON.Vec3(0,200,-200),bola.body.position)
          bola.visual.position.copy( bola.body.position )
        }
        bola.visual.position.copy( bola.body.position )
        }
    }else{
      if(acumDer < rotacionPalanca-0.1){
        palancaDerBody.position.set(posXder,posYder-6,posZder +4.25) 
        var quatX = new CANNON.Quaternion();
        var quatZ = new CANNON.Quaternion();
        quatX.setFromAxisAngle(new CANNON.Vec3(1,0,0), -Math.PI/4);
        quatZ.setFromAxisAngle(new CANNON.Vec3(0,0,1), acumDer+0.2);
        var quaternion = quatX.mult(quatZ);
        quaternion.normalize();
        palancaDerBody.quaternion.copy(quaternion)
        acumDer += 0.2
        posYder -= 6
        posZder += 4.5
        palancaDer.position.copy(palancaDerBody)
      }
    }
    if(movePalIzq){
      if(acumIzq <= 0.4){
        
        palancaIzqBody.position.set(posXizq,posYizq+6,posZizq -4.5) 
        var quatX = new CANNON.Quaternion();
        var quatZ = new CANNON.Quaternion();
        quatX.setFromAxisAngle(new CANNON.Vec3(1,0,0), -Math.PI/4);
        quatZ.setFromAxisAngle(new CANNON.Vec3(0,0,1), acumIzq+0.2);
        var quaternion = quatX.mult(quatZ);
        quaternion.normalize();
        palancaIzqBody.quaternion.copy(quaternion)
        acumIzq += 0.2
        posYizq += 6
        posZizq -= 4.5
        palancaIzq.position.copy(palancaIzqBody)
        if(bodiesAreInContact(bola.body,palancaIzqBody)){
          bola.body.applyImpulse(new CANNON.Vec3(0,200,-200),bola.body.position)
          bola.visual.position.copy( bola.body.position )
        }
      }
    }else{
      if(acumIzq > -rotacionPalanca+0.1){
        palancaIzqBody.position.set(posXizq,posYizq-6,posZizq +4.5) 
        var quatX = new CANNON.Quaternion();
        var quatZ = new CANNON.Quaternion();
        quatX.setFromAxisAngle(new CANNON.Vec3(1,0,0), -Math.PI/4);
        quatZ.setFromAxisAngle(new CANNON.Vec3(0,0,1), acumIzq-0.2);
        var quaternion = quatX.mult(quatZ);
        quaternion.normalize();
        palancaIzqBody.quaternion.copy(quaternion)
        acumIzq -= 0.2
        posYizq -= 6
        posZizq += 4.5
        palancaIzq.position.copy(palancaIzqBody)
      }
    }
    //world.step(1/50,segundos,10);				// recalcula el mundo tras ese tiempo      
    if(bodiesAreInContact(bola.body,paredDerBody)){
      bola.body.applyImpulse(new CANNON.Vec3(-75,0,0),bola.body.position)
    }else if(bodiesAreInContact(bola.body,paredIzqBody)){
      bola.body.applyImpulse(new CANNON.Vec3(75,0,0),bola.body.position)
    }
    if(bola.body.position.y< -300){
      var aux = Math.sin(-Math.PI * 0.25) * 350;
      var aux2 = Math.cos(-Math.PI * 0.25) * 350;
      bola.body.position.copy(new CANNON.Vec3(10,aux2-25,aux +50))
      bola.body.velocity.set(0,0,0)
    }
    bola.visual.position.copy( bola.body.position)
    helper.update()
    world.step(1/60)
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
