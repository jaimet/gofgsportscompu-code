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

/**
 * TrackReader constructor
 * 
 * @param p_fileEntry FileEntry object referencing the track to be read
 * @param p_progressCallback Callback which is called once for each waypoint
 * @param p_completeCallback Callback which is called once the track is fully loaded
 */
function TrackReader( p_fileEntry, p_progressCallback, p_completeCallback ) {
	if( p_progressCallback == undefined ) p_progressCallback = function( p_waypoint ) {};
	if( p_completeCallback == undefined ) p_completeCallback = function() {};
	
	var m_trackWaypoint = new TrackWaypoint();
	m_trackWaypoint.reset(0);

	this._file = _file;
	this._loaded = _loaded;
	
	p_fileEntry.file( _file, GOFGSportsComputer._fileSystemError );

	function _file( p_file ) {
		var reader = new FileReader();
		reader.onload = _loaded;
		reader.readAsText(p_file);
	}

	function _loaded( p_evt ) {
		var lines = p_evt.target.result.split( "\n" );
		var uuid = 0;
		
		for( var i = 0; i < lines.length; i++ ) {
			var line = lines[i];
			
			if( line == "" ) continue;
			
			var parts = line.split( ";" );
			var type = parseInt( parts[0] );
			var data_parts = parts[1].split( ":" );
			
			switch( type ) {
			// UUID
			case 0:
				uuid = data_parts[0];
				break;
			// Timestamp
			case 1:
				if( m_trackWaypoint.timestamp != 0 ) {
					p_progressCallback( m_trackWaypoint );
					
					m_trackWaypoint.reset(0);
				}
				m_trackWaypoint.timestamp = parseInt(data_parts[0]);
				break;
			// Position
			case 2:
				m_trackWaypoint.gps.lat = parseFloat(data_parts[0]);
				m_trackWaypoint.gps.lon = parseFloat(data_parts[1]);
				m_trackWaypoint.gps.alt = parseFloat(data_parts[2]);
				break;
			// Heartrate
			case 3:
				m_trackWaypoint.hr = parseInt(data_parts[0]);
				break;
			// Distance
			case 4:
				m_trackWaypoint.distance = parseFloat(data_parts[0]);
				break;
			// Speed
			case 5:
				m_trackWaypoint.speed = parseFloat(data_parts[0]);
				break;
			// Accuracy
			case 6:
				m_trackWaypoint.accuracy = parseInt(data_parts[0]);
				if( data_parts.length > 1 ) {
					m_trackWaypoint.altitudeAccuracy = parseInt(data_parts[1]);
				}
				else {
					m_trackWaypoint.altitudeAccuracy = 0;
				}
				break;
			// Unknown
			default:
				console.log( "TrackReader: invalid data-point: '" + line + "'" );
				break;
			}
		}
		
		// Notify caller that the track has been loaded
		p_completeCallback( uuid );
	}
}
