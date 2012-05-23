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
 * ZephyrHxM specific implementation of the HeartRateMonitor abstract class
 */
function ZephyrHxM() {
    this.m_bluetoothPlugin = cordova.require('cordova/plugin/bluetooth');

    // Enable bluetooth
    this.m_bluetoothPlugin.enable();
}

ZephyrHxM.prototype = new HeartRateMonitor();   // Inherhit from HeartRateMonitor class

ZephyrHxM.prototype.m_bluetoothPlugin = null;   // Reference to bluetooth-plugin

/**
 * Check if this platform offers support for the ZephyrHxM
 */
ZephyrHxM.prototype.isSupported = function() {
            // Check if all requirements are fulfilled
            if( this.m_bluetoothPlugin !== null && this.m_bluetoothPlugin.isSupported() ) return true;

            return false;
        };

/**
 * Get a list of available devices for the specific implementation
 * p_successCallback gets passed a list of devices in the form:
 * [ {id: id1, name: name1}, {id: id2, name: name2}, ... ]
 * p_errorCallback gets passed an error message
 */
ZephyrHxM.prototype.listDevices = function( p_successCallback, p_errorCallback ) {
            // Discover all bluetooth devices
            this.m_bluetoothPlugin.discoverDevices( function( p_devices ) {
                                                       var foundDevices = [];

                                                       // Cycle through discovered devices and check for HxM devices
                                                       for( var i = 0; i < p_devices.length; i++ ) {
                                                           var currDevice = p_devices[i];

                                                           // Check if this is a valid HxM device
                                                           if( currDevice.name.indexOf( 'HXM' ) === 0 ) {
                                                               foundDevices.put( { id: currDevice.address, name: currDevice.name } );
                                                           }
                                                       }

                                                       // Send found devices to callback
                                                       if( typeof p_successCallback === 'function' ) p_successCallback( foundDevices );
                                                   },
                                                   p_errorCallback );
        };

/**
 * Connect to a given device (and start tracking HeartRateMonitor data)
 * p_deviceId should contain an ID of a device receive from listDevices before
 * p_successCallback gets passed no argument
 * p_errorCallback gets passed an error message
 */
ZephyrHxM.prototype.connect = function( p_successCallback, p_errorCallback, p_deviceId ) {
            var me = this;

            if( this.m_connectId !== null ) {
                if( typeof p_errorCallback === 'function' ) p_errorCallback();
            }
            else {
                this.m_bluetoothPlugin.getUUIDs( function( p_uuids ) {
                                                    // Check if we have at least one endpoint
                                                    if( p_uuids.length < 1 ) {
                                                        if( typeof p_errorCallback === 'function' ) p_errorCallback();
                                                    }

                                                    // Connect to the given endpoint
                                                    me.m_bluetoothPlugin.connect( function( p_socketid ) {
                                                                                     me.m_connectId = p_deviceId;

                                                                                     me.read( me._read, p_errorCallback, p_socketid );

                                                                                     // TODO: Continue here
                                                                                 },
                                                                                 p_errorCallback,
                                                                                 p_deviceId,
                                                                                 p_uuids[0] );
                                                },
                                                p_errorCallback,
                                                p_deviceId );
            }
        };

ZephyrHxM.prototype._read = function( p_data ) {
        };
