/*
 * Copyright (C) 2011-2012 Wolfgang Koller
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

/**
 * Object for handling gps data (distances, heading, accuracy, etc.)
 * Note: uses the geolocation API defined in HTML5
 */
var GPSHandler = {
    m_settings : {
        'minAccuracy' : 20,
        'positionUpdated' : function() {},
        'interval' : 10,
        'maximumAge' : 1
    },

    m_lastPosition : 0,
    m_distance : 0,

    m_watchId : null,
    m_errorCallback : null,         // Invoked if there was an error
    m_positionCallback : null,      // Invoked if there is a new position available
    m_interval : 10,                // Interval for GPS watching (in seconds)


    /**
     * Start watching the GPS position
     */
    startGPS : function( p_interval, p_positionCallback, p_errorCallback ) {
                   // Check if GPSHandler is already active
                   if( GPSHandler.m_watchId !== null ) return;

                   GPSHandler.m_interval = p_interval;
                   if( typeof p_positionCallback === "function" ) GPSHandler.m_positionCallback = p_positionCallback;
                   if( typeof p_errorCallback === "function" ) GPSHandler.m_errorCallback = p_errorCallback;

                   GPSHandler.m_watchId = navigator.geolocation.watchPosition( GPSHandler._positionUpdate, GPSHandler._positionError, { enableHighAccuracy : true, timeout : GPSHandler.m_interval * 1000, maximumAge : 1000 } );
               },

    /**
     * Stop watching the GPS position
     */
    stopGPS : function() {
                  navigator.geolocation.clearWatch( GPSHandler.m_watchId );
                  GPSHandler.m_watchId = null;
                  GPSHandler.m_errorCallback = null;
                  GPSHandler.m_positionCallback = null;
                  GPSHandler.m_interval = 10;
              },

    /**
     * Set position callback
     */
    setPositionCallback : function( p_positionCallback ) {
                              GPSHandler.m_positionCallback = p_positionCallback;
                  },

    /**
     * Set the callback for error handling
     */
    setErrorCallback : function( p_errorCallback ) {
                           GPSHandler.m_errorCallback = p_errorCallback;
                       },

/*    getDistance : function() {
                      return GPSHandler.m_distance;
                  },

    getAltitude : function() {
                      return GPSHandler.m_lastPosition.coords.altitude;
                  },

    getSpeed : function() {
                   return GPSHandler.m_lastPosition.coords.speed;
               },

    getLatitude : function() {
                      return GPSHandler._toRad( GPSHandler.m_lastPosition.coords.latitude );
                  },

    getLongitude : function() {
                       return GPSHandler._toRad( GPSHandler.m_lastPosition.coords.longitude );
                   },

    getAltitude : function() {
                      return GPSHandler.m_lastPosition.coords.altitude;
                  },

    getAccuracy : function() {
                      return GPSHandler.m_lastPosition.coords.accuracy;
                  },

    getAltitudeAccuracy : function() {
                              return GPSHandler.m_lastPosition.coords.altitudeAccuracy;
                          },*/

    /**
     * Called by the native side whenever a new position is available
     */
    _positionUpdate : function( p_position ) {
                          //if( p_position.coords.accuracy > SettingsHandler.get( 'minimumaccuracy' ) ) return;
                          // iPhone hack
                          if( p_position.coords.speed < 0 ) return;
                          
                          // Force JavaScript timestamp (since on Android this sometimes seems to differ)
                          p_position.timestamp = Utilities.getUnixTimestamp() * 1000;

                          if( typeof GPSHandler.m_positionCallback === "function" ) GPSHandler.m_positionCallback( p_position );

                          /*if( GPSHandler.m_lastPosition == 0 ) {
                              GPSHandler.m_lastPosition = p_position;
                              GPSHandler.m_settings['positionUpdated']();
                              return;
                          }

                          // Calculate distance between last and current position
                          var distance = GPSHandler._haversineDistance( GPSHandler.m_lastPosition.coords, p_position.coords );

                          if( distance > GPSHandler.m_lastPosition.coords.accuracy ) {
                              GPSHandler.m_distance = distance;
                              GPSHandler.m_lastPosition = p_position;

                              GPSHandler.m_settings['positionUpdated']( p_position );
                          }*/
                      },

    /**
     * Called by the native side whenever a GPS-Error occurs
     */
    _positionError : function( p_error ) {
                         // Only report error to caller if it isn't a timeout
                         if( p_error.code !== PositionError.TIMEOUT ) {
                             if( typeof GPSHandler.m_errorCallback === "function" ) GPSHandler.m_errorCallback( p_error );
                         }
                     },

    /*_haversineDistance : function( p_start, p_end ) {
                             var latDiff = GPSHandler._toRad( p_end.latitude - p_start.latitude );
                             var lonDiff = GPSHandler._toRad( p_end.longitude - p_start.longitude );

                             var h = Math.pow( Math.sin( latDiff / 2.0 ), 2 ) + Math.cos( GPSHandler._toRad(p_start.latitude) ) * Math.cos( GPSHandler._toRad(p_end.latitude) ) * Math.pow( Math.sin(lonDiff) / 2.0, 2 );
                             var distance = 2.0 * 6371009 * Math.asin( Math.sqrt(h) );

                             return distance;
                         },
    
    _toRad : function( p_degree ) {
                 return p_degree / 180.0 * Math.PI;
             },
    
    _toDegree : function( p_rad ) {
                    return p_rad / Math.PI * 180.0;
                }*/
};
