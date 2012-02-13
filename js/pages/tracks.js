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

Tracks.prototype.oncreate = function() {
	// Bind to all events
	$( '#tracks-page' ).live( 'pagebeforeshow', pages.tracks._pagebeforeshow );
	$( '#tracks-load-button' ).live( 'tap', pages.tracks._loadTrack );
	$( '#tracks-export-fitlog-button' ).live( 'tap', pages.tracks._exportTrackFitlog );
	$( '#tracks-export-gpx-button' ).live( 'tap', pages.tracks._exportTrackGPX );
	$( '#tracks-export-tcx-button' ).live( 'tap', pages.tracks._exportTrackTCX );
	$( '#tracks-delete-button' ).live( 'tap', pages.tracks._deleteTrack );
};

/**
 * Called when loading of a track has finished
 */
Tracks.prototype._loadTrackFinished = function() {
	pages.summary._updateDisplay();
	$.mobile.changePage( "summary.html", { reverse : true } );
};

/**
 * Called when the user wants to load a track
 */
Tracks.prototype._loadTrack = function() {
	console.log( "Loading track!" );
	$.mobile.showPageLoadingMsg();
	
	$( '#tracks-list' ).find( "input[type='radio']" ).each( function() {
		if( $(this).is(":checked") ) {
			TrackHandler.loadTrack( $(this).data( 'fileEntry' ), pages.tracks._loadTrackFinished );
		}
	} );
};

/**
 * Called when the user wants to export a track to fitlog
 */
Tracks.prototype._exportTrackFitlog = function() {
	$( '#tracks-list' ).find( "input[type='radio']" ).each( function() {
		if( $(this).is(":checked") ) {
			// Show loading & start exporting
			$.mobile.loadingMessage = $.i18n.prop( "exportMessage" );
			$.mobile.showPageLoadingMsg();
			exporter.fitlog.run( $(this).data( 'fileEntry' ), function() {
				$.mobile.loadingMessage = $.i18n.prop( "loadingMessage" );
				$.mobile.hidePageLoadingMsg();
			} );
		}
	} );
};

/**
 * Called when the user wants to export a track to GPX
 */
Tracks.prototype._exportTrackGPX = function() {
	$( '#tracks-list' ).find( "input[type='radio']" ).each( function() {
		if( $(this).is(":checked") ) {
			// Show loading & start exporting
			$.mobile.loadingMessage = $.i18n.prop( "exportMessage" );
			$.mobile.showPageLoadingMsg();
			exporter.gpx.run( $(this).data( 'fileEntry' ), function() {
				$.mobile.loadingMessage = $.i18n.prop( "loadingMessage" );
				$.mobile.hidePageLoadingMsg();
			} );
		}
	} );
};

/**
 * Called when the user wants to export a track to TCX
 */
Tracks.prototype._exportTrackTCX = function() {
	$( '#tracks-list' ).find( "input[type='radio']" ).each( function() {
		if( $(this).is(":checked") ) {
			// Show loading & start exporting
			$.mobile.loadingMessage = $.i18n.prop( "exportMessage" );
			$.mobile.showPageLoadingMsg();
			exporter.tcx.run( $(this).data( 'fileEntry' ), function() {
				$.mobile.loadingMessage = $.i18n.prop( "loadingMessage" );
				$.mobile.hidePageLoadingMsg();
			} );
		}
	} );
};

/**
 * Called when the user wants to delete a track
 */
Tracks.prototype._deleteTrack = function() {
	$( '#tracks-list' ).find( "input[type='radio']" ).each( function() {
		if( $(this).is(":checked") ) {
			$(this).data( 'fileEntry' ).remove( pages.tracks._pagebeforeshow );
		}
	} );
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
	
    var containerdiv = $( '<div data-role="fieldcontain">' );
    //var controlgroup = $( '<fieldset data-role="controlgroup" id="tracks-list">' );
    var controlgroup = $( '<ul data-role="listview">' );

	for( var i = 0; i < entries.length; i++ ) {
        //var inputRadio = $( '<input type="radio" name="track-select" id="track-' + entries[i].name + '" value="' + entries[i].name + '" />' );
        var inputRadio = $( '<li></li>' );
        inputRadio.data( 'fileEntry', entries[i] );
		
		// Format date-information
		var timestamp = parseInt( entries[i].name.replace( '.gsc', '' ) );
		var formatDate = new Date();
		formatDate.setTime(timestamp * 1000);

        inputRadio.append( $('<a href="trackdetail.html" data-transition="slide"><h3>' + formatDate.format() + '</h3></a>') );

        controlgroup.append( inputRadio );
        //controlgroup.append( $( '<label for="track-' + entries[i].name + '">' + formatDate.format() + '</label>' ) );
	}

	// Append to page & initialize jQueryMobile content
	containerdiv.append(controlgroup);
	$( '#tracks-list-container' ).append( containerdiv );
	containerdiv.trigger( 'create' );
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
