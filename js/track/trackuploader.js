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
	
	// setup timeout for ajax request
	$.ajaxSetup( {
		timeout: 5000
	} );

	// Setup options for file transfer
	var options = new FileUploadOptions();
	options.fileKey = "gsc_file";
	options.fileName = p_fileEntry.name;
	options.mimeType = "text/plain";
	options.params = {
			method : "track_upload",
			id : (Math.random() * 10000).toFixed(0),
			option : "com_gofgsportstracker",
			task : "jsonrpc.request",
			params : JSON.stringify({
				auth_key: this.m_authKey
			})
	};

	// start transferring the file to the server
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
TrackUploader.prototype.m_idTrack = null; // Authentication key to use when uploading the track

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
	//index.php?option=com_gofgsportstracker&task=jsonrpc.request&method=track_process&id=1000&params={%22auth_key%22:%22g59ssQk5sN%22,%22id_track%22:%22171%22}
	try {
		var response = $.parseJSON( p_fileUploadResult.response );
		
		if( response == null ) {
			throw $.i18n.prop('upload_message_error_generic');
		}
		
		// check for error
		if( response.error ) {
			throw response.error;
		}

		// get track id
		var id_track = response.result;
		console.log( 'id_track: ' + id_track );
		
		// check if we have a valid id for the track
		if( id_track > 0 ) {
			this.m_idTrack = id_track;
			
			// start processing
			this._processFunction({ "result": 0 });
		}
	}
	catch(e) {
		if (typeof this.m_errorCallback === "function") this.m_errorCallback( e );
	}
};

/**
 * handling function for processing the track online
 */
TrackUploader.prototype._processFunction = function(data) {
	console.log('_processFunction');
	
	// prepare request params
	var params = {
			option : "com_gofgsportstracker",
			task : "jsonrpc.request",
			method : "track_process",
			id : (Math.random() * 10000).toFixed(0),
			params : JSON.stringify({
				auth_key: this.m_authKey,
				id_track: this.m_idTrack
			})
	};
	
	// check for errors
	if( data == null ) {
		if (typeof this.m_errorCallback === "function") this.m_errorCallback( $.i18n.prop('upload_message_error_generic') );
	}
	else if( data.error != null ) {
		if (typeof this.m_errorCallback === "function") this.m_errorCallback( data.error );
	}
	// continue processing
	else if( data.result < 100 ) {
		console.log( 'track-process: ' + data.result );

		$.get(TrackUploader.URL, params )
		.done( Utilities.getEvtHandler( this, this._processFunction ) );
	}
	// we are done
	else {
		if (typeof this.m_successCallback === "function") this.m_successCallback();
	}
};
