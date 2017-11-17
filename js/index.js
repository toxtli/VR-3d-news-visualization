var camera, scene, renderer;
var controls;

var objects = [];
var targets = { table: [], sphere: [], helix: [], grid: [] };
var globals = {};

function run() {
	init();
	loadNews();
}

function loadData(table) {
	for ( var i = 0; i < table.length; i++) {
		var obj = table[i];
		var element = document.createElement( 'div' );
		element.className = 'element';
		element.style.backgroundColor = 'rgba(0,127,127,' + ( Math.random() * 0.5 + 0.25 ) + ')';
		var number = document.createElement( 'div' );
		number.className = 'number';
		number.textContent = obj.date;
		element.appendChild( number );
		var symbol = document.createElement( 'div' );
		symbol.className = 'symbol';
		symbol.innerHTML = '<a href="' + obj.url + '" target="_blank"><img src="' + obj.img + '"></a>';
		element.appendChild( symbol );
		var details = document.createElement( 'div' );
		details.className = 'details';
		details.innerHTML = obj.title;
		element.appendChild( details );
		var object = new THREE.CSS3DObject( element );
		object.position.x = Math.random() * 4000 - 2000;
		object.position.y = Math.random() * 4000 - 2000;
		object.position.z = Math.random() * 4000 - 2000;
		scene.add( object );
		objects.push( object );
		//
		var object = new THREE.Object3D();
		object.position.x = ( obj.col * 140 ) - 1330;
		object.position.y = - ( obj.row * 180 ) + 990;
		targets.table.push( object );
	}
	renderView();
	animate();
}

function renderView() {
	// sphere

	var vector = new THREE.Vector3();
	var spherical = new THREE.Spherical();

	for ( var i = 0, l = objects.length; i < l; i ++ ) {
		var phi = Math.acos( -1 + ( 2 * i ) / l );
		var theta = Math.sqrt( l * Math.PI ) * phi;
		var object = new THREE.Object3D();
		spherical.set( 800, phi, theta );
		object.position.setFromSpherical( spherical );
		vector.copy( object.position ).multiplyScalar( 2 );
		object.lookAt( vector );
		targets.sphere.push( object );
	}

	// helix

	var vector = new THREE.Vector3();
	var cylindrical = new THREE.Cylindrical();

	for ( var i = 0, l = objects.length; i < l; i ++ ) {
		var theta = i * 0.175 + Math.PI;
		var y = - ( i * 8 ) + 450;
		var object = new THREE.Object3D();
		cylindrical.set( 900, theta, y );
		object.position.setFromCylindrical( cylindrical );
		vector.x = object.position.x * 2;
		vector.y = object.position.y;
		vector.z = object.position.z * 2;
		object.lookAt( vector );
		targets.helix.push( object );
	}

	// grid

	for ( var i = 0; i < objects.length; i ++ ) {
		var object = new THREE.Object3D();
		object.position.x = ( ( i % 5 ) * 400 ) - 800;
		object.position.y = ( - ( Math.floor( i / 5 ) % 5 ) * 400 ) + 800;
		object.position.z = ( Math.floor( i / 25 ) ) * 1000 - 2000;
		targets.grid.push( object );
	}
	//
	renderer = new THREE.CSS3DRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );
	renderer.domElement.style.position = 'absolute';
	document.getElementById( 'container' ).appendChild( renderer.domElement );
	//
	controls = new THREE.TrackballControls( camera, renderer.domElement );
	controls.rotateSpeed = 0.5;
	controls.minDistance = 500;
	controls.maxDistance = 6000;
	controls.addEventListener( 'change', render );
	var button = document.getElementById( 'table' );
	button.addEventListener( 'click', function ( event ) {
		transform( targets.table, 2000 );
	}, false );
	var button = document.getElementById( 'sphere' );
	button.addEventListener( 'click', function ( event ) {
		transform( targets.sphere, 2000 );
	}, false );
	var button = document.getElementById( 'helix' );
	button.addEventListener( 'click', function ( event ) {
		transform( targets.helix, 2000 );
	}, false );
	var button = document.getElementById( 'grid' );
	button.addEventListener( 'click', function ( event ) {
		transform( targets.grid, 2000 );
	}, false );
	transform( targets.table, 2000 );
	//
	window.addEventListener( 'resize', onWindowResize, false );
}

function init() {
	camera = new THREE.PerspectiveCamera( 40, window.innerWidth / window.innerHeight, 1, 10000 );
	camera.position.z = 3000;
	scene = new THREE.Scene();
}

function transform( targets, duration ) {
	TWEEN.removeAll();
	for ( var i = 0; i < objects.length; i ++ ) {
		var object = objects[ i ];
		var target = targets[ i ];
		new TWEEN.Tween( object.position )
			.to( { x: target.position.x, y: target.position.y, z: target.position.z }, Math.random() * duration + duration )
			.easing( TWEEN.Easing.Exponential.InOut )
			.start();
		new TWEEN.Tween( object.rotation )
			.to( { x: target.rotation.x, y: target.rotation.y, z: target.rotation.z }, Math.random() * duration + duration )
			.easing( TWEEN.Easing.Exponential.InOut )
			.start();
	}
	new TWEEN.Tween( this )
		.to( {}, duration * 2 )
		.onUpdate( render )
		.start();
}

function onWindowResize() {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize( window.innerWidth, window.innerHeight );
	render();
}

function animate() {
	requestAnimationFrame( animate );
	TWEEN.update();
	controls.update();
}

function render() {
	renderer.render( scene, camera );
}

function loadNews() {
	var rows = 9;
	globals.contSource = 0;
	globals.col = 1;
	globals.row = 1;
	globals.data = globals.data ? globals.data : [];
	globals.ids = globals.ids ? globals.ids : {};
	sources.forEach(function(source) {
		console.log(source);
		YUI().use('yql', function(Y){
		    var query = 'select * from rss(0,100) where url = "' + source.url + '"';
		    var q = Y.YQL(query, function(r) {
		        // console.log(r.query.results.item);
		        if (r.query.results) {
			        var feeds = r.query.results.item;
			        feeds.forEach(function(feed) {
			        	var time = Date.parse(feed.pubDate);
			        	var date = moment.unix(time/1000).format('ll');
			        	globals.data.push({
			        		url: feed.link,
			        		img: 'img/default.png',
			        		title: feed.title,
			        		time: time,
			        		date: date,
			        		col: globals.col,
			        		row: globals.row
			        	});
			        	globals.row++;
						if (globals.row > rows) {
							globals.row = 1;
							globals.col += 1;
						}
			        });
		        }
	        	globals.contSource++;
		        if (globals.contSource == sources.length) {
		        	newsLoaded();
		        }
		    })
		});
	});
}

function filterData(data) {
	var db = TAFFY(data);
	var elements = db().order("time desc").limit(108).get();
	orderElements(elements);
	return elements;
}

function orderElements(elements) {
	var col = 1;
	var row = 1;
	var rows = 9;
	for (var i in elements) {
		elements[i].col = col;
		elements[i].row = row;
	    row++;
		if (row > rows) {
			row = 1;
			col += 1;
		}
	}
}

function newsLoaded() {
	console.log("Done");
	console.log(globals.data);
	var filteredData = filterData(globals.data);
	loadData(filteredData);
}

run();