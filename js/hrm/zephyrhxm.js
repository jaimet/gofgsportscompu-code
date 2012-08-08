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
}

ZephyrHxM.prototype = new HeartRateMonitor(); // Inherhit from HeartRateMonitor class

ZephyrHxM.prototype.m_bluetoothPlugin = null; // Reference to bluetooth-plugin
ZephyrHxM.prototype.m_socketId = null; // Reference to active socket id
ZephyrHxM.prototype.m_dataBuffer = ""; // Buffer for incoming data from ZephyrHxM
ZephyrHxM.prototype.m_name = "Zephyr HxM";
ZephyrHxM.prototype.m_id = 1;
ZephyrHxM.prototype.m_abort = false; // Set to true if an abort is pending

/**
 * Check if this platform offers support for the ZephyrHxM
 */
ZephyrHxM.prototype.isSupported = function() {
	return false;
	
	// Fetch bluetooth plugin
	this.m_bluetoothPlugin = cordova.require('cordova/plugin/bluetooth');

	// Check if all requirements are fulfilled
	if (this.m_bluetoothPlugin === null || !this.m_bluetoothPlugin.isSupported()) return false;

	// Enable bluetooth
	this.m_bluetoothPlugin.enable();

	// Everything went fine
	return true;
};

/**
 * Get a list of available devices for the specific implementation
 * p_successCallback gets passed a list of devices in the form:
 * [ {id: id1, name: name1}, {id: id2, name: name2}, ... ]
 */
ZephyrHxM.prototype.listDevices = function(p_successCallback) {
	// Discover all bluetooth devices
	this.m_bluetoothPlugin.discoverDevices(function(p_devices) {
		var foundDevices = [];

		console.log('Discovered devices (JS): ' + p_devices.length);

		// Cycle through discovered devices and check for HxM devices
		for ( var i = 0; i < p_devices.length; i++) {
			var currDevice = p_devices[i];

			console.log('Found device: ' + currDevice.name);

			// Check if this is a valid HxM device
			if (currDevice.name.indexOf('HXM') === 0) {
				foundDevices.push({
					id : currDevice.address,
					name : currDevice.name
				});
			}
		}

		console.log('Discovered valid devices: ' + foundDevices.length);

		// Send found devices to callback
		if (typeof p_successCallback === 'function') p_successCallback(foundDevices);
	}, Utilities.getEvtHandler(this, this._errorCallback));
};

/**
 * Connect to a given device (and start tracking HeartRateMonitor data)
 * p_deviceId should contain an ID of a device receive from listDevices before
 * p_successCallback gets passed no argument
 */
ZephyrHxM.prototype.connect = function(p_deviceId) {
	var me = this;

	if (this.m_connectId !== null) {
		this._errorCallback('Already connected');
	} else {
		this.m_bluetoothPlugin.getUUIDs(function(p_uuids) {
			// Check if we have at least one endpoint
			if (p_uuids.length < 1) {
				this._errorCallback('No endpoint found');
			}

			// Connect to the given endpoint
			me.m_bluetoothPlugin.connect(function(p_socketid) {
				me.m_connectId = p_deviceId;
				me.m_socketId = p_socketid;
				me.m_dataBuffer = "";
				me.m_abort = false;

				// Start reading from the serial port
				me.m_bluetoothPlugin.read(Utilities.getEvtHandler(me, me._read), Utilities.getEvtHandler(me, me._errorCallback), me.m_socketId);
			}, Utilities.getEvtHandler(me, me._errorCallback), p_deviceId, p_uuids[0]);
		}, Utilities.getEvtHandler(this, this._errorCallback), p_deviceId);
	}
};

/**
 * Called by the bluetooth plugin if reading from the device was successfull
 */
ZephyrHxM.prototype._read = function(p_data) {
	// Check if we should abort reading
	if (this.m_abort) {
		this.m_bluetoothPlugin.disconnect(this.m_socketId);
		this.m_socketId = null;
		this.m_connectId = null;
		this.m_dataBuffer = "";
		this.m_abort = false;
		return;
	}

	// Attach data to internal buffer
	this.m_dataBuffer += p_data;

	// Search for a complete data frame
	var heartrate = 0;
	for ( var i = this.m_dataBuffer.length - 60; i >= 0; i--) {
		// Check for a valid data frame (see ZephyrHxM SDK for details)
		if (this.m_dataBuffer.charCodeAt(i) === 0x02 && // STX
		this.m_dataBuffer.charCodeAt(i + 1) === 0x26 && // MsgID
		this.m_dataBuffer.charCodeAt(i + 2) === 0x37 && // DLC
		this.m_dataBuffer.charCodeAt(i + 59) === 0x03 // ETX
		) {
			// Extract the heartrate from the data frame
			heartrate = this.m_dataBuffer.charCodeAt(i + 12);

			// Remove old data from buffer
			this.m_dataBuffer = this.m_dataBuffer.substring(i + 60);

			break;
		}

	}
	// Continue reading
	this.m_bluetoothPlugin.read(Utilities.getEvtHandler(this, this._read), Utilities.getEvtHandler(this, this._errorCallback), this.m_socketId);

	// Notify callback
	if (heartrate > 0 && typeof this.m_heartRateMonitorCallback === "function") this.m_heartRateMonitorCallback(heartrate);
};

/**
 * Internal error callback
 */
ZephyrHxM.prototype._errorCallback = function(p_error) {
	if (typeof this.m_errorCallback === "function") this.m_errorCallback(p_error);
}

/**
 * Disconnect from a currently connected device
 * NOTE: no argument passed, since the interface supports only one simultaneous connection
 */
ZephyrHxM.prototype.disconnect = function() {
	this.m_abort = true; // Will abort on next read from socket ("soft abort")
};

// Create single instance
new ZephyrHxM();
