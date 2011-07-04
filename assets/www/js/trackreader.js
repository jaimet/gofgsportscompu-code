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

function TrackReader( p_fileEntry, p_callback ) {
	if( p_callback == undefined ) p_callback = function( p_waypoint ) {};
	
	var m_trackWaypoint = new TrackWaypoint();
	
	p_fileEntry.file( _file, GOFGSportsComputer._fileSystemError );
	
	function _file( p_file ) {
		var reader = new FileReader();
		reader.onload = _loaded;
		reader.readAsText(p_file);
	}
	
	function _loaded( p_evt ) {
		var lines = p_evt.target.result.split( "\n" );
		
		for( var i = 0; i < lines.length; i++ ) {
			var line = lines[i];
			
			var parts = line.split( ";" );
			var type = parseInt( parts[0] );
			
			var data_parts = parts[1].split( ":" );
			
			switch( type ) {
			case 1:
				if( m_trackWaypoint.timestamp != null ) {
					p_callback( m_trackWaypoint );
					
					m_trackWaypoint.reset();
				}
				
				m_trackWaypoint.timestamp = data_parts[0];
				break;
			case 2:
				m_trackWaypoint.gps.lon = data_parts[0];
				m_trackWaypoint.gps.lat = data_parts[1];
				m_trackWaypoint.gps.alt = data_parts[2];
				break;
			case 3:
				m_trackWaypoint.hr = data_parts[0];
				break;
			case 4:
				m_trackWaypoint.distance = data_parts[0];
				break;
			case 5:
				m_trackWaypoint.speed = data_parts[0];
				break;
			case 6:
				m_trackWaypoint.accuracy = data_parts[0];
				break;
			default:
				console.log( "TrackReader: invalid data-point: '" + line + "'" );
				break;
			}
		}
	}
}
