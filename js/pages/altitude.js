/*
 * Copyright (C) 2012 Wolfgang Koller
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

function Altitude() {
}
Altitude.prototype = new Page( 'altitude' );

Altitude.prototype.leftPage = "map.html";
Altitude.prototype.m_chart = null;
Altitude.prototype.m_values = [];
Altitude.prototype.m_currentDistance = 0.0;

Altitude.prototype.oninit = function() {
            $( '#altitude-page' ).live( 'pageshow', Utilities.getEvtHandler(pages.altitude, pages.altitude.initChart) );
        }

/**
 * Called whenever the chart is shown (which initialized the chart & updates the display)
 */
Altitude.prototype.initChart = function() {
            if( pages.altitude.m_chart === null ) {
                // Calculate and setup chart height
                var chart_height = $(window).height();
                chart_height -= $('#altitude-page > [data-role="header"]').outerHeight( true );
                chart_height -= ($( '#altitude-page > [data-role="content"]' ).outerHeight( true ) - $( '#altitude-page > [data-role="content"]' ).height());
                chart_height -= $('#altitude-page_pager').outerHeight( true );
                $( '#altitude-page_graph' ).height( chart_height );

                pages.altitude.m_chart = $.jqplot(
                            'altitude-page_graph',
                            [pages.altitude.m_values],
                            {
                                seriesDefaults: {showMarker:false},
                                axesDefaults: {pad:1.0},
                                axes: {
                                    xaxis: {
                                        label: 'km'
                                    },
                                    yaxis: {
                                        label: 'm'
                                    }
                                }
                            }
                            );
            }

            pages.altitude.m_chart.series[0].data = pages.altitude.m_values;
            pages.altitude.m_chart.replot({resetAxes:true});
        }

Altitude.prototype.newtrack = function() {
            pages.altitude.m_values = [];
            pages.altitude.m_currentDistance = 0.0;
        }

Altitude.prototype.waypoint = function( p_waypoint ) {
            pages.altitude.m_currentDistance += parseFloat(p_waypoint.m_distance / 1000.0);
            var alt = parseFloat(p_waypoint.m_position.coords.altitude);

            pages.altitude.m_values.push( [pages.altitude.m_currentDistance, alt] );

            if( pages.altitude.m_chart !== null && $( '#altitude-page' ).is( ':visible' ) ) {
                pages.altitude.m_chart.series[0].data = pages.altitude.m_values;
                pages.altitude.m_chart.replot({resetAxes:true});
            }
        }

Altitude.prototype.endtrack = function() {
        }

new Altitude();

/**
 * Event handler for new waypoint entries

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

Map.prototype.endtrack = function() {
        }

new Map();		// Create single instance
*/
