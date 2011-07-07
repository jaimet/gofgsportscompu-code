/*
 * Copyright (C) 2011 Wolfgang Koller
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

function TrackWaypoint() {
	this.timestamp = null;
	this.gps = {
			lat : null,
			lon : null,
			alt : null
	};
	this.hr = null;
	this.distance = null;
	this.speed = null;
	this.accuracy = null;
	this.altitudeAccuracy = null;
}

TrackWaypoint.prototype.reset = function( p_resetValue ) {
	if( p_resetValue == undefined ) p_resetValue = null;
	
	this.timestamp = p_resetValue;
	this.gps.lat = p_resetValue;
	this.gps.lon = p_resetValue;
	this.gps.alt = p_resetValue;
	this.hr = p_resetValue;
	this.distance = p_resetValue;
	this.speed = p_resetValue;
	this.accuracy = p_resetValue;
	this.altitudeAccuracy = p_resetValue;
}

/**
 * javascript object for handling a track (including writing to file and getting info)
 */

var TrackHandler = {
		m_fileEntry : null,				// Reference to the track file
		m_trackDirectoryEntry : null,	// Reference to the track directory
		m_exportDirectoryEntry : null,	// Reference to the export directory
		m_totalDistance : 0,			// Total distance for this track
		m_elevationGain : 0,			// Total elevation gain for this track
		m_lastAltitude : -1000,				// Last altitude
		m_startTimestamp : 0,			// Start time for this track
		m_bTrackOpen : false,			// Indicates if the track is still open (and running) or not
		m_waypoint : null,
		m_continuousFileWriter : null,
		
		startTrack : function() {
			if( TrackHandler.m_trackDirectoryEntry == null ) return;

//			console.log( "Starting-Track" );

			// Reset (initialization)
			TrackHandler._reset();
			// Save start time
			TrackHandler.m_startTimestamp = ((new Date()).getTime() / 1000).toFixed(0);
			TrackHandler.m_waypoint.timestamp = TrackHandler.m_startTimestamp;

			// Construct new file-name
			var fileName = TrackHandler.m_startTimestamp + ".gsc";
			// Request file reference
			TrackHandler.m_trackDirectoryEntry.getFile( fileName, {create: true, exclusive: true}, TrackHandler._fileEntry, TrackHandler._fileSystemError );

			TrackHandler.m_bTrackOpen = true;
		},

		stopTrack : function() {
			TrackHandler.m_bTrackOpen = false;
		},

		/**
		 * Load a track
		 * @param p_fileEntry FileEntry object for the file to load
		 * @param p_completeCallback Function reference which is called once the track is loaded
		 */
		loadTrack : function( p_fileEntry, p_completeCallback ) {
			TrackHandler._reset();
			
			var trackReader = new TrackReader( p_fileEntry, TrackHandler._loadTrackWaypoint, p_completeCallback );
		},
		
		_loadTrackWaypoint : function( p_waypoint ) {
			if( TrackHandler.m_startTimestamp == 0 ) {
				TrackHandler.m_startTimestamp = p_waypoint.timestamp;
			}
			
			TrackHandler.m_waypoint.timestamp = p_waypoint.timestamp;
			TrackHandler.addAccuracy( p_waypoint.accuracy, p_waypoint.altitudeAccuracy );
			TrackHandler.addDistance( p_waypoint.distance );
			TrackHandler.addPosition( p_waypoint.gps.lat, p_waypoint.gps.lon, p_waypoint.gps.alt );
			TrackHandler.addSpeed( p_waypoint.speed );
		},
		
		/**
		 * Set the directory for storing the tracks
		 * @param p_directoryEntry DirectoryEntry object for storing the track-files in
		 */
		setDirectory : function( p_directoryEntry ) {
			TrackHandler.m_trackDirectoryEntry = p_directoryEntry;
		},
		
		/**
		 * Return the directory for storing the tracks
		 * @return DirectoryEntry Entry with tracks in it
		 */
		getDirectory : function() {
			return TrackHandler.m_trackDirectoryEntry;
		},

		/**
		 * Set the directory for exporting the tracks
		 * @param p_directoryEntry DirectoryEntry object for storing the export-files in
		 */
		setExportDirectory : function( p_directoryEntry ) {
			TrackHandler.m_exportDirectoryEntry = p_directoryEntry;
		},
		
		/**
		 * Return the directory for exporting the tracks
		 * @return DirectoryEntry Entry with export files in it
		 */
		getExportDirectory : function() {
			return TrackHandler.m_exportDirectoryEntry;
		},

		// Add distance info to waypoint
		addDistance : function( p_distance ) {
			TrackHandler._checkWrite( TrackHandler.m_waypoint.distance != null );

			TrackHandler.m_totalDistance += p_distance;
			TrackHandler.m_waypoint.distance = p_distance;
		},
		
		// Add speed info to waypoint
		addSpeed : function( p_speed ) {
			TrackHandler._checkWrite( TrackHandler.m_waypoint.speed != null );
			
			TrackHandler.m_waypoint.speed = p_speed;
		},
		
		addPosition : function( p_latitude, p_longitude, p_altitude ) {
			TrackHandler._checkWrite( TrackHandler.m_waypoint.gps.lat != null );

			if( TrackHandler.m_lastAltitude > -1000 && TrackHandler.m_lastAltitude < p_altitude ) {
				TrackHandler.m_elevationGain += p_altitude - TrackHandler.m_lastAltitude; 
			}
			
			TrackHandler.m_waypoint.gps = {
				lat : p_latitude,
				lon : p_longitude,
				alt : p_altitude
			};
			
			TrackHandler.m_lastAltitude = p_altitude;
		},
		
		/**
		 * Add accuracy information
		 * @param p_accuracy Accuracy of location (in m)
		 * @param p_altitudeAccuracy Accuracy of altitude (in m)
		 */
		addAccuracy : function( p_accuracy, p_altitudeAccuracy ) {
			TrackHandler._checkWrite( TrackHandler.m_waypoint.accuracy != null );
			
			TrackHandler.m_waypoint.accuracy = p_accuracy;
			TrackHandler.m_waypoint.altitudeAccuracy = p_altitudeAccuracy;
		},
		
		/**
		 * Returns the total distance for this track
		 * @return Number Total distance (in m)
		 */
		getTotalDistance : function() {
			return TrackHandler.m_totalDistance;
		},
		
		/**
		 * Returns the total elevation gain for this track (in m)
		 */
		getElevationGain : function() {
			return TrackHandler.m_elevationGain;
		},
		
		/**
		 * Get duration for this track (in seconds)
		 */
		getDuration : function() {
			if( TrackHandler.m_bTrackOpen ) {
				return (((new Date()).getTime() / 1000).toFixed(0) - TrackHandler.m_startTimestamp);
			}
			else {
				return (TrackHandler.m_waypoint.timestamp - TrackHandler.m_startTimestamp);
			}
		},
		
		/**
		 * Get current speed
		 */
		getSpeed : function() {
			return TrackHandler.m_waypoint.speed;
		},
		
		/**
		 * Get the current accuracy
		 */
		getAccuracy : function() {
			return TrackHandler.m_waypoint.accuracy;
		},
		
		/**
		 * Get the current altitude accuracy
		 */
		getAltitudeAccuracy : function() {
			return TrackHandler.m_waypoint.altitudeAccuracy;
		},
		
		// Generic function for writing a data-line in the correct format
		_checkWrite : function( p_status ) {
//			console.log( "Check write" );
			// Check if we have a valid file-entry (which won't be the case during loading)
			if( TrackHandler.m_fileEntry == null ) return;
			
			if( p_status ) {
				TrackHandler._writeWayPoint();
				
				TrackHandler.m_waypoint._reset();
				TrackHandler.m_waypoint.timestamp = ((new Date()).getTime() / 1000).toFixed(0);
			}
		},
		
		_writeWayPoint : function() {
			TrackHandler.m_continuousFileWriter.writeLine( "01;" + TrackHandler.m_waypoint.timestamp );
			if( TrackHandler.m_waypoint.gps.lat != null ) TrackHandler.m_continuousFileWriter.writeLine( "02;" + TrackHandler.m_waypoint.gps.lat + ":" + TrackHandler.m_waypoint.gps.lon + ":" + TrackHandler.m_waypoint.gps.alt );
			if( TrackHandler.m_waypoint.hr != null ) TrackHandler.m_continuousFileWriter.writeLine( "03;" + TrackHandler.m_waypoint.hr );
			if( TrackHandler.m_waypoint.distance != null ) TrackHandler.m_continuousFileWriter.writeLine( "04;" + TrackHandler.m_waypoint.distance );
			if( TrackHandler.m_waypoint.speed != null ) TrackHandler.m_continuousFileWriter.writeLine( "05;" + TrackHandler.m_waypoint.speed );
			if( TrackHandler.m_waypoint.accuracy != null ) TrackHandler.m_continuousFileWriter.writeLine( "06;" + TrackHandler.m_waypoint.accuracy + ":" + TrackHandler.m_waypoint.altitudeAccuracy );
		},
		
		_fileEntry : function( p_fileEntry ) {
			TrackHandler.m_fileEntry = p_fileEntry;
			
			TrackHandler.m_continuousFileWriter = new ContinuousFileWriter( TrackHandler.m_fileEntry );
		},
		
		_fileSystemError : function( p_fileError ) {
			console.log( "Error while operating on the file-system: " + p_fileError.code );
		},
		
		_reset : function() {
			TrackHandler.m_fileEntry = null;
			TrackHandler.m_totalDistance = 0;
			TrackHandler.m_elevationGain = 0;
			TrackHandler.m_lastAltitude = -1000;
			TrackHandler.m_startTimestamp = 0;
			TrackHandler.m_bTrackOpen = false;
			TrackHandler.m_waypoint = new TrackWaypoint();
		}
};
