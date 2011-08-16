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

// Check if the pages namespace exists
if( pages == undefined ) {
	var pages = {};
}

pages.map = {
		olmap : null,
		oloverlay : null,
		
		init : function() {
			console.log( "map-page loaded!" );
			
			// Translate page
			GOFGSportsComputer._translate( $('#map-page') );
			
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
				center: new OpenLayers.LonLat( 48.26, 16.29 ).transform(new OpenLayers.Projection("EPSG:4326"),new OpenLayers.Projection("EPSG:900913")),
				zoom: 5
			});
			
			pages.map.oloverlay = new OpenLayers.Layer.Vector( "gofgsctrack" );
			pages.map.olmap.addLayer(pages.map.oloverlay);
			
		},
};
