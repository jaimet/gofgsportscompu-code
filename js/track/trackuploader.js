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
function TrackUploader( p_authKey, p_fileEntry, p_successCallback, p_errorCallback ) {
    this.m_authKey = p_authKey;
    this.m_successCallback = p_successCallback;
    this.m_errorCallback = p_errorCallback;
    this.m_reader = new TrackReader( p_fileEntry, null, Utilities.getEvtHandler( this, this._loadComplete ) );
}

TrackUploader.prototype.m_reader = null;                // Reference to internal TrackReader object
TrackUploader.prototype.m_successCallback = null;       // Callback which is called once the track loading has successfully finished
TrackUploader.prototype.m_errorCallback = null;         // Callback which is called if there was an error
TrackUploader.prototype.m_authKey = null;               // Authentication key to use when uploading the track

TrackUploader.URL = "http://192.168.56.101/joomla/index.php";   // Static value which references the upload URL of the gofg homepage

/**
 * Called by the TrackReader object when the track has finished loading
 */
TrackUploader.prototype._loadComplete = function( p_track ) {
            // Configure passed parameters to the webapp
            var passdata = {
                method: "add",
                params: JSON.stringify( { auth_key: this.m_authKey, start_time: p_track.getStartTime(), end_time: p_track.getEndTime(), total_distance: p_track.getTotalDistance(), uuid: p_track.getUUID() } ),
                id: (Math.random() * 10000).toFixed(0),
                option: "com_gofgsportstracker",
                task: "jsonrpc.request",
            };

            // Setup ajax-request parameters
            $.ajaxSetup( {
                            timeout: 5000
                        }
                        );

            // Upload track to gofg community page
            $.get( TrackUploader.URL, passdata, Utilities.getEvtHandler( this, function(data) {
                                                                            if( typeof this.m_successCallback === "function" ) this.m_successCallback();
                                                                        } ),
                  'jsonp'
                  ).error( Utilities.getEvtHandler( this, function(jqXHR, textStatus, errorThrown) {
                                                       console.log( 'error: ' + errorThrown );
                                                       if( typeof this.m_errorCallback === "function" ) this.m_errorCallback( textStatus );
                                                   } )
                          );
        };
