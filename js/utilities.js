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

function Utilities() {}

/**
 * Create a wrapped function for maintaining the original context when invoking a callback
 */
Utilities.getEvtHandler = function( p_context, p_callback ) {
            // Prepare context & arguments for callback
            var me = p_context;
            var p_arguments = Array.prototype.slice.call(arguments, 2);

            // Create wrapper function as event handler
            return (function() {
                        p_callback.apply(me, p_arguments.concat(arguments))
                    } );
        }

/**
 * Convert a passed degree value to rad
 */
Utilities.toRad = function( p_degree ) {
            return p_degree / 180.0 * Math.PI;
        }

/**
 * Convert a passed rad value to degree
 */
Utilities.toDegree = function( p_rad ) {
            return p_rad / Math.PI * 180.0;
        }

/**
 * Calculate the distance between two coordinates based on the haversine formula
 */
Utilities.haversineDistance = function( p_startCoordinates, p_endCoordinates ) {
            var latDiff = Utilities.toRad( p_endCoordinates.latitude - p_startCoordinates.latitude );
            var lonDiff = Utilities.toRad( p_endCoordinates.longitude - p_startCoordinates.longitude );

            var h = Math.pow( Math.sin( latDiff / 2.0 ), 2 ) + Math.cos( Utilities.toRad(p_startCoordinates.latitude) ) * Math.cos( Utilities.toRad(p_endCoordinates.latitude) ) * Math.pow( Math.sin(lonDiff) / 2.0, 2 );
            var distance = 2.0 * 6371009 * Math.asin( Math.sqrt(h) );

            return distance;
        }

/**
 * Return current time as unix-timestamp
 */
Utilities.getUnixTimestamp = function() {
            return ((new Date()).getTime() / 1000).toFixed(0);
        }
