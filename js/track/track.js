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
 * Base class for handling a single track
 */
function Track( p_uuid ) {
    // Check if we have to generate the UUID
    if( typeof p_uuid === "undefined" ) {
        this.m_uuid = $.uidGen( { mode: 'random' } );
    }
    else {
        this.m_uuid = p_uuid;
    }
}

Track.prototype.m_uuid = '';                // UUID
Track.prototype.m_startTime = 0;            // Start-Time (as unix-timestamp)
Track.prototype.m_endTime = 0;              // End-Time (as unix-timestamp)
Track.prototype.m_totalDistance = 0;        // Total distance (in meters)
Track.prototype.m_elevationGain = 0;        // Total elevation gain (in meters)
Track.prototype.m_elevationLoss = 0;        // Total elevation loss (in meters)
Track.prototype.m_maximumSpeed = 0;         // Maximum speed (in m/s)
Track.prototype.m_currentWaypoint = null;   // Current waypoint
Track.prototype.m_lastWaypoint = null;      // Last waypoint
Track.prototype.m_pauseTime = 0;            // Total time of pause in this track

/**
 * Add a new position to this track
 */
Track.prototype.addPosition = function( p_position, p_distance, p_bPauseEnd ) {
            // Make sure parameters are treated using the correct type
            p_distance = parseFloat( p_distance );

            // Assign last waypoint
            this.m_lastWaypoint = this.m_currentWaypoint;

            // Create new waypoint for passed position
            this.m_currentWaypoint = new Waypoint();
            this.m_currentWaypoint.m_position = p_position;
            this.m_currentWaypoint.m_timestamp = (p_position.timestamp / 1000).toFixed(0);
            this.m_currentWaypoint.m_bPauseEnd = p_bPauseEnd;

            this.m_endTime = this.m_currentWaypoint.m_timestamp;

            // Remember distance
            this.m_currentWaypoint.m_distance = p_distance;
            this.m_totalDistance += this.m_currentWaypoint.m_distance;

            // Check if this isn't our first waypoint
            if( this.m_lastWaypoint !== null ) {
                // Calculate elevation gain/loss
                this.m_currentWaypoint.m_altitudeDiff = this.m_currentWaypoint.m_position.coords.altitude - this.m_lastWaypoint.m_position.coords.altitude;
                if( this.m_currentWaypoint.m_altitudeDiff > 0 ) {
                    this.m_elevationGain += this.m_currentWaypoint.m_altitudeDiff;
                }
                else {
                    this.m_elevationLoss += Math.abs(this.m_currentWaypoint.m_altitudeDiff);
                }

                // Check if we have a pause
                if( this.m_currentWaypoint.m_bPauseEnd ) {
                    this.m_pauseTime += (this.m_currentWaypoint.m_timestamp - this.m_lastWaypoint.m_timestamp );
                }
            }
            // ... else remember start-time
            else {
                this.m_startTime = this.m_currentWaypoint.m_timestamp;
            }

            // Check for maximum speed
            if( this.m_maximumSpeed < this.m_currentWaypoint.m_position.coords.speed ) {
                this.m_maximumSpeed = this.m_currentWaypoint.m_position.coords.speed;
            }
        }

/**
 * Add heartrate info to current waypoint
 */
Track.prototype.addHeartrate = function( p_heartrate ) {
            if( this.m_currentWaypoint !== null ) {
                this.m_currentWaypoint.m_heartrate = p_heartrate;
            }
        }

/**
 * Return UUID
 */
Track.prototype.getUUID = function() {
            return this.m_uuid;
        }

/**
 * Returns the last (complete) waypoint
 */
Track.prototype.getWaypoint = function() {
            return this.m_lastWaypoint;
        }

/**
 * Returns the current (but maybe not complete) waypoint
 */
Track.prototype.getCurrentWaypoint = function() {
            return this.m_currentWaypoint;
        }

/**
 * Return the start-time
 */
Track.prototype.getStartTime = function() {
            return this.m_startTime;
        }

/**
 * Return the end-time
 */
Track.prototype.getEndTime = function() {
            return this.m_endTime;
        }

/**
 * Return the pause time
 */
Track.prototype.getPauseTime = function() {
            return this.m_pauseTime;
        }

/**
 * Return the total duration
 */
Track.prototype.getDuration = function() {
            return (this.getEndTime() - this.getStartTime());
        }

/**
 * Return the total distance
 */
Track.prototype.getTotalDistance = function() {
            return this.m_totalDistance;
        }

/**
 * Return the maximum speed
 */
Track.prototype.getMaximumSpeed = function() {
            return this.m_maximumSpeed;
        }

/**
 * Return the elevation gain
 */
Track.prototype.getElevationGain = function() {
            return this.m_elevationGain;
        }

/**
 * Return the elevation loss
 */
Track.prototype.getElevationLoss = function() {
            return this.m_elevationLoss;
        }
