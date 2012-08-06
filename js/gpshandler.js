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
		'positionUpdated' : function() {
		},
		'interval' : 10,
		'maximumAge' : 1
	},

	m_lastPosition : 0,
	m_distance : 0,

	m_watchId : null,
	m_errorCallback : null, // Invoked if there was an error
	m_positionCallback : null, // Invoked if there is a new position available
	m_interval : 10, // Interval for GPS watching (in seconds)

	/**
	 * Start watching the GPS position
	 */
	startGPS : function(p_interval, p_positionCallback, p_errorCallback) {
		// Check if GPSHandler is already active
		if (GPSHandler.m_watchId !== null) return;

		GPSHandler.m_interval = p_interval;
		if (typeof p_positionCallback === "function") GPSHandler.m_positionCallback = p_positionCallback;
		if (typeof p_errorCallback === "function") GPSHandler.m_errorCallback = p_errorCallback;

		GPSHandler.m_watchId = navigator.geolocation.watchPosition(GPSHandler._positionUpdate, GPSHandler._positionError, {
			enableHighAccuracy : true,
			timeout : GPSHandler.m_interval * 1000,
			maximumAge : 1000
		});
	},

	/**
	 * Stop watching the GPS position
	 */
	stopGPS : function() {
		navigator.geolocation.clearWatch(GPSHandler.m_watchId);
		GPSHandler.m_watchId = null;
		GPSHandler.m_errorCallback = null;
		GPSHandler.m_positionCallback = null;
		GPSHandler.m_interval = 10;
	},

	/**
	 * Set position callback
	 */
	setPositionCallback : function(p_positionCallback) {
		GPSHandler.m_positionCallback = p_positionCallback;
	},

	/**
	 * Set the callback for error handling
	 */
	setErrorCallback : function(p_errorCallback) {
		GPSHandler.m_errorCallback = p_errorCallback;
	},

	/**
	 * Called by the native side whenever a new position is available
	 */
	_positionUpdate : function(p_position) {
		// iPhone hack
		if (p_position.coords.speed < 0) return;
		
		// Create separate in-js object for position data since on Android this seems to be read only
		var position = {
				coords: {
					latitude: p_position.coords.latitude,
					longitude: p_position.coords.longitude,
					altitude: p_position.coords.altitude,
					accuracy: p_position.coords.accuracy,
					altitudeAccuracy: p_position.coords.altitudeAccuracy,
					heading: p_position.coords.heading,
					speed: p_position.coords.speed
				},
				timestamp: Utilities.getUnixTimestamp() * 1000	// Force JavaScript timestamp (since on Android this sometimes seems to differ)
		};

		// Execute callback (if set)
		if (typeof GPSHandler.m_positionCallback === "function") GPSHandler.m_positionCallback(position);
	},

	/**
	 * Called by the native side whenever a GPS-Error occurs
	 */
	_positionError : function(p_error) {
		// Only report error to caller if it isn't a timeout
		if (p_error.code !== PositionError.TIMEOUT) {
			if (typeof GPSHandler.m_errorCallback === "function") GPSHandler.m_errorCallback(p_error);
		}
	}
};
