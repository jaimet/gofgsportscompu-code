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
 * Small helper class for handling a waypoint including all extra information attached to it
 */
function Waypoint() {
    this.m_timestamp = ((new Date()).getTime() / 1000).toFixed(0);
}

Waypoint.prototype.m_position = null;   // Position object representing all position relevant data (see W3C spec)
Waypoint.prototype.m_heartrate = 0;     // Current heart-rate of this point
Waypoint.prototype.m_distance = 0;      // Distance to previous waypoint
Waypoint.prototype.m_altitudeDiff = 0;  // Altitude diff to last waypoint
Waypoint.prototype.m_timestamp = 0;     // Unix-Timestamp of creation-date
