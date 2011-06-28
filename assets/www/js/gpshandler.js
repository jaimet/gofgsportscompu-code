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
	
	startGPS : function( p_interval, p_callback ) {
		GPSHandler.m_settings['interval'] = p_interval;
		if( p_callback ) GPSHandler.m_settings['positionUpdated'] = p_callback;
		
		GPSHandler._updatePosition();
	},
	
	stopGPS : function() {
		clearTimeout( GPSHandler.m_timerReference );
		GPSHandler.m_settings['positionUpdated'] = function() {};
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
	
	_updatePosition : function() {
		navigator.geolocation.getCurrentPosition( GPSHandler._positionUpdate, GPSHandler._positionError, { enableHighAccuracy: true } );

		GPSHandler.m_timerReference = setTimeout( "GPSHandler._updatePosition()", GPSHandler.m_settings['interval'] * 1000 );
	},
	
	_positionUpdate : function( p_position ) {
		if( GPSHandler.m_lastPosition == 0 ) {
			GPSHandler.m_lastPosition = p_position;
			return;
		}
		
		//p_position.coords.latitude = GPSHandler.m_lastPosition.coords.latitude + 1.0;
		
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
