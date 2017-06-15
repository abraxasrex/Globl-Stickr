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

function b64EncodeUnicode(str) {
    // first we use encodeURIComponent to get percent-encoded UTF-8,
    // then we convert the percent encodings into raw bytes which
    // can be fed into btoa.
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1);
    }));
}


function fetchBlob(uri, callback) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', uri, true);
  xhr.responseType = 'arraybuffer';

  xhr.onload = function(e) {
    if (this.status == 200) {
      var blob = this.response;
      if (callback) {
        callback(blob);
      }
    }
  };
  xhr.send();
};


var jpgData = new Uint8Array([255,216,255,224,0,16,74,70,73,70,0,1,1,0,0,1,0,1,0,0,255,254,0,62,67,82,69,65,84,79,82,58,32,103,100,45,106,112,101,103,32,118,49,46,48,32,40,117,115,105,110,103,32,73,74,71,32,74,80,69,71,32,118,54,50,41,44,32,100,101,102,97,117,108,116,32,113,117,97,108,105,116,121,10,255,219,0,67,0,8,6,6,7,6,5,8,7,7,7,9,9,8,10,12,20,13,12,11,11,12,25,18,19,15,20,29,26,31,30,29,26,28,28,32,36,46,39,32,34,44,35,28,28,40,55,41,44,48,49,52,52,52,31,39,57,61,56,50,60,46,51,52,50,255,219,0,67,1,9,9,9,12,11,12,24,13,13,24,50,33,28,33,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,50,255,192,0,17,8,0,24,0,24,3,1,34,0,2,17,1,3,17,1,255,196,0,31,0,0,1,5,1,1,1,1,1,1,0,0,0,0,0,0,0,0,1,2,3,4,5,6,7,8,9,10,11,255,196,0,181,16,0,2,1,3,3,2,4,3,5,5,4,4,0,0,1,125,1,2,3,0,4,17,5,18,33,49,65,6,19,81,97,7,34,113,20,50,129,145,161,8,35,66,177,193,21,82,209,240,36,51,98,114,130,9,10,22,23,24,25,26,37,38,39,40,41,42,52,53,54,55,56,57,58,67,68,69,70,71,72,73,74,83,84,85,86,87,88,89,90,99,100,101,102,103,104,105,106,115,116,117,118,119,120,121,122,131,132,133,134,135,136,137,138,146,147,148,149,150,151,152,153,154,162,163,164,165,166,167,168,169,170,178,179,180,181,182,183,184,185,186,194,195,196,197,198,199,200,201,202,210,211,212,213,214,215,216,217,218,225,226,227,228,229,230,231,232,233,234,241,242,243,244,245,246,247,248,249,250,255,196,0,31,1,0,3,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,2,3,4,5,6,7,8,9,10,11,255,196,0,181,17,0,2,1,2,4,4,3,4,7,5,4,4,0,1,2,119,0,1,2,3,17,4,5,33,49,6,18,65,81,7,97,113,19,34,50,129,8,20,66,145,161,177,193,9,35,51,82,240,21,98,114,209,10,22,36,52,225,37,241,23,24,25,26,38,39,40,41,42,53,54,55,56,57,58,67,68,69,70,71,72,73,74,83,84,85,86,87,88,89,90,99,100,101,102,103,104,105,106,115,116,117,118,119,120,121,122,130,131,132,133,134,135,136,137,138,146,147,148,149,150,151,152,153,154,162,163,164,165,166,167,168,169,170,178,179,180,181,182,183,184,185,186,194,195,196,197,198,199,200,201,202,210,211,212,213,214,215,216,217,218,226,227,228,229,230,231,232,233,234,242,243,244,245,246,247,248,249,250,255,218,0,12,3,1,0,2,17,3,17,0,63,0,225,109,238,89,177,194,175,3,160,56,198,63,90,232,23,193,58,181,198,129,246,255,0,48,91,73,52,196,37,147,225,119,192,49,243,111,45,158,73,29,187,142,213,204,197,117,246,11,104,101,154,88,124,180,145,72,81,247,136,207,183,30,181,239,190,36,188,211,99,68,185,242,148,164,113,121,145,180,127,119,102,51,159,166,43,139,15,77,89,201,149,177,226,44,230,81,37,188,214,234,251,91,107,28,228,238,29,206,79,255,0,90,138,154,242,120,230,19,72,176,198,190,103,207,251,179,157,217,25,200,205,21,196,147,111,64,122,144,216,248,87,251,98,55,143,85,185,158,210,220,169,116,40,60,204,55,24,227,191,83,233,94,129,117,168,19,225,187,125,29,165,23,119,73,103,37,164,183,112,40,10,160,0,17,182,158,229,120,227,184,162,138,214,150,42,106,45,89,21,73,123,73,53,35,137,26,4,176,69,228,137,51,110,16,236,221,130,216,3,140,154,40,162,176,246,175,153,232,67,220,255,217]);


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
    planeMaterial = new THREE.MeshBasicMaterial( {map: planeTexture} );
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

fetchBlob( "https://maps.googleapis.com/maps/api/streetview?size=600x300&location=" + lat + "," + long + "&heading=151.78&pitch=-0.76&key=" + myTokens.googleStreetViewKey, function( data ) {
  

 

planeImage = new Image();

    var stringData = String.fromCharCode.apply(null, new Uint8Array(data));
    console.log("DATA: ", data);
	var encodedData = window.btoa(stringData);
    	var dataURI = "data:image/jpeg;base64," + encodedData;

planeImage = new Image();
planeTexture = new THREE.Texture();
planeImage.onload = function()  {
    planeTexture.image = planeImage;
    planeTexture.needsUpdate = true;
};

planeImage.src = dataURI;


    setTimeout(()=>{ 
        init();
        render();
    }, 2000);

});

window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});