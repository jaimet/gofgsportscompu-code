/*
 * Copyright (C) 2011 Wolfgang Koller
 * 
 * This file is part of GOFG Sports Computer - http://www.gofg.at/.
 * 
 * GOFG Sports Computer is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * GOFG Sports Computer is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with GOFG Sports Computer.  If not, see <http://www.gnu.org/licenses/>.
 */

function Map() {
	$(document).bind( 'thwaypoint', pages.map.waypoint );
}
Map.prototype = new Page( 'map' );

Map.prototype.track_map = null;
Map.prototype.track_points = [];
Map.prototype.track_line = null;

Map.prototype.oncreate = function() {
	$( '#map-page' ).live( 'pageshow', pages.map.getEvtHandler(pages.map.initMap) );
}

Map.prototype.initMap = function() {
	if( pages.map.track_map == null ) {
		pages.map.track_map = new L.Map( 'track_map' );

		var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
	    osmAttrib = 'Map data &copy; 2011 OpenStreetMap contributors',
	    osm = new L.TileLayer(osmUrl, {maxZoom: 18, attribution: osmAttrib});
		
		var vienna = new L.LatLng(48.208889, 16.3725);
		pages.map.track_map.addLayer( osm );
		pages.map.track_map.setView(vienna, 13);
	}

	if( pages.map.track_line != null ) {
		pages.map.track_map.removeLayer( pages.map.track_line );
	}
	
	// Check if we have at least two track_points
	if( pages.map.track_points.length < 2 ) return;
	
	pages.map.track_line = new L.Polyline( pages.map.track_points, {color: 'red'} );
	pages.map.track_map.fitBounds( new L.LatLngBounds(pages.map.track_points) );
	pages.map.track_map.addLayer( pages.map.track_line );
}

Map.prototype.waypoint = function( evt, p_waypoint ) {
	console.log( 'Map.prototype.waypoint' );
	
	pages.map.track_points.push( new L.LatLng( GPSHandler._toDegree(p_waypoint.gps.lat), GPSHandler._toDegree(p_waypoint.gps.lon) ) );
}

new Map();		// Create single instance

/*
// Check if the pages namespace exists
if( pages == undefined ) {
	var pages = {};
}

pages.map = {
		olmap : null,
		oloverlay : null,
		epsg4326 : new OpenLayers.Projection("EPSG:4326"),
		epsg900913 : new OpenLayers.Projection("EPSG:900913"),
		minCorner : new OpenLayers.LonLat(180,90),
		maxCorner : new OpenLayers.LonLat(-180,-90),
		pointsList : new Array(),
		lastTimestamp : null,
		
		init : function() {
			console.log( "map-page loaded!" );
			
			// Translate page
			Translator.register( $('#map-page') );
			
			// Bind to new waypoint event (it is a global event)
			$(document).bind( 'thwaypoint', pages.map.waypoint );
			
			// Create openlayers map
			pages.map.olmap = new OpenLayers.Map({
				div: "ol_map",
				theme: null,
				controls: [
				    new OpenLayers.Control.Attribution(),
				    new OpenLayers.Control.TouchNavigation({
				    	dragPanOptions: {
				    		enableKinetic: true
				    	}
				    }),
				    new OpenLayers.Control.ZoomPanel()
				],
				layers: [
				    new OpenLayers.Layer.OSM( "OpenStreetMap", null, { transitionEffect: 'resize' } )
				],
//				center: new OpenLayers.LonLat( 16.29, 48.26 ).transform(new OpenLayers.Projection("EPSG:4326"),new OpenLayers.Projection("EPSG:900913")),
//				zoom: 5
			});
			
			pages.map.oloverlay = new OpenLayers.Layer.Vector( "gofgsctrack" );
			pages.map.olmap.addLayer(pages.map.oloverlay);
			
			console.log( "Map units: " + pages.map.olmap.getUnits() );
			console.log( "Map projection: " + pages.map.olmap.getProjection() );
			
			$( '#map-page' ).live( 'pagebeforeshow', pages.map._pagebeforeshow );
		},
		
		waypoint : function( evt, p_waypoint ) {
			if( pages.map.lastTimestamp != null && pages.map.lastTimestamp > (p_waypoint.timestamp - 10) ) {
				return;
			}
			pages.map.lastTimestamp = p_waypoint.timestamp;
			
			var lonDeg = GPSHandler._toDegree( p_waypoint.gps.lon );
			var latDeg = GPSHandler._toDegree( p_waypoint.gps.lat );
			
			if( lonDeg < pages.map.minCorner.lon ) pages.map.minCorner.lon = lonDeg;
			if( latDeg < pages.map.minCorner.lat ) pages.map.minCorner.lat = latDeg;
			if( lonDeg > pages.map.maxCorner.lon ) pages.map.maxCorner.lon = lonDeg;
			if( latDeg > pages.map.maxCorner.lat ) pages.map.maxCorner.lat = latDeg;
			
			var olLonLat = new OpenLayers.LonLat( lonDeg, latDeg ).transform(pages.map.epsg4326,pages.map.epsg900913);
			pages.map.pointsList[pages.map.pointsList.length] = new OpenLayers.Geometry.Point( olLonLat.lon, olLonLat.lat );
		},
		
		_pagebeforeshow : function() {
			console.log( "Min-Corner: " + pages.map.minCorner.lon + " / " + pages.map.minCorner.lat );
			console.log( "Max-Corner: " + pages.map.maxCorner.lon + " / " + pages.map.maxCorner.lat );
			
			pages.map.oloverlay.removeAllFeatures();
			pages.map.oloverlay.addFeatures( [new OpenLayers.Feature.Vector(new OpenLayers.Geometry.LineString(pages.map.pointsList))] );
			
			var bounds = new OpenLayers.Bounds();
			bounds.extend(pages.map.minCorner.clone().transform(pages.map.epsg4326,pages.map.epsg900913));
			bounds.extend(pages.map.maxCorner.clone().transform(pages.map.epsg4326,pages.map.epsg900913));
			pages.map.olmap.zoomToExtent(bounds);
		},
};
*/