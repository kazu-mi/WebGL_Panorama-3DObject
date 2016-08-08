var scene 		= null;
var raycaster 	= null;
var camera 		= null;
var controls 	= null;
var sphere 		= null;

var materials		= [];
var materialIndex 	= 0;

var main = function() {
	scene = new THREE.Scene();
	raycaster = new THREE.Raycaster()

	var directionalLights = [
		new THREE.DirectionalLight(0xffffff),
	];
	directionalLights[0].position.set(-50, 50, 0);
	scene.add(directionalLights[0]);

	var geometry = new THREE.SphereGeometry( 200, 800, 40 );
	geometry.scale( -1, 1, 1 );
	var textureLoader = new THREE.TextureLoader();
	textureLoader.load('test.jpg',
		function(texture) {
			var material = new THREE.MeshBasicMaterial( {
				map: texture
			} );
			materials[0] = material;
			sphere = new THREE.Mesh( geometry, material );
			scene.add( sphere );
			
			// カメラの位置を設定
			camera.position.set( 0, 0, 0.1 );
			camera.lookAt( sphere.position );
		}
	);

	textureLoader.load('_test.jpg',
		function(texture) {
			var material = new THREE.MeshBasicMaterial( {
				map: texture
			} );
			materials[1] = material;
		}
	);
	
	var width 	= window.innerWidth;
	var height 	= window.innerHeight;
	var fov 	= 75;				// 画角
	var aspect	= width / height;	// 撮影結果縦横比
	var near	= 1;				// ニアークリップの距離（ここより近い部分は描画されない）
	var far		= 1000;				// ファークリップの距離（ここより遠い部分は描画されない）
	camera	= new THREE.PerspectiveCamera( fov, aspect, near, far );

	// ページにレンダラーを追加する
	var renderer = new THREE.WebGLRenderer();
	renderer.setClearColor( 0x000000, 1 );
	renderer.setSize( width, height );
	document.body.appendChild( renderer.domElement );

	// カメラを移動できるようにコントローラーを追加する
	controls = new THREE.OrbitControls( camera, renderer.domElement );
	controls.enableDamping = true;
	controls.dampingFactor = 1;
	controls.enablePan = true;
	controls.enableZoom = true;
	controls.minDistance = 0.0;
	controls.maxDistance = 200.0;
	controls.target.set( 0, 0, 0 );
	controls.maxPolarAngle = Math.PI * 1;

	window.signBoard = new Signboard(
								'box', 
								new THREE.Vector3(180, 0, 70),
								new THREE.Vector3(10, 10, 10),
								0xff0000);
	window.signBoard.tapAction = function() {
		materialIndex = 1;
		sphere.material = materials[materialIndex];
		scene.remove(signBoard.mesh);
		scene.add(parkExit.mesh);
	}
	
	window.parkExit = new Signboard(
								'box', 
								new THREE.Vector3(95, -2, -165),
								new THREE.Vector3(4, 4, 4),
								0xffff00);
	window.parkExit.tapAction = function() {
		materialIndex = 0;
		sphere.material = materials[materialIndex];
		scene.remove(parkExit.mesh);
		scene.add(signBoard.mesh);
	}

	scene.add( window.signBoard.mesh );
	
	// 描画ループ
	( function renderLoop () {
		requestAnimationFrame( renderLoop );

		controls.update();

		window.signBoard.rotate();
		window.parkExit.rotate();

		// 描画
		renderer.render( scene, camera );
	} )();
}

window.addEventListener('DOMContentLoaded', main, false);

/**
 * マウスアップイベント
 * - マウスアップ時にタッチしたオブジェクトを判定する
 * @param event イベント情報
 */
window.onmouseup = function(event) {
	var rect = event.target.getBoundingClientRect();

	// マウス位置(2D)
	var mouseX = event.pageX - rect.left;
	var mouseY = event.pageY - rect.top;

	// マウス位置(3D)
	mouseX =  (mouseX / window.innerWidth)  * 2 - 1;
	mouseY = -(mouseY / window.innerHeight) * 2 + 1;

	var pos = new THREE.Vector3(mouseX, mouseY, 0.5).unproject( camera );
	raycaster.ray.set( camera.position, pos.sub(camera.position).normalize() );

	var obj = raycaster.intersectObjects([window.signBoard.mesh, window.parkExit.mesh]);

	if (obj.length > 0) {
		if (obj[0].object.uuid === window.signBoard.mesh.uuid) {
			window.signBoard.tapAction();
		} else if (obj[0].object.uuid === window.parkExit.mesh.uuid) {
			window.parkExit.tapAction();
		}
		return true;
	}
}

/**
 * マウスムーブイベント
 * - マウスムーブ時に小ブロックにマウスを乗せているかを判定する
 * @param event イベント情報
 */
window.onmousemove = function(event) {
	
}

/**
 * 案内表示クラス
 */
class Signboard {

	constructor(type, position, size, color) {
		switch (type.toLowerCase()) {
		case 'box':
			this._geometry = new THREE.BoxGeometry( size.x, size.y, size.z );
			break;
		
		case 'sphere':
			this._geometry = new THREE.SphereGeometry( size, 60, 40 );
			break;

		case 'cylinder':
			break;
		}

		this._material = new THREE.MeshPhongMaterial({color:color});
		this._mesh = new THREE.Mesh( this._geometry, this._material );

		this._mesh.position.set(position.x, position.y, position.z);

		this.tapAction = function() {};
	}

	get mesh() {
		return this._mesh;
	}

	rotate() {
		this._mesh.rotation.set(
			this._mesh.rotation.x + 0.04,
			this._mesh.rotation.y + 0.04,
			this._mesh.rotation.z + 0.04	
		);
	}
}