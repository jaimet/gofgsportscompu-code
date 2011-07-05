/*
 * Copyright (C) 2011 Wolfgang Koller
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

// Check if the pages namespace exists
if( pages == undefined ) {
	var pages = {};
}

pages.tracks = {
		init : function() {
			console.log( "tracks-page loaded!" );
			
			$( '#tracks-page' ).live( 'pagebeforeshow', pages.tracks._pagebeforeshow );
			$( '#tracks-load-button' ).live( 'tap', pages.tracks._loadTrack );
		},
		
		_loadTrackFinished : function() {
			pages.summary._updateDisplay();
			$.mobile.changePage( "summary.html" );
		},
		
		_loadTrack : function() {
			console.log( "Loading track!" );
			$.mobile.showPageLoadingMsg();
			
			$( '#tracks-list' ).find( "input[type='radio']" ).each( function() {
				if( $(this).is(":checked") ) {
					TrackHandler.loadTrack( $(this).data( 'fileEntry' ), pages.tracks._loadTrackFinished );
				}
			} );
		},
		
		_refreshTracksEntries : function( entries ) {
			var containerdiv = $( '<div data-role="fieldcontain">' );
			var controlgroup = $( '<fieldset data-role="controlgroup" id="tracks-list">' );

			for( var i = 0; i < entries.length; i++ ) {
				var inputRadio = $( '<input type="radio" name="track-select" id="track-' + entries[i].name + '" value="' + entries[i].name + '" />' );
				inputRadio.data( 'fileEntry', entries[i] );

				controlgroup.append( inputRadio );
				controlgroup.append( $( '<label for="track-' + entries[i].name + '">' + entries[i].name + '</label>' ) );
			}

			//$( "input[type='radio']" ).checkboxradio();
			containerdiv.append(controlgroup);
			containerdiv.page();

			$( '#tracks-list' ).append( containerdiv );
		},

		_pagebeforeshow : function( p_event, p_ui ) {
			$( '#tracks-list' ).html('');

			var trackDirectoryReader = TrackHandler.getDirectory().createReader();
			trackDirectoryReader.readEntries( pages.tracks._refreshTracksEntries, GOFGSportsComputer._fileSystemError );
		},
};
