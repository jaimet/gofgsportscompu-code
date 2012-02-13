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

function Trackdetail() {
}
Trackdetail.prototype = new Page( "trackdetail" );
Trackdetail.prototype.m_filename = null;

// Register button event
Trackdetail.prototype.oncreate = function() {
    $( '#trackdetail-page' ).live( 'pagebeforeshow', pages.trackdetail._pagebeforeshow );
}

Trackdetail.prototype.setTrack = function( p_filename ) {
    // Store filename
    pages.trackdetail.m_filename = p_filename;
}

Trackdetail.prototype._pagebeforeshow = function() {
    // Load track details
}

new Trackdetail();	// Create single instance
