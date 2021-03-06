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
 * Class for reading a track from a file
 */
function TrackReader(p_fileEntry, p_waypointCallback, p_trackCallback, p_errorCallback) {
	// Keep reference to callbacks
	this.m_waypointCallback = p_waypointCallback;
	this.m_trackCallback = p_trackCallback;
	this.m_errorCallback = p_errorCallback;

	// Create fileReader object
	this.m_fileReader = new FileReader();
	this.m_fileReader.onload = Utilities.getEvtHandler(this, this.onload);
	this.m_fileReader.onerror = Utilities.getEvtHandler(this, this.onerror);

	// Create a file object out of the fileEntry
	p_fileEntry.file(Utilities.getEvtHandler(this, this.file), Utilities.getEvtHandler(this, this.fileError));
}

TrackReader.prototype.m_fileReader = null;
TrackReader.prototype.m_waypointCallback = null;
TrackReader.prototype.m_trackCallback = null;
TrackReader.prototype.m_errorCallback = null;

/**
 * Called once the fileEntry object returned a file entry
 */
TrackReader.prototype.file = function(p_file) {
	this.m_fileReader.readAsText(p_file);
}

/**
 * Called when the file was loaded
 */
TrackReader.prototype.onload = function(p_progressEvent) {
	// Split file-contents into lines
	var lines = p_progressEvent.target.result.split("\n");
	p_progressEvent = null;

	// Check if we have at least two lines
	if (lines.length < 2) {
		return;
	}

	// Define variable to track
	var track = null;

	// Fetch first line (which should contain the UUID)
	// Due to compatibility to old versions, we support non-uuid tracks as well
	var first_line = lines.shift();
	var line_info = this.parseLine(first_line);
	if (line_info !== false && line_info.type === 0) {
		// Due to compatibility to old versions, we support non-sporttype tracks as well
		if (line_info.values.length >= 2) {
			track = new Track(line_info.values[1], line_info.values[0]);
		} else {
			track = new Track(undefined, line_info.values[0]);
		}
	} else {
		track = new Track();
		lines.unshift(first_line);
	}
	
	// Cycle through all lines and read them
	var position = null;
	var distance = 0;
	var bPauseEnd = false;
	var me = this;

	// use utility function for long running loops
	Utilities.loop( function() {
		if( lines.length <= 0 ) return false;
		
		// parse next line
		line_info = me.parseLine(lines.shift());

		// Check if we found a valid line
		if (line_info === false) {
			return true;
		}

		// Select type of line
		switch (line_info.type) {
		case 1: // timestamp
			if (position !== null) {
				track.addPosition(position, distance, bPauseEnd)
				// Run waypoint callback if necessary
				if (typeof me.m_waypointCallback === "function") me.m_waypointCallback(track.getCurrentWaypoint(), track);
			}
			// Create new position & coordinates object (faking through fixed objects)
			position = new gofg_position();
			position.timestamp = parseInt(line_info.values[0]) * 1000;
			distance = 0;
			bPauseEnd = false;
			break;
		case 2: // location
			position.coords.latitude = Utilities.toDegree(parseFloat(line_info.values[0]));
			position.coords.longitude = Utilities.toDegree(parseFloat(line_info.values[1]));
			position.coords.altitude = parseFloat(line_info.values[2]);
			break;
		case 3: // heartrate
			track.addHeartrate(parseInt(line_info.values[0]));
			break;
		case 4: // distance
			distance = parseFloat(line_info.values[0]);
			break;
		case 5: // speed
			position.coords.speed = parseFloat(line_info.values[0]);
			break;
		case 6: // accuracy
			position.coords.accuracy = parseFloat(line_info.values[0]);
			position.coords.altitudeAccuracy = parseFloat(line_info.values[1]);
			break;
		case 7: // pause
			bPauseEnd = true;
			break;
		default: // invalid
			break;
		}
		
		return true;
	},
	function() {
		// handle last position entry
		if (position !== null) {
			track.addPosition(position, distance, bPauseEnd)
			// Run waypoint callback if necessary
			if (typeof me.m_waypointCallback === "function") me.m_waypointCallback(track.getCurrentWaypoint(), track);
		}
	
		// Run track callback if necessary
		if (typeof me.m_trackCallback === "function") me.m_trackCallback(track);
	} );
}

/**
 * Helper function for parsing a line
 */
TrackReader.prototype.parseLine = function(p_line) {
	// Split into line components
	var components = p_line.split(";");
	if (components.length < 2) return false;

	// Fetch the type
	var type = components[0];
	if (isNaN(type)) return false;
	type = parseInt(type);

	// Fetch values
	var values = components[1].split(":");

	// Return object for this line
	return {
		type : type,
		values : values
	};
}

// TODO: Change error handling functions to both pass the same type of parameter
TrackReader.prototype.fileError = function(p_fileError) {
	if (typeof this.m_errorCallback === "function") this.m_errorCallback(p_fileError);
}

TrackReader.prototype.onerror = function() {
	if (typeof this.m_errorCallback === "function") this.m_errorCallback(this.m_fileReader.error);
}
