/**
 * javascript object for handling a track (including writing to file and getting info)
 */

var TrackHandler = {
		m_fileEntry : null,				// Reference to the track file
		m_persistentFileSystem : null,	// Reference to the holding file-system
		m_totalDistance : 0,			// Total distance for this track
		m_elevationGain : 0,			// Total elevation gain for this track
		m_startTimestamp : 0,			// Start time for this track
		m_waypoint : {
			timestamp : null,
			gps : {
				lat : null,
				lon : null,
				alt : null
			},
			hr : null,
			distance : null,
			speed : null,
			
			_reset : function() {
				this.timestamp = null;
				this.gps.lat = null;
				this.gps.lon = null;
				this.gps.alt = null;
				this.hr = null;
				this.distance = null;
				this.speed = null;
			},
		},
		m_continuousFileWriter : null,
		
		startTrack : function() {
			if( TrackHandler.m_persistentFileSystem == null ) return;

//			console.log( "Starting-Track" );

			// Reset (initialization)
			TrackHandler._reset();
			// Save start time
			TrackHandler.m_startTimestamp = ((new Date()).getTime() / 1000).toFixed(0);
			
			// Construct new file-name
			var fileName = TrackHandler.m_startTimestamp + ".gsc";
			// Request file reference
			TrackHandler.m_persistentFileSystem.root.getFile( fileName, {create: true, exclusive: true}, TrackHandler._fileEntry, TrackHandler._fileSystemError );
		},

		stopTrack : function() {
		},

		loadTrack : function( p_fileName ) {
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

			if( TrackHandler.m_waypoint.gps.alt < p_altitude ) {
				TrackHandler.m_elevationGain += (p_altitude - TrackHandler.m_waypoint.gps.alt);
			}

			TrackHandler.m_waypoint.gps = {
				lat : p_latitude,
				lon : p_longitude,
				alt : p_altitude
			};
		},
		
		// Returns the total distance for this track
		getTotalDistance : function() {
			return TrackHandler.m_totalDistance;
		},
		
		/**
		 * Returns the total elevation gain for this track
		 */
		getElevationGain : function() {
			return TrackHandler.m_elevationGain;
		},
		
		/**
		 * Get duration for this track
		 */
		getDuration : function() {
			var currentTimestamp = ((new Date()).getTime() / 1000).toFixed(0);
			
			return (currentTimestamp - TrackHandler.m_startTimestamp);
		},
		
		// Generic function for writing a data-line in the correct format
		_checkWrite : function( p_status ) {
//			console.log( "Check write" );
			
			if( p_status ) {
				TrackHandler.m_waypoint.timestamp = ((new Date()).getTime() / 1000).toFixed(0);
				TrackHandler._writeWayPoint();
				
				TrackHandler.m_waypoint._reset();
			}
		},
		
		_writeWayPoint : function() {
			TrackHandler.m_continuousFileWriter.writeLine( "01;" + TrackHandler.m_waypoint.timestamp );
			if( TrackHandler.m_waypoint.gps.lon != null ) TrackHandler.m_continuousFileWriter.writeLine( "02;" + TrackHandler.m_waypoint.gps.lon + ":" + TrackHandler.m_waypoint.gps.lat + ":" + TrackHandler.m_waypoint.gps.alt );
			if( TrackHandler.m_waypoint.hr != null ) TrackHandler.m_continuousFileWriter.writeLine( "03;" + TrackHandler.m_waypoint.hr );
			if( TrackHandler.m_waypoint.distance != null ) TrackHandler.m_continuousFileWriter.writeLine( "04;" + TrackHandler.m_waypoint.distance );
			if( TrackHandler.m_waypoint.speed != null ) TrackHandler.m_continuousFileWriter.writeLine( "05;" + TrackHandler.m_waypoint.speed );
		},
		
		_fileEntry : function( p_fileEntry ) {
			TrackHandler.m_fileEntry = p_fileEntry;
			
			TrackHandler.m_continuousFileWriter = new ContinuousFileWriter( TrackHandler.m_fileEntry );
		},
		
		_fileSystem : function( p_fileSystem ) {
			TrackHandler.m_persistentFileSystem = p_fileSystem;
			
//			console.log( "FileSystem Name: " + TrackHandler.m_persistentFileSystem.name );
//			console.log( "FileSystem Root Name: " + TrackHandler.m_persistentFileSystem.root.name );
		},
		
		_fileSystemError : function( p_fileError ) {
			console.log( "Error while operating on the file-system: " + p_fileError.code );
		},
		
		_init : function() {
			window.requestFileSystem( LocalFileSystem.PERSISTENT, 0, TrackHandler._fileSystem, TrackHandler._fileSystemError );
		},
		
		_reset : function() {
			TrackHandler.m_fileEntry = null;
			TrackHandler.m_totalDistance = 0;
			TrackHandler.m_elevationGain = 0;
			TrackHandler.m_startTimestamp = 0;
			TrackHandler.m_waypoint._reset(); 
		}
};
