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
	return ( (a.name == b.name) ? 0 : (a.name > b.name) ? 1 : -1 );
};

/**
 * Called whenever the page is shown to refresh the list of available tracks
 */
Tracks.prototype._refreshTracksEntries = function( entries ) {
	entries.sort(pages.tracks._trackSort);
	
    var containerdiv = $( '<div>' );
    //var controlgroup = $( '<fieldset data-role="controlgroup" id="tracks-list">' );
    var uList = $( '<ul data-role="listview">' );

	for( var i = 0; i < entries.length; i++ ) {
        //var inputRadio = $( '<input type="radio" name="track-select" id="track-' + entries[i].name + '" value="' + entries[i].name + '" />' );
        var listItem = $( '<li></li>' );
        listItem.jqmData( 'fileEntry', entries[i] );
		
		// Format date-information
		var timestamp = parseInt( entries[i].name.replace( '.gsc', '' ) );
		var formatDate = new Date();
		formatDate.setTime(timestamp * 1000);
        listItem.jqmData( 'displayName', formatDate.format() );

        listItem.append( $('<a href="trackdetail.html" data-transition="slide"><h3>' + formatDate.format() + '</h3></a>') );

        uList.append( listItem );
        //controlgroup.append( $( '<label for="track-' + entries[i].name + '">' + formatDate.format() + '</label>' ) );
	}

	// Append to page & initialize jQueryMobile content
    containerdiv.append(uList);
	$( '#tracks-list-container' ).append( containerdiv );
	containerdiv.trigger( 'create' );

    // Bind to the tap-event of the newly created track entries
    $('#tracks-list-container').find('li').each( function(index) { $(this).bind( 'tap', {fileEntry: $(this).jqmData('fileEntry'), displayName: $(this).jqmData('displayName')}, pages.tracks._trackTap ) } );
    //bind( 'tap', pages.tracks._trackTap );
};

Tracks.prototype._trackTap = function(event) {
    pages.trackdetail.setTrack(event.data.fileEntry, event.data.displayName);
};

/**
 * Called by jQueryMobile just before the page is shown
 */
Tracks.prototype._pagebeforeshow = function( p_event, p_ui ) {
	$( '#tracks-list-container' ).html('');

	var trackDirectoryReader = TrackHandler.getDirectory().createReader();
	trackDirectoryReader.readEntries( pages.tracks._refreshTracksEntries, GOFGSportsComputer._fileSystemError );
};

new Tracks();
