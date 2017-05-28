const THREE = require("three");
const OrbitControls = require('three-orbit-controls')(THREE);
import {Observable} from 'rxjs';
require('../node_modules/rxjs/observable/from');
import {myTokens} from '../keys';

let scene, renderer, camera, controls;
let cube;
let plane, planeGeometry, planeMaterial, planeLoaded, planeImage;
let imageLoader;

let planeTexture;

function getImage(url){
    return new Promise(function(resolve, reject){
        var img = new Image()
        img.onload = function(){
            resolve(url)
        }
        img.onerror = function(){
            reject(url)
        }
        img.src = url
    })
}

function loadImage(imagePath){
   return Observable.create(function(observer){
     var img = new Image();
     img.src = imagePath;
     img.onload = function(){
       observer.next(img);
       observer.complete();
     }
     img.onError = function(err){
       observer.error(err);
     }
   });
}

function loadTextureAsync (url, mapping) {

  return new Promise ((resolve, reject) => {

    const onLoad = (texture) => resolve (texture)

    const onError = (event) => reject (event)

    THREE.ImageUtils.loadTexture(
      url, mapping, onLoad, onError)
  });
}

let lat = '47.610553047';
let long = '-122.3034100122';


let init = () => {

    //boilerplate
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x333333);
    document.querySelector("#container").appendChild(renderer.domElement);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        3000
    );
    scene.add(camera);
    camera.position.set(0, 0, 10);
    controls = new OrbitControls(camera);
    //le Cube
    cube = new THREE.Mesh(new THREE.BoxGeometry(3, 3, 3), new THREE.MeshNormalMaterial());
    scene.add(cube);
    // plane
    // planeTexture.wrapS = THREE.RepeatWrapping; 
    // planeTexture.wrapT = THREE.RepeatWrapping;
   // planeTexture.repeat.set( 4, 4 ); 


    planeGeometry = new THREE.PlaneGeometry(20, 20, 20 );
   // planeMaterial = new THREE.MeshBasicMaterial( {map: planeTexture} );
    plane = new THREE.Mesh( planeGeometry, planeMaterial );
    plane.material.side = THREE.DoubleSide;
    scene.add( plane );
    plane.position.set(0,0,-7.5);

   // imageLoader = THREE.ImageLoader();

}

let render = () => {
    requestAnimationFrame(render);
    renderer.render(scene, camera);

    cube.rotation.x += .01;
    cube.rotation.y += .01;
}

// Observable
//   .from(['images/checkers.png'])  
//   .concatMap(loadImage)
//   .toArray()
//   .subscribe(function(img){
//       console.log("image: ", img);
//       planeImage = img[0];
//       planeTexture = new THREE.Texture(planeImage);
//       init();
//      render();
//   })

//  init();
//  render();

$.get( "https://maps.googleapis.com/maps/api/streetview?size=600x300&location=" + lat + "," + long + "&heading=151.78&pitch=-0.76&key=" + myTokens.googleStreetViewKey, function( data ) {
  
  console.log('dataaaa: ', data.length);

}).done((success)=>{
    console.log('success', success.length);  

  //  loadTextureAsync (success, planeTexture);
   // planeTexture = new THREE.Texture(success);

   planeMaterial = new THREE.MeshBasicMaterial({
        map:THREE.ImageUtils.loadTexture(success)
    });
    planeMaterial.map.needsUpdate = true; 

setTimeout(()=>{ 
      init();
    render();
  }, 2000);

}).fail((err)=>{
    console.log(err);
});

// planeImage =new Image();
// planeImage.onload = (()=> {    } )
// planeImage.src = "https://maps.googleapis.com/maps/api/streetview?size=600x300&location=" + lat + "," + long + "&heading=151.78&pitch=-0.76&key=" + myTokens.googleStreetViewKey;

// setTimeout(()=>{
//     planeTexture = new THREE.ImageUtils.loadTexture(planeImage);
// }, 1500);

// setTimeout(()=>{ 
//       init();
//     render();
//   }, 3000);

//helpers
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});