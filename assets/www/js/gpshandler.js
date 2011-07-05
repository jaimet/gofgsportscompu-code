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

/**
 * jQuery plugin for handling gps data (distances, heading, accuracy, etc.)
 * Note: uses the geolocation API defined in HTML5
 */
var GPSHandler = {
	m_settings : {
		'minAccuracy' : 20,
		'positionUpdated' : function() {},
		'interval' : 1
	},
	
	m_lastPosition : 0,
	m_distance : 0,
	m_timerReference : 0,
	m_watchId : null,
	m_minAccuracy : 0,
	
	startGPS : function( p_interval, p_callback ) {
		if( GPSHandler.m_watchId != null ) return;
		
		GPSHandler.m_settings['interval'] = p_interval;
		if( p_callback ) GPSHandler.m_settings['positionUpdated'] = p_callback;
		
		GPSHandler.m_watchId = navigator.geolocation.watchPosition( GPSHandler._positionUpdate, GPSHandler._positionError, { enableHighAccuracy : true, timeout : GPSHandler.m_settings['interval'] * 1000, maximumAge : GPSHandler.m_settings['interval'] * 1000 } );
	},
	
	stopGPS : function() {
		//clearTimeout( GPSHandler.m_timerReference );
		navigator.geolocation.clearWatch( GPSHandler.m_watchId );
		GPSHandler.m_settings['positionUpdated'] = function() {};
		GPSHandler.m_watchId = null;
	},
	
	getDistance : function() {
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
	
	_positionUpdate : function( p_position ) {
		if( p_position.coords.accuracy > SettingsHandler.get( 'minimumaccuracy' ) ) return;
		
		if( GPSHandler.m_lastPosition == 0 ) {
			GPSHandler.m_lastPosition = p_position;
			return;
		}
		
		var distance = GPSHandler._haversineDistance( GPSHandler.m_lastPosition.coords, p_position.coords );
		
		if( distance > GPSHandler.m_lastPosition.coords.accuracy ) {
			GPSHandler.m_distance = distance;
			GPSHandler.m_lastPosition = p_position;
			
			GPSHandler.m_settings['positionUpdated']();
		}
	},
	
	_positionError : function( p_error ) {
	},
	
    _haversineDistance : function( p_start, p_end ) {
   		var latDiff = GPSHandler._toRad( p_end.latitude - p_start.latitude );
   		var lonDiff = GPSHandler._toRad( p_end.longitude - p_start.longitude );
   		
   		var h = Math.pow( Math.sin( latDiff / 2.0 ), 2 ) + Math.cos( GPSHandler._toRad(p_start.latitude) ) * Math.cos( GPSHandler._toRad(p_end.latitude) ) * Math.pow( Math.sin(lonDiff) / 2.0, 2 );
   		var distance = 2.0 * 6371009 * Math.asin( Math.sqrt(h) );
   		
   		return distance;
    },
    
    _toRad : function( p_degree ) {
    	return p_degree / 180.0 * Math.PI;
    }
};