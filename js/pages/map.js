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
    // Create openlayers projections
    pages.map.m_ggProjection = new OpenLayers.Projection("EPSG:4326");
    pages.map.m_smProjection = new OpenLayers.Projection("EPSG:900913");

    // Create default zoom location (vienna)
    pages.map.m_vienna = new OpenLayers.LonLat(16.3725, 48.208889);
}
Map.prototype = new Page( 'map' );

Map.prototype.track_map = null;
Map.prototype.track_line = null;
Map.prototype.m_vienna = null;
Map.prototype.m_waypoints = [];
Map.prototype.leftPage = "summary.html";
Map.prototype.m_closeZoom = 0;
Map.prototype.m_ggProjection = null;
Map.prototype.m_smProjection = null;
Map.prototype.m_lineString = null;

Map.prototype.oninit = function() {
            $( '#map-page' ).live( 'pageshow', pages.map.getEvtHandler(pages.map.initMap) );
        }

/**
 * Called whenever the map is shown (which initialized the map & updates the display)
 */
Map.prototype.initMap = function() {
            if( pages.map.track_map === null ) {
                // Calculate and setup track height
                var track_height = $(window).height();
                track_height -= $('#map-page > [data-role="header"]').outerHeight( true );
                track_height -= ($( '#map-page > [data-role="content"]' ).outerHeight( true ) - $( '#map-page > [data-role="content"]' ).height());
                track_height -= $('#map-page_pager').outerHeight( true );
                $( '#track_map' ).height( track_height );

                pages.map.track_map = new OpenLayers.Map({
                                                 div: "track_map",
                                                 theme: null,
                                                 numZoomLevels: 18,
                                                 projection: pages.map.m_smProjection,
                                                 controls: [
                                                     new OpenLayers.Control.TouchNavigation({
                                                         dragPanOptions: {
                                                             enableKinetic: true
                                                         }
                                                     }),
                                                     new OpenLayers.Control.Zoom(),
                                                 ],
                                                 layers: [
                                                     new OpenLayers.Layer.OSM("OpenStreetMap", null, {
                                                         transitionEffect: 'resize'
                                                     }),
                                                 ],
                                                 center: new OpenLayers.LonLat(0, 0),
                                                 zoom: 5
                                             });
                // Add track layer
                if( pages.map.track_line !== null ) {
                    pages.map.track_map.addLayer( pages.map.track_line );
                }

                // Calculate closeZoom (used when viewing the map during tracking)
                pages.map.m_closeZoom =  parseInt( pages.map.track_map.getNumZoomLevels() * 0.75 );
            }

            // Zoom the map according to either default or the track layer
            if( pages.map.track_line !== null && pages.map.m_waypoints.length > 2 ) {
                pages.map.track_map.zoomToExtent( pages.map.m_lineString.getBounds(), true );
            }
            else {
                // Zoom to the center of vienna
                pages.map.track_map.setCenter(
                            pages.map.m_vienna.transform(
                                pages.map.m_ggProjection,
                                pages.map.m_smProjection),
                            pages.map.m_closeZoom,
                            true,
                            true
                            );
            }
        }

/**
 * Event handler for new waypoint entries
 */
Map.prototype.waypoint = function( p_waypoint ) {
            var point = new OpenLayers.Geometry.Point( p_waypoint.m_position.coords.longitude, p_waypoint.m_position.coords.latitude );
            point = point.transform( pages.map.m_ggProjection, pages.map.m_smProjection );
            var latLng = new OpenLayers.LonLat( p_waypoint.m_position.coords.longitude, p_waypoint.m_position.coords.latitude );
            latLng = latLng.transform( pages.map.m_ggProjection, pages.map.m_smProjection );

            // Add waypoint to list
            pages.map.m_waypoints.push( point );
            pages.map.m_lineString.addPoint(point);

            if( pages.map.track_map !== null && $( '#map-page' ).is( ':visible' ) ) {
                // Zoom in to new waypoint
                pages.map.track_line.redraw();
                pages.map.track_map.setCenter(latLng, pages.map.m_closeZoom, true, true );
            }
        }

/**
 * Event handler for new track
 */
Map.prototype.newtrack = function() {
            // Remove old layer (if there is any)
            if( pages.map.track_line !== null && pages.map.track_map !== null ) {
                pages.map.track_map.removeLayer(pages.map.track_line);
            }

            // Create new layer
            pages.map.m_waypoints = [];
            pages.map.track_line = new OpenLayers.Layer.Vector("Track Layer");
            //create a polyline feature from the array of points
            var style_red = {strokeColor: "#FF0000", strokeOpacity: 0.5, strokeWidth: 6};
            pages.map.m_lineString = new OpenLayers.Geometry.LineString(pages.map.m_waypoints);
            var trackFeature = new OpenLayers.Feature.Vector(pages.map.m_lineString, null, style_red);
            pages.map.track_line.addFeatures([trackFeature]);

            if( pages.map.track_map !== null ) {
                pages.map.track_map.addLayer( pages.map.track_line );
            }
        }

/**
 * Event handler for end track
 */
Map.prototype.endtrack = function() {
        }

new Map();		// Create single instance
