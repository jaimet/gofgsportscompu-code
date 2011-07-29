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

if( exporter == undefined ) {
	var exporter = {};
}

exporter.fitlog = {
	m_trackFileEntry : null,
	m_completeCallback : function() {},

	m_continuousWriter : null,	
	m_xmlDoc : null,
	m_activityNode : null,
	m_trackNode : null,
	m_trackStartTime : 0,
	m_trackTotalDistance : 0,
	
	run : function( p_fileEntry, p_completeCallback ) {
		exporter.fitlog.m_trackFileEntry = p_fileEntry;
		exporter.fitlog.m_completeCallback = p_completeCallback;
		
		// Reset the members variables
		exporter.fitlog.m_continuousWriter = null;
		exporter.fitlog.m_xmlDoc = null;
		exporter.fitlog.m_activityNode = null;
		exporter.fitlog.m_trackNode = null;
		exporter.fitlog.m_trackStartTime = 0;
		exporter.fitlog.m_trackTotalDistance = 0;

		// Create basic XML structure
		exporter.fitlog.m_xmlDoc = $.parseXML( "<FitnessWorkbook xmlns='http://www.zonefivesoftware.com/xmlschemas/FitnessLogbook/v2' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema'></FitnessWorkbook>" );
		var fwNode = exporter.fitlog.m_xmlDoc.firstChild;
		var alNode = exporter.fitlog.m_xmlDoc.createElement( 'AthleteLog' );
		fwNode.appendChild( alNode );
		exporter.fitlog.m_activityNode = exporter.fitlog.m_xmlDoc.createElement( 'Activity' );
		alNode.appendChild( exporter.fitlog.m_activityNode );
		exporter.fitlog.m_trackNode = exporter.fitlog.m_xmlDoc.createElement( 'Track' );
		exporter.fitlog.m_activityNode.appendChild( exporter.fitlog.m_trackNode );
		
		// Construct new file-name
		var fileName = exporter.fitlog.m_trackFileEntry.name;
		exportFileName = fileName.replace( '.gsc', '.fitlog' );

		// Get our export file
		// TODO: Remove external reference to TrackHandler
		TrackHandler.getExportDirectory().getFile( exportFileName, { create : true, exclusive : false }, exporter.fitlog._fileEntry, GOFGSportsComputer._fileSystemError );
	},
	
	_fileEntry : function( p_fileEntry ) {
		exporter.fitlog.m_continuousWriter = new ContinuousFileWriter( p_fileEntry );
		exporter.fitlog.m_continuousWriter.writeLine( "<?xml version='1.0' encoding='UTF-8' ?>" );

		new TrackReader( exporter.fitlog.m_trackFileEntry, exporter.fitlog._waypoint, exporter.fitlog._trackComplete );
	},
	
	_waypoint : function( p_trackWaypoint ) {
		if( exporter.fitlog.m_trackStartTime == 0 ) {
			exporter.fitlog.m_trackStartTime = p_trackWaypoint.timestamp;

			// Create a formatted UTC date string out of it
			var dObj = new Date();
			dObj.setTime( exporter.fitlog.m_trackStartTime * 1000 );
			var formattedDate = dObj.format("isoUtcDateTime");
			
			exporter.fitlog.m_trackNode.setAttribute( 'StartTime', formattedDate );
			exporter.fitlog.m_activityNode.setAttribute( 'StartTime', formattedDate );
		}
		
		// Record the total distance
		exporter.fitlog.m_trackTotalDistance += p_trackWaypoint.distance;
		
		// Create the trackpoint node
		var ptNode = exporter.fitlog.m_xmlDoc.createElement( 'pt' );
		ptNode.setAttribute( 'tm', p_trackWaypoint.timestamp - exporter.fitlog.m_trackStartTime );
		ptNode.setAttribute( 'lat', GPSHandler._toDegree( p_trackWaypoint.gps.lat ) );
		ptNode.setAttribute( 'lon', GPSHandler._toDegree( p_trackWaypoint.gps.lon ) );
		ptNode.setAttribute( 'ele', p_trackWaypoint.gps.alt );
		ptNode.setAttribute( 'dist', exporter.fitlog.m_trackTotalDistance );
		ptNode.setAttribute( 'hr', p_trackWaypoint.hr );
		
		// Finally append the point to the track
		exporter.fitlog.m_trackNode.appendChild( ptNode );
	},
	
	_trackComplete : function() {
		//console.log( exporter.fitlog._toString() );
		
		exporter.fitlog.m_continuousWriter.write( exporter.fitlog._toString() );
		
		// Notify the caller that we are done
		// TODO: Should be called once the file-writing is actually done
		exporter.fitlog.m_completeCallback();
	},
	
	_toString : function() {
		// Taken from: http://stackoverflow.com/questions/43455/how-do-i-serialize-a-dom-to-xml-text-using-javascript-in-a-cross-browser-way
		try {
			// Gecko- and Webkit-based browsers (Firefox, Chrome), Opera.
			return (new XMLSerializer()).serializeToString(exporter.fitlog.m_xmlDoc);
		}
		catch (e) {
			try {
				// Internet Explorer.
				return exporter.fitlog.m_xmlDoc.xml;
			}
			catch (e) {
				//Other browsers without XML Serializer
				console.log('Xmlserializer not supported');
			}
		}
		
		return "Xmlserializer not supported";
	}
};
