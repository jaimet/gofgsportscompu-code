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

exporter.tcx = {
	m_trackFileEntry : null,
	m_completeCallback : function() {},

	m_continuousWriter : null,	
	m_xmlDoc : null,
	m_lapNode : null,
	m_trackNode : null,

	m_trackStartTime : 0,
	m_trackTotalDistance : 0,
	m_lastWaypoint : null,
	
	run : function( p_fileEntry, p_completeCallback ) {
		exporter.tcx.m_trackFileEntry = p_fileEntry;
		exporter.tcx.m_completeCallback = p_completeCallback;
		
		// Reset the members variables
		exporter.tcx.m_continuousWriter = null;
		exporter.tcx.m_xmlDoc = null;
		exporter.tcx.m_activityNode = null;
		exporter.tcx.m_trackNode = null;
		exporter.tcx.m_trackStartTime = 0;
		exporter.tcx.m_trackTotalDistance = 0;

		// Create basic XML structure
		exporter.tcx.m_xmlDoc = $.parseXML( '<TrainingCenterDatabase xmlns="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.garmin.com/xmlschemas/TrainingCenterDatabase/v2 http://www.garmin.com/xmlschemas/TrainingCenterDatabasev2.xsd"><Courses><Course></Course></Courses></TrainingCenterDatabase>' );
		var cNode = exporter.tcx.m_xmlDoc.getElementsByTagName( 'Course' )[0];
		exporter.tcx.m_lapNode = exporter.tcx.m_xmlDoc.createElement( 'Lap' );
		cNode.appendChild( exporter.tcx.m_lapNode );
		exporter.tcx.m_trackNode = exporter.tcx.m_xmlDoc.createElement( 'Track' );
		cNode.appendChild( exporter.tcx.m_trackNode );

		// Construct new file-name
		var fileName = exporter.tcx.m_trackFileEntry.name;
		exportFileName = fileName.replace( '.gsc', '.tcx' );

		// Get our export file
		// TODO: Remove external reference to TrackHandler
		TrackHandler.getExportDirectory().getFile( exportFileName, { create : true, exclusive : false }, exporter.tcx._fileEntry, GOFGSportsComputer._fileSystemError );
	},
	
	_fileEntry : function( p_fileEntry ) {
		exporter.tcx.m_continuousWriter = new ContinuousFileWriter( p_fileEntry );
		exporter.tcx.m_continuousWriter.writeLine( "<?xml version='1.0' encoding='UTF-8' ?>" );

		new TrackReader( exporter.tcx.m_trackFileEntry, exporter.tcx._waypoint, exporter.tcx._trackComplete );
	},
	
	_waypoint : function( p_trackWaypoint ) {
		if( exporter.tcx.m_trackStartTime == 0 ) {
			exporter.tcx.m_trackStartTime = p_trackWaypoint.timestamp;
			
			// Add begin position to lap-node
			var bpNode = exporter.tcx.m_xmlDoc.createElement( 'BeginPosition' );
			var lNode = exporter.tcx.m_xmlDoc.createElement( 'LatitudeDegrees' );
			$(lNode).text( GPSHandler._toDegree( p_trackWaypoint.gps.lat ) );
			bpNode.appendChild( lNode );
			lNode = exporter.tcx.m_xmlDoc.createElement( 'LongitudeDegrees' );
			$(lNode).text( GPSHandler._toDegree( p_trackWaypoint.gps.lon ) );
			bpNode.appendChild( lNode );
			
			exporter.tcx.m_lapNode.appendChild( bpNode );
		}
		
		// Record the total distance
		exporter.tcx.m_trackTotalDistance += p_trackWaypoint.distance;
		
		// Create date object
		var dObj = new Date();
		dObj.setTime( p_trackWaypoint.timestamp * 1000 );
		
		// Create the trackpoint node
		var tpNode = exporter.tcx.m_xmlDoc.createElement( 'Trackpoint' );
		// Add time info
		var tNode = exporter.tcx.m_xmlDoc.createElement( 'Time' );
		$(tNode).text( dObj.format("isoUtcDateTime") );
		tpNode.appendChild( tNode );
		// Add position info
		var pNode = exporter.tcx.m_xmlDoc.createElement( 'Position' );
		var lNode = exporter.tcx.m_xmlDoc.createElement( 'LatitudeDegrees' );
		$(lNode).text( GPSHandler._toDegree( p_trackWaypoint.gps.lat ) );
		pNode.appendChild( lNode );
		lNode = exporter.tcx.m_xmlDoc.createElement( 'LongitudeDegrees' );
		$(lNode).text( GPSHandler._toDegree( p_trackWaypoint.gps.lon ) );
		pNode.appendChild( lNode );
		tpNode.appendChild( pNode );
		// Add altitude info
		var aNode = exporter.tcx.m_xmlDoc.createElement( 'AltitudeMeters' );
		$(aNode).text( p_trackWaypoint.gps.alt );
		tpNode.appendChild( aNode );
		// Add distance info
		var dNode = exporter.tcx.m_xmlDoc.createElement( 'DistanceMeters' );
		$(dNode).text( exporter.tcx.m_trackTotalDistance );
		tpNode.appendChild( dNode );
		// Add hrm info
		var hNode = exporter.tcx.m_xmlDoc.createElement( 'HeartRateBpm' );
		hNode.setAttribute( 'xsi:type', 'HeartRateInBeatsPerMinute_t' );
		var vNode = exporter.tcx.m_xmlDoc.createElement( 'Value' );
		$(vNode).text( p_trackWaypoint.hr );
		hNode.appendChild( vNode );
		tpNode.appendChild( hNode );
		
		// Finally append the point to the track
		exporter.tcx.m_trackNode.appendChild( tpNode );
		
		// Save last waypoint
		exporter.tcx.m_lastWaypoint = p_trackWaypoint;
	},
	
	_trackComplete : function( p_uuid ) {
		// Finalize the lap node
		if( exporter.tcx.m_lastWaypoint != null ) {
			// Add total time
			var ttNode = exporter.tcx.m_xmlDoc.createElement( 'TotalTimeSeconds' );
			$(ttNode).text( exporter.tcx.m_lastWaypoint.timestamp - exporter.tcx.m_trackStartTime );
			exporter.tcx.m_lapNode.appendChild( ttNode );
			// Add total distance
			var tdNode = exporter.tcx.m_xmlDoc.createElement( 'DistanceMeters' );
			$(tdNode).text( exporter.tcx.m_trackTotalDistance );
			exporter.tcx.m_lapNode.appendChild( tdNode );
			// Add end position to lap-node
			var epNode = exporter.tcx.m_xmlDoc.createElement( 'EndPosition' );
			var lNode = exporter.tcx.m_xmlDoc.createElement( 'LatitudeDegrees' );
			$(lNode).text( GPSHandler._toDegree( exporter.tcx.m_lastWaypoint.gps.lat ) );
			epNode.appendChild( lNode );
			lNode = exporter.tcx.m_xmlDoc.createElement( 'LongitudeDegrees' );
			$(lNode).text( GPSHandler._toDegree( exporter.tcx.m_lastWaypoint.gps.lon ) );
			epNode.appendChild( lNode );
			exporter.tcx.m_lapNode.appendChild( epNode );
		}
		
		exporter.tcx.m_continuousWriter.write( exporter.tcx._toString() );
		
		// Notify the caller that we are done
		// TODO: Should be called once the file-writing is actually done
		exporter.tcx.m_completeCallback();
	},
	
	_toString : function() {
		// Taken from: http://stackoverflow.com/questions/43455/how-do-i-serialize-a-dom-to-xml-text-using-javascript-in-a-cross-browser-way
		try {
			// Gecko- and Webkit-based browsers (Firefox, Chrome), Opera.
			return (new XMLSerializer()).serializeToString(exporter.tcx.m_xmlDoc);
		}
		catch (e) {
			try {
				// Internet Explorer.
				return exporter.tcx.m_xmlDoc.xml;
			}
			catch (e) {
				//Other browsers without XML Serializer
				console.log('Xmlserializer not supported');
			}
		}
		
		return "Xmlserializer not supported";
	}
};
