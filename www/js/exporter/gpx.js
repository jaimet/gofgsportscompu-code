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

exporter.gpx = {
    m_trackFileEntry : null,
    m_completeCallback : function() {},

    m_continuousWriter : null,
    m_xmlDoc : null,
    m_trackSegNode : null,
    m_trackStartTime : 0,
    m_trackTotalDistance : 0,

    run : function( p_fileEntry, p_completeCallback ) {
              exporter.gpx.m_trackFileEntry = p_fileEntry;
              exporter.gpx.m_completeCallback = p_completeCallback;

              // Reset the members variables
              exporter.gpx.m_continuousWriter = null;
              exporter.gpx.m_xmlDoc = null;
              exporter.gpx.m_trackNode = null;
              exporter.gpx.m_trackStartTime = 0;
              exporter.gpx.m_trackTotalDistance = 0;

              // Create basic XML structure
              exporter.gpx.m_xmlDoc = $.parseXML( "<gpx xmlns='http://www.topografix.com/GPX/1/1' creator='GOFG Sports Computer (http://www.gofg.at/)' version='1.1' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xsi:schemaLocation='http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd'></gpx>" );
              var gpxNode = exporter.gpx.m_xmlDoc.firstChild;
              var trkNode = exporter.gpx.m_xmlDoc.createElement( 'trk' );
              gpxNode.appendChild( trkNode );
              exporter.gpx.m_trackSegNode = exporter.gpx.m_xmlDoc.createElement( 'trkseg' );
              trkNode.appendChild( exporter.gpx.m_trackSegNode );

              // Construct new file-name
              var fileName = exporter.gpx.m_trackFileEntry.name;
              exportFileName = fileName.replace( '.gsc', '.gpx' );

              // Get our export file
              GOFGSportsComputer.m_exportDirectoryEntry.getFile( exportFileName, { create : true, exclusive : false }, exporter.gpx._fileEntry, GOFGSportsComputer._fileSystemError );
          },

    _fileEntry : function( p_fileEntry ) {
                     exporter.gpx.m_continuousWriter = new ContinuousFileWriter( p_fileEntry );
                     exporter.gpx.m_continuousWriter.writeLine( "<?xml version='1.0' encoding='UTF-8' ?>" );

                     new TrackReader( exporter.gpx.m_trackFileEntry, exporter.gpx._waypoint, exporter.gpx._trackComplete );
                 },

    _waypoint : function( p_waypoint ) {
                    if( exporter.gpx.m_trackStartTime == 0 ) {
                        exporter.gpx.m_trackStartTime = p_waypoint.m_timestamp;

                        // TODO: Add metadata info to GPX
                        //			// Create a formatted UTC date string out of it
                        //			var dObj = new Date();
                        //			dObj.setTime( exporter.fitlog.m_trackStartTime * 1000 );
                        //			var formattedDate = dObj.format("isoUtcDateTime");
                        //
                        //			exporter.fitlog.m_trackNode.setAttribute( 'StartTime', formattedDate );
                        //			exporter.fitlog.m_activityNode.setAttribute( 'StartTime', formattedDate );
                    }

                    // Record the total distance
                    exporter.gpx.m_trackTotalDistance += p_waypoint.m_distance;

                    // Create date object
                    var dObj = new Date();
                    dObj.setTime( p_waypoint.m_timestamp * 1000 );

                    // Create the trackpoint node
                    var wptNode = exporter.gpx.m_xmlDoc.createElement( 'trkpt' );
                    wptNode.setAttribute( 'lat', Utilities.toDegree( p_waypoint.m_position.coords.latitude ) );
                    wptNode.setAttribute( 'lon', Utilities.toDegree( p_waypoint.m_position.coords.longitude ) );
                    var eleNode = exporter.gpx.m_xmlDoc.createElement( 'ele' );
                    $(eleNode).text(p_waypoint.m_position.coords.altitude);
                    wptNode.appendChild( eleNode );
                    var tNode = exporter.gpx.m_xmlDoc.createElement( 'time' );
                    $(tNode).text( dObj.format("isoUtcDateTime") );
                    wptNode.appendChild( tNode );

                    // Finally append the point to the track
                    exporter.gpx.m_trackSegNode.appendChild( wptNode );
                },

    _trackComplete : function( p_track ) {
                         //console.log( exporter.fitlog._toString() );

                         exporter.gpx.m_continuousWriter.write( exporter.gpx._toString() );

                         // Notify the caller that we are done
                         // TODO: Should be called once the file-writing is actually done
                         exporter.gpx.m_completeCallback();
                     },

    _toString : function() {
                    var xmlString = "Xmlserializer not supported";

                    // Taken from: http://stackoverflow.com/questions/43455/how-do-i-serialize-a-dom-to-xml-text-using-javascript-in-a-cross-browser-way
                    try {
                        // Gecko- and Webkit-based browsers (Firefox, Chrome), Opera.
                        xmlString = (new XMLSerializer()).serializeToString(exporter.gpx.m_xmlDoc);
                    }
                    catch (e) {
                        try {
                            // Internet Explorer.
                            xmlString = exporter.gpx.m_xmlDoc.xml;
                        }
                        catch (e) {
                            //Other browsers without XML Serializer
                            console.log('Xmlserializer not supported');
                        }
                    }

                    // Apply a bit of indenting to the XML-String
                    xmlString = xmlString.replace( /(<[^\/])/g, "\n$1" );

                    return xmlString;
                }
};
