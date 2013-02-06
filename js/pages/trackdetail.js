/*
 * Copyright (C) 2012-2013 Wolfgang Koller
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

function Trackdetail() {
}
Trackdetail.prototype = new Page("trackdetail");
Trackdetail.prototype.m_fileEntry = null;
Trackdetail.prototype.m_displayName = null;
Trackdetail.prototype.m_bInHistory = false;

// Register button event
Trackdetail.prototype.oninit = function() {
	$('#trackdetail-page').live('pagebeforeshow', pages.trackdetail._pagebeforeshow);
	$('#trackdetail-delete-button').live('click', pages.trackdetail._deleteTrack);
	$('#trackdetail-load-button').live('click', pages.trackdetail._loadTrack);
	$('#trackdetail-export-fitlog-button').live('click', pages.trackdetail._exportTrackFitlog);
	$('#trackdetail-export-gpx-button').live('click', pages.trackdetail._exportTrackGPX);
	$('#trackdetail-export-tcx-button').live('click', pages.trackdetail._exportTrackTCX);
	$('#trackdetail-upload-button').live('click', pages.trackdetail._uploadTrack);
}

/**
 * Called by the Tracks-page in order to notify the page of the selected track
 */
Trackdetail.prototype.setTrack = function(p_fileEntry, p_displayName) {
	// Store file information
	pages.trackdetail.m_fileEntry = p_fileEntry;
	pages.trackdetail.m_displayName = p_displayName;
}

/**
 * Called just before the page is shown (to setup buttons etc.)
 */
Trackdetail.prototype._pagebeforeshow = function() {
	// Load track details
	$('#trackdetail-title').html(pages.trackdetail.m_displayName);
}

/**
 * Delete the currently displayed track (and return to overview on success)
 */
Trackdetail.prototype._deleteTrack = function() {
	MsgBox.confirm($.i18n.prop('delete_message'), function(p_button) {
		if (p_button === MsgBox.BUTTON_YES) {
			pages.trackdetail.m_fileEntry.remove(function() {
				$.mobile.changePage('tracks.html');
			});
		}
	});
}

/**
 * Called when the user wants to load a track
 */
Trackdetail.prototype._loadTrack = function() {
	$.mobile.loading( 'show' );

	pages.summary.loadTrack(pages.trackdetail.m_fileEntry);
};

/**
 * Called when the user wants to export a track to fitlog
 */
Trackdetail.prototype._exportTrackFitlog = function() {
	// Show loading & start exporting
	$.mobile.loading('show', {text: $.i18n.prop("export_message")});
	exporter.fitlog.run(pages.trackdetail.m_fileEntry, function() {
		$.mobile.loading('hide');
	});
};

/**
 * Called when the user wants to export a track to GPX
 */
Trackdetail.prototype._exportTrackGPX = function() {
	// Show loading & start exporting
	$.mobile.loading('show', {text: $.i18n.prop("export_message")});
	exporter.gpx.run(pages.trackdetail.m_fileEntry, function() {
		$.mobile.loading('hide');
	});
};

/**
 * Called when the user wants to export a track to TCX
 */
Trackdetail.prototype._exportTrackTCX = function() {
	// Show loading & start exporting
	$.mobile.loading('show', {text: $.i18n.prop("export_message")});
	exporter.tcx.run(pages.trackdetail.m_fileEntry, function() {
		$.mobile.loading('hide');
	});
};

/**
 * Called when the user wants to upload a track
 */
Trackdetail.prototype._uploadTrack = function() {
	// Check if user has an authentication-key set
	if (SettingsHandler.get('authkey') === "") {
		MsgBox.show($.i18n.prop('upload_message_key_missing'));
		return;
	}

	// Check if user already agreed to the uploading conditions
	if (SettingsHandler.getInt('uploadagree_3') === 0) {
		MsgBox.confirmAlways($.i18n.prop('upload_message_agree'), function(p_button) {
			// Check if confirm counts for always
			if (p_button === MsgBox.BUTTON_YES || p_button === MsgBox.BUTTON_ALWAYS) {
				if (p_button === MsgBox.BUTTON_ALWAYS) {
					SettingsHandler.set('uploadagree_3', 1);
					SettingsHandler._save();
				}

				pages.trackdetail._doUploadTrack();
			}
		});
	} else {
		pages.trackdetail._doUploadTrack();
	}
};

/**
 * Upload the track
 */
Trackdetail.prototype._doUploadTrack = function() {
	// Show loading & start uploading
	$.mobile.loading('show', {text: $.i18n.prop("upload_message")});

	var tu = new TrackUploader(SettingsHandler.get('authkey'), pages.trackdetail.m_fileEntry, function(p_id_track) {
		$.mobile.loading('hide');
		
        // fetch localStorage entry for already uploaded tracks
        window.localStorage.setItem("uploadedTracks_" + pages.trackdetail.m_fileEntry.name, true);
		
		// show success message
		MsgBox.show($.i18n.prop("upload_message_success"), '', MsgBox.BUTTON_OK | MsgBox.BUTTON_OPEN_TRACK, function(p_button) {
			if( p_button == MsgBox.BUTTON_OPEN_TRACK ) {
				var trackUrl = SettingsHandler.URL_trackDisplay + p_id_track;
				
				// open link to track
				switch (device.platform) {
				case 'Android':
					navigator.app.loadUrl(trackUrl, { openExternal:true } );
					break;
                default:
		        	window.open(trackUrl);
					break;
				}
			}
		});
	}, function(textStatus) {
		$.mobile.loading('hide');

		MsgBox.show($.i18n.prop("upload_message_error") + textStatus);
	});
}

new Trackdetail(); // Create single instance
