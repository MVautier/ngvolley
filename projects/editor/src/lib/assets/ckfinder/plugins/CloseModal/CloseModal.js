/*
 * CKFinder - Sample Plugins
 * ==========================
 * http://cksource.com/ckfinder
 * Copyright (C) 2007-2015, CKSource - Frederico Knabben. All rights reserved.
 *
 * This file and its contents are subject to the MIT License.
 * Please read the LICENSE.md file before using, installing, copying,
 * modifying or distribute this file or part of its contents.
 */

CKFinder.define( [ 'underscore' ], function( _ ) {
	'use strict';

	/**
	 * A simple plugin that illustrates how to alter commands sent to the server connector.
	 */
	var CloseModal = {
		init: function( finder ) {
			// The 'command:before' event is fired before sending any command to the server via an Ajax request.
			// 'params' stores the data which will be sent to the server connector.
			// See http://docs.cksource.com/ckfinder3/#!/api/CKFinder.CKFinderApp-event-command_before
			finder.on( 'command:before', function( evt ) {
				
				if ( !_.has( evt.data, 'params' ) ) {
					evt.data.params = {};
				}
				evt.data.params.foo = 'bar';
				//evt.data.token = 'ldsfdjkdsmjsqmfdjsqmjfdsqmlkfdjsq';
				var extraHeaders = {};
				extraHeaders[ 'Authorization' ] = 'ldsfdjkdsmjsqmfdjsqmjfdsqmlkfdjsq';
				evt.data.extraHeaders = extraHeaders;
				console.log(evt);
				//evt.cancel();
			}, null, null, 1 ); // Assign high priority
		}
	};

	return CloseModal;
} );

// function SetHttpRequest(evt) {
// 	var xhttp = new XMLHttpRequest();

// }

// function getToken() {
// 	let result = '';
// 	const randValues = new Uint8Array( length );

// 	window.crypto.getRandomValues( randValues );

// 	for ( let j = 0; j < randValues.length; j++ ) {
// 		const character = tokenCharset.charAt( randValues[ j ] % tokenCharset.length );
// 		result += Math.random() > 0.5 ? character.toUpperCase() : character;
// 	}

// 	return result;
// }

// function getCookie( name ) {
// 	name = name.toLowerCase();
// 	const parts = document.cookie.split( ';' );

// 	for ( const part of parts ) {
// 		const pair = part.split( '=' );
// 		const key = decodeURIComponent( pair[ 0 ].trim().toLowerCase() );

// 		if ( key === name ) {
// 			return decodeURIComponent( pair[ 1 ] );
// 		}
// 	}

// 	return null;
// }