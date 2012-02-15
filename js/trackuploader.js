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
 * Construct a new TrackUploader object and start uploading immediately
 */
function TrackUploader( p_fileEntry, p_completeCallback ) {
    this.m_completeCallback = p_completeCallback;
    this.m_reader = new TrackReader( p_fileEntry, this._getEvtHandler( this._loadProgress ), this._getEvtHandler( this._loadComplete ) );
}

TrackUploader.prototype.m_reader = null;                // Reference to internal TrackReader object
TrackUploader.prototype.m_totalDistance = 0;            // Total distance counter
TrackUploader.prototype.m_startTime = 0;                // Start-Time of this track
TrackUploader.prototype.m_endTime = 0;                  // End-Time of this track
TrackUploader.prototype.m_completeCallback = null;      // Callback which is called once the track loading has finished

/**
 * Called by the TrackReader object whenever there is a new waypoint ready
 */
TrackUploader.prototype._loadProgress = function( p_waypoint ) {
    if( this.m_startTime == 0 ) this.m_startTime = p_waypoint.timestamp;

    this.m_endTime = p_waypoint.timestamp;
    this.m_totalDistance += p_waypoint.distance;
};

/**
 * Called by the TrackReader object when the track has finished loading
 */
TrackUploader.prototype._loadComplete = function( p_uuid ) {
    var passdata = {
        method: "add",
        params: JSON.stringify( { auth_key: "12345", start_time: this.m_startTime, end_time: this.m_endTime, total_distance: this.m_totalDistance, uuid: p_uuid } ),
        id: "12345",
        option: "com_gofgsportstracker",
        task: "jsonrpc.request",
    };

    var trackuploadurl = "http://localhost/joomla/index.php";

    var jqxhr = $.get( trackuploadurl, passdata, function(data) { console.log( 'success:' + data ); }, 'jsonp' );

    // Dispatch the request to the portal
    /*$.ajax( trackuploadurl, {
               data: passdata,
               success: function(data, textStatus, jqXHR) { console.log("success!"); },
               error: function(jqXHR, textStatus, errorThrown) { console.log("error: " + jqXHR.getAllResponseHeaders() + " / " + textStatus + " / " + errorThrown); },
               complete: function(jqXHR, textStatus) { console.log("complete: " + jqXHR.status + " / " + jqXHR.readyState ) },
               dataType: "json",
               beforeSend: function(jqXHR, settings) { jqXHR.setRequestHeader( "Connection", "Close" ) },
               type: 'GET',
           } );*/

    // Execute the complete-Callback
    if(typeof this.m_completeCallback === "function" ) this.m_completeCallback();
};

/**
 * Internal helper function for creating an event-handler function which provides the original "this"-context
 */
TrackUploader.prototype._getEvtHandler = function( p_callback ) {
    var me = this;
    return (function( parameter ) { p_callback.call(me, parameter) } );
};
