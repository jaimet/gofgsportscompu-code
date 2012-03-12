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
    // Create default zoom location (vienna)
    pages.map.m_vienna = new L.LatLng(48.208889, 16.3725);
}
Map.prototype = new Page( 'map' );

Map.prototype.track_map = null;
Map.prototype.track_line = null;
Map.prototype.m_vienna = null;
Map.prototype.m_waypoints = [];
Map.prototype.leftPage = "summary.html";

Map.prototype.oninit = function() {
            $( '#map-page' ).live( 'pageshow', pages.map.getEvtHandler(pages.map.initMap) );
        }

/**
 * Called whenever the map is shown (which initialized the map & updates the display)
 */
Map.prototype.initMap = function() {
            if( pages.map.track_map == null ) {
                // Calculate and setup track height
                var track_height = $(window).height();
                track_height -= $('#map-page > [data-role="header"]').outerHeight( true );
                track_height -= ($( '#map-page > [data-role="content"]' ).outerHeight( true ) - $( '#map-page > [data-role="content"]' ).height());
                track_height -= $('#map-page_pager').outerHeight( true );
                $( '#track_map' ).height( track_height );

                pages.map.track_map = new L.Map( 'track_map', { attributionControl: false } );

                var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
                var osm = new L.TileLayer(osmUrl, {maxZoom: 18});
                pages.map.track_map.addLayer( osm );

                // Add track layer
                if( pages.map.track_line !== null ) {
                    pages.map.track_map.addLayer( pages.map.track_line );
                }
            }

            // Zoom the map according to either default or the track layer
            if( pages.map.track_line !== null && pages.map.track_line.getLatLngs().length > 2 ) {
                pages.map.track_map.fitBounds( new L.LatLngBounds(pages.map.track_line.getLatLngs()) );
            }
            else {
                pages.map.track_map.setView(pages.map.m_vienna, 13);
            }
        }

/**
 * Event handler for new waypoint entries
 */
Map.prototype.waypoint = function( p_waypoint ) {
            //console.log( 'waypoint-coords: '+ pages.map.m_waypoints.length + " / " + p_waypoint.m_position.coords.latitude + " / " + p_waypoint.m_position.coords.longitude );
            console.log( 'waypoint-coords: ' + p_waypoint.m_position.coords.longitude );

            var latLng = new L.LatLng( p_waypoint.m_position.coords.latitude, p_waypoint.m_position.coords.longitude );

            // Add waypoint to list
            pages.map.m_waypoints.push( latLng );

            // Update waypoints
            //pages.map.track_line.setLatLngs( pages.map.m_waypoints );

            if( pages.map.track_map !== null && $( '#map-page' ).is( ':visible' ) ) {
                // Zoom in to new waypoint
                pages.map.track_map.setView(latLng, pages.map.track_map.getMaxZoom() );
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
            pages.map.track_line = new L.Polyline(pages.map.m_waypoints, {color: 'red'});

            if( pages.map.track_map !== null ) {
                pages.map.track_map.addLayer( pages.map.track_line );
            }
        }

/**
 * Event handler for end track
 */
Map.prototype.endtrack = function() {
            // Check if map is initialized
            if( pages.map.track_map !== null && $( '#map-page' ).is( ':visible' ) ) {
                // Zoom to fit the whole track
                pages.map.track_map.fitBounds( new L.LatLngBounds(pages.map.track_line.getLatLngs()) );
            }
        }

new Map();		// Create single instance
