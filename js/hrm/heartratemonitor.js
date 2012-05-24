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

/**
 * Base class for a heart-rate monitor
 */
function HeartRateMonitor( p_name ) {
    HeartRateMonitor.m_implementations.push( { name: p_name, object: this } );
}

/**
 * Return all implementations
 */
HeartRateMonitor.getImplementations = function() {
            return m_implementations;
        }

HeartRateMonitor.m_implementations = [];                        // Static storage of all implementations

HeartRateMonitor.prototype.m_connectId = null;                  // Internal variable to handle the currently connected device
HeartRateMonitor.prototype.m_heartRateMonitorCallback = null;   // Storage for hrm-callback
HeartRateMonitor.prototype.m_errorCallback = null;              // Reference to error callback, gets passed a message

/**
 * Check if this device is supported on this platform
 * Should be re-implemented by sub-classes
 * Returns true if supported, else false
 */
HeartRateMonitor.prototype.isSupported = function() {
            return false;
        };

/**
 * Get a list of available devices for the specific implementation
 * p_successCallback gets passed a list of devices in the form:
 * [ {id: id1, name: name1}, {id: id2, name: name2}, ... ]
 * p_errorCallback gets passed an error message
 */
HeartRateMonitor.prototype.listDevices = function( p_successCallback, p_errorCallback ) {};

/**
 * Connect to a given device (and start tracking HeartRateMonitor data)
 * p_deviceId should contain an ID of a device receive from listDevices before
 * p_successCallback gets passed no argument
 * p_errorCallback gets passed an error message
 */
HeartRateMonitor.prototype.connect = function( p_successCallback, p_errorCallback, p_deviceId ) {};

/**
 * Set the callback for new HeartRateMonitor data
 * p_HeartRateMonitorCallback gets passed the new heartrate in beats per minute
 */
HeartRateMonitor.prototype.setCallback = function( p_heartRateMonitorCallback ) {
            this.m_heartRateMonitorCallback = p_heartRateMonitorCallback;
        };

/**
 * Set the callback which gets called if an error occurs
 * p_errorCallback gets passed a string message
 */
HeartRateMonitor.prototype.setErrorCallback = function( p_errorCallback ) {
            this.m_errorCallback = p_errorCallback;
        }

/**
 * Disconnect from a currently connected device
 * NOTE: no argument passed, since the interface supports only one simultaneous connection
 */
HeartRateMonitor.prototype.disconnect = function() {};
