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
 * Construct a new TrackUploader object and start uploading immediately
 */
function TrackUploader(p_authKey, p_fileEntry, p_successCallback, p_errorCallback) {
	this.m_authKey = p_authKey;
	this.m_successCallback = p_successCallback;
	this.m_errorCallback = p_errorCallback;
	this.m_waypoints = [];

	var options = new FileUploadOptions();
	options.fileKey = "gsc_file";
	options.fileName = p_fileEntry.name;
	options.mimeType = "text/plain";
	options.params = {
			method : "track_upload",
			id : (Math.random() * 10000).toFixed(0),
			option : "com_gofgsportstracker",
			task : "jsonrpc.request",
			params : {
				auth_key: this.m_authKey
			}
	};

	this.m_fileTransfer = new FileTransfer();
	this.m_fileTransfer.upload(
			p_fileEntry.fullPath,
			TrackUploader.URL,
			Utilities.getEvtHandler(this,this._fileTransferSuccess),
			Utilities.getEvtHandler(this,this._fileTransferError),
			options
	);
}

TrackUploader.prototype.m_successCallback = null; // Callback which is called once the track loading has successfully finished
TrackUploader.prototype.m_errorCallback = null; // Callback which is called if there was an error
TrackUploader.prototype.m_authKey = null; // Authentication key to use when uploading the track
TrackUploader.prototype.m_fileTransfer = null;	// reference to FileTransfer object

//TrackUploader.URL = "http://www.gofg.at/index.php"; // Static value which references the upload URL of the gofg homepage
TrackUploader.URL = "http://192.168.56.101/joomla/index.php"; // Static value which references the upload URL of the gofg homepage

/**
 * Error callback for FileTransfer object
 */
TrackUploader.prototype._fileTransferError = function(p_fileTransferError) {
	if (typeof this.m_errorCallback === "function") this.m_errorCallback(p_fileTransferError.code);
};

/**
 * Success callback for FileTransfer object
 */
TrackUploader.prototype._fileTransferSuccess = function(p_fileUploadResult) {
	if (typeof this.m_successCallback === "function") this.m_successCallback();
};
