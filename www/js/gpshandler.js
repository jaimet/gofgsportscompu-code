/*
 * Copyright (C) 2011-2014 Wolfgang Koller
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
    m_lastPosition: 0,
    m_distance: 0,
    m_watchId: null, // GPS watch handle
    m_errorCallback: null, // Invoked if there was an error
    m_positionCallback: null, // Invoked if there is a new position available
    m_intervalTimer: null, // interval mode timer handle
    m_fetchRunning: false, // true while a position fetch is running (used for preventing double calls)

    /**
     * Start watching the GPS position
     */
    startGPS: function(p_interval, p_positionCallback, p_errorCallback) {
        // Check if GPSHandler is already active
        if (GPSHandler.m_watchId !== null)
            return;

        if (typeof p_positionCallback === "function")
            GPSHandler.m_positionCallback = p_positionCallback;
        if (typeof p_errorCallback === "function")
            GPSHandler.m_errorCallback = p_errorCallback;

        // continuous mode
        if (p_interval == 0) {
            GPSHandler.m_watchId = navigator.geolocation.watchPosition(GPSHandler._positionUpdate, GPSHandler._positionError, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 5000
            });
        }
        // interval mode
        else {
            // setup interval timer mode
            GPSHandler.m_intervalTimer = window.setInterval("GPSHandler._positionInterval()", p_interval * 1000);

            // initiate position fetching
            GPSHandler._positionInterval();
        }
    },
    /**
     * Stop watching the GPS position
     */
    stopGPS: function() {
        // check for active position watch
        if (GPSHandler.m_watchId != null) {
            navigator.geolocation.clearWatch(GPSHandler.m_watchId);
            GPSHandler.m_watchId = null;
        }
        // check for active interval timer
        if (GPSHandler.m_intervalTimer != null) {
            window.clearInterval(GPSHandler.m_intervalTimer);
            GPSHandler.m_intervalTimer = null;
        }

        GPSHandler.m_fetchRunning = false;
        GPSHandler.m_errorCallback = null;
        GPSHandler.m_positionCallback = null;
    },
    /**
     * Set position callback
     */
    setPositionCallback: function(p_positionCallback) {
        GPSHandler.m_positionCallback = p_positionCallback;
    },
    /**
     * Set the callback for error handling
     */
    setErrorCallback: function(p_errorCallback) {
        GPSHandler.m_errorCallback = p_errorCallback;
    },
    /**
     * Called when the interval for a position fetching is over
     */
    _positionInterval: function() {
        console.log('_positionInterval');

        // check for active fetching
        if (GPSHandler.m_fetchRunning)
            return;
        GPSHandler.m_fetchRunning = true;

        // fetch single position
        navigator.geolocation.getCurrentPosition(GPSHandler._positionUpdate, GPSHandler._positionError, {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 5000
        });
    },
    /**
     * Called by the native side whenever a new position is available
     */
    _positionUpdate: function(p_position) {
        // acknowledge position receipt
        GPSHandler.m_fetchRunning = false;

        // iPhone hack
        if (p_position.coords.speed < 0)
            return;

        // Create separate in-js object for position data since on Android this seems to be read only
        var position = gofg_position.clone(p_position);
        // Force JavaScript timestamp (since on Android this sometimes seems to differ)
        position.timestamp = Utilities.getUnixTimestamp() * 1000;

        // Execute callback (if set)
        if (typeof GPSHandler.m_positionCallback === "function")
            GPSHandler.m_positionCallback(position);
    },
    /**
     * Called by the native side whenever a GPS-Error occurs
     */
    _positionError: function(p_error) {
        console.log('Error occured: ' + p_error.code + ' / ' + p_error.message);

        // Only report error to caller if it isn't a timeout
        if (p_error.code !== PositionError.TIMEOUT) {
            if (typeof GPSHandler.m_errorCallback === "function")
                GPSHandler.m_errorCallback(p_error);
        }
    }
};
