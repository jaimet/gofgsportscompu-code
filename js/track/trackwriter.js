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
 * Class for writing a track to a file
 */
function TrackWriter( p_track, p_fileEntry ) {
    this.m_track = p_track;
    this.m_continuousFileWriter = new ContinuousFileWriter( p_fileEntry );
}

TrackWriter.prototype.m_track = null;                   // Track to write
TrackWriter.prototype.m_continuousFileWriter = null;    // Writer to file

/**
 * Write general track information to file
 */
TrackWriter.prototype.writeInfo = function() {
            this.m_continuousFileWriter.writeLine( "00;" + this.m_track.getUUID() );	// Write uuid to file
        }

/**
 * Write last complete waypoint to file
 * @param p_bCurrent Boolean If set to true, will write the current waypoint instead of the last one
 */
TrackWriter.prototype.writeWaypoint = function( p_bCurrent ) {
            var waypoint = null;

            // Check which waypoint to fetch
            if( p_bCurrent ) {
                // Get current waypoint
                waypoint = this.m_track.getCurrentWaypoint();
            }
            else {
                // Get last complete waypoint
                waypoint = this.m_track.getWaypoint();
            }

            // Check if we actually have a waypoint
            if( waypoint === null ) return;

            // Write actual info to disk
            this.m_continuousFileWriter.writeLine( "01;" + waypoint.m_timestamp );
            // Check if we have a position (which we definately should)
            if( waypoint.m_position !== null ) {
                var coords = waypoint.m_position.coords;
                this.m_continuousFileWriter.writeLine( "02;" + Utilities.toRad(coords.latitude) + ":" + Utilities.toRad(coords.longitude) + ":" + coords.altitude );
                this.m_continuousFileWriter.writeLine( "05;" + coords.speed );
                this.m_continuousFileWriter.writeLine( "06;" + coords.accuracy + ":" + coords.altitudeAccuracy );
            }
            // Check if we have a valid heartrate value
            if( waypoint.m_heartrate > 0 ) this.m_continuousFileWriter.writeLine( "03;" + waypoint.m_heartrate );
            // Check for distance value
            if( waypoint.m_distance > 0 ) this.m_continuousFileWriter.writeLine( "04;" + waypoint.m_distance );
            // Check if this is a pause ending waypoint
            if( waypoint.m_bPauseEnd ) this.m_continuousFileWriter.writeLine( "07;" + waypoint.m_bPauseEnd );
        }
