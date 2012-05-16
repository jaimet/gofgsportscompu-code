/*
 * Copyright (C) 2011-2012 Wolfgang Koller
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

function Tracks() {
}
Tracks.prototype = new Page( "tracks" );
//Tracks.prototype.leftPage = "settings.html";

Tracks.prototype.oninit = function() {
            // Bind to all events
            $( '#tracks-page' ).live( 'pagebeforeshow', pages.tracks._pagebeforeshow );
        };

/**
 * Helper function for sorting the tracks by date
 */
Tracks.prototype._trackSort = function( a, b ) {
            return ( (a.name === b.name) ? 0 : (a.name > b.name) ? -1 : 1 );
        };

/**
 * Called whenever the page is shown to refresh the list of available tracks
 */
Tracks.prototype._refreshTracksEntries = function( entries ) {
            // Sort entries first
            entries.sort(pages.tracks._trackSort);

            // Fetch reference to tracks-list
            var uList = $( '#tracks-page_list' );
            // Remove any previous items
            uList.html( '' );

            // Status variable for month-headings
            var lastMonthHeading = '';
            var currMonthDivider = null;
            var currMonthTracksCount = 0;

            // Cycle through entries and add them
            for( var i = 0; i < entries.length; i++ ) {
                // Check if we have a valid file entry
                var timestamp = parseInt( entries[i].name.replace( '.gsc', '' ) );
                if( isNaN(timestamp) ) continue;

                // Create date for file
                var formatDate = new Date();
                formatDate.setTime(timestamp * 1000);

                // Check heading
                var monthHeading = formatDate.format( 'mmmm' );
                if( monthHeading !== lastMonthHeading ) {
                    // Create new month divider
                    currMonthDivider = $( '<li data-role="list-divider">' + monthHeading + '</li>' );
                    // Reset tracks-count
                    currMonthTracksCount = 0;

                    // Append new heading item
                    uList.append( currMonthDivider );
                    lastMonthHeading = monthHeading;
                }

                // Create new listItem
                var listItem = $( '<li></li>' );
                listItem.jqmData( 'fileEntry', entries[i] );
                listItem.jqmData( 'displayName', formatDate.format() );
                listItem.append( $('<a href="trackdetail.html"><h3>' + formatDate.format() + '</h3></a>') );

                // Finally append new item to list
                uList.append( listItem );

                // Increase tracks count & update data
                currMonthTracksCount++;
                currMonthDivider.jqmData( 'currMonthTracksCount', currMonthTracksCount );
            }
            // Add count bubbles to month entries
            uList.find( 'li[data-role="list-divider"]' ).each( function( index, value) {
                                                                  $(value).append( '<span class="ui-li-count">' + $(value).jqmData('currMonthTracksCount') + '</span>' );
                                                              } );

            // Refresh tracks-list markup
            uList.listview( 'refresh' );

            // Bind to the click-event of the newly created track entries
            $('#tracks-list-container').find('li').each( function(index) { $(this).bind( 'click', {fileEntry: $(this).jqmData('fileEntry'), displayName: $(this).jqmData('displayName')}, pages.tracks._trackClick ) } );
        };

/**
 * Called when the user clicks on a track entry
 */
Tracks.prototype._trackClick = function(event) {
            pages.trackdetail.setTrack(event.data.fileEntry, event.data.displayName);
        };

/**
 * Called by jQueryMobile just before the page is shown
 */
Tracks.prototype._pagebeforeshow = function( p_event, p_ui ) {
            //$( '#tracks-list-container' ).html('');

            var trackDirectoryReader = GOFGSportsComputer.m_trackDirectoryEntry.createReader();
            trackDirectoryReader.readEntries( pages.tracks._refreshTracksEntries, GOFGSportsComputer._fileSystemError );
        };

new Tracks();
