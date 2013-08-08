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
 * Wrapper object for W3C coordinates
 * http://dev.w3.org/geo/api/spec-source.html#coordinates_interface
 */
function gofg_coordinates() {
	
}
gofg_coordinates.prototype.latitude = 0;
gofg_coordinates.prototype.longitude = 0;
gofg_coordinates.prototype.altitude = 0;
gofg_coordinates.prototype.accuracy = 0;
gofg_coordinates.prototype.altitudeAccuracy = 0;
gofg_coordinates.prototype.heading = 0;
gofg_coordinates.prototype.speed = 0;

/**
 * Wrapper object for W3C position
 * http://dev.w3.org/geo/api/spec-source.html#position_interface
 */
function gofg_position() {
	this.coords = new gofg_coordinates();
	this.timestamp = Utilities.getUnixTimestamp() * 1000;
}
gofg_position.prototype.timestamp = 0;
gofg_position.prototype.coords = null;

/**
 * Clone a given position object and return it as gofg_position
 */
gofg_position.clone = function(p_position) {
	var position = new gofg_position();
	position.timestamp = p_position.timestamp;
	position.coords.latitude = p_position.coords.latitude;
	position.coords.longitude = p_position.coords.longitude;
	position.coords.altitude = p_position.coords.altitude;
	position.coords.accuracy = p_position.coords.accuracy;
	position.coords.altitudeAccuracy = p_position.coords.altitudeAccuracy;
	position.coords.heading = p_position.coords.heading;
	position.coords.speed = p_position.coords.speed;
	
	return position;
}
