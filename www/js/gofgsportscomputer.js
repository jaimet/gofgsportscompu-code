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

var GOFGSportsComputer = {
	m_persistentFileSystem : null,	// Reference to the persistent file-system
	m_appDirectoryEntry : null,		// Reference to the app directory entry
	m_trackDirectoryEntry : null,	// Reference to the track directory entry
	m_exportDirectoryEntry : null,	// Reference to the export directory entry
		
	/**
	 * Startup function which setups the sports computer software (init, interface, etc.)
	 */
	_systemReady : function() {
		console.log( "Startup code running..." );

		// Initialize the page handlers
		// change me
		$( '#summary-page' ).live( 'pagecreate', pages.summary.init );
		$( '#settings-page' ).live( 'pagecreate', pages.settings.init );
		$( '#tracks-page' ).live( 'pagecreate', pages.tracks.init );
		
		// Calculate available height based on empty loading page
		var availableHeight = $( '#empty-page' ).height();
		console.log( availableHeight );
		availableHeight -= $( '#empty-page > [data-role="header"]' ).outerHeight( true );
		console.log( availableHeight );
		availableHeight -= ($( '#empty-page > [data-role="content"]' ).outerHeight( true ) - $( '#empty-page > [data-role="content"]' ).height());
		console.log( availableHeight );
		availableHeight -= $( '#empty-button' ).outerHeight( true );
		console.log( availableHeight );
		// Save available height as internal variable
		pages.summary.m_contentHeight = availableHeight;

		if( SettingsHandler.get( "licenseagreed" ) == 0 ) {
			$.mobile.changePage( 'license.html' );
		}
		else {
			// Change to summary page
			$.mobile.changePage( 'summary.html' );
		}
		
		
		// Find our file storage
		window.requestFileSystem( LocalFileSystem.PERSISTENT, 0, GOFGSportsComputer._fileSystem, GOFGSportsComputer._fileSystemError );

		console.log( "Up and running!" );
	},
	
	_fileSystem : function( p_fileSystem ) {
		GOFGSportsComputer.m_persistentFileSystem = p_fileSystem;
		
		// Make sure our app data folder exist
		GOFGSportsComputer.m_persistentFileSystem.root.getDirectory( "at.gofg.sportscomputer", { create : true, exclusive : false }, GOFGSportsComputer._appDirectory, GOFGSportsComputer._appDirectoryError );
	},

	/**
	 * Called when the app directory was successfully accessed and is ready for use
	 */
	_appDirectory : function( p_directoryEntry ) {
		GOFGSportsComputer.m_appDirectoryEntry = p_directoryEntry;
		
		// Get the track folder entry
		GOFGSportsComputer.m_appDirectoryEntry.getDirectory( "tracks", { create : true, exclusive : false }, GOFGSportsComputer._trackDirectory, GOFGSportsComputer._trackDirectoryError );
		// Get the export folder entry
		GOFGSportsComputer.m_appDirectoryEntry.getDirectory( "exports", { create : true, exclusive : false }, GOFGSportsComputer._exportDirectory, GOFGSportsComputer._exportDirectoryError );
		
		// Initialize settings handler
		SettingsHandler.init( GOFGSportsComputer.m_appDirectoryEntry );
	},
	
	/**
	 * Called when the application directory could now be accessed, will fall back to default directory then
	 */
	_appDirectoryError : function( p_fileError ) {
		GOFGSportsComputer._fileSystemError(p_fileError);
		
		// Fallback to default root directory
		GOFGSportsComputer._appDirectory(GOFGSportsComputer.m_persistentFileSystem.root);
	},
	
	/**
	 * Called when the track directory was successfully accessed and is ready for use
	 */
	_trackDirectory : function( p_directoryEntry ) {
		GOFGSportsComputer.m_trackDirectoryEntry = p_directoryEntry;
		
		// Initialize our track-handler with the dir
		TrackHandler.setDirectory(GOFGSportsComputer.m_trackDirectoryEntry);
	},
	
	/**
	 * Called when the track directory could now be accessed, will fall back to app directory then
	 */
	_trackDirectoryError : function( p_fileError ) {
		GOFGSportsComputer._fileSystemError(p_fileError);
		
		// Fallback to the app directory
		GOFGSportsComputer._trackDirectory(GOFGSportsComputer.m_appDirectoryEntry);
	},
	
	/**
	 * Called when the export directory was successfully accessed and is ready for use
	 */
	_exportDirectory : function( p_directoryEntry ) {
		GOFGSportsComputer.m_exportDirectoryEntry = p_directoryEntry;
		
		// Set the export directory
		TrackHandler.setExportDirectory(GOFGSportsComputer.m_exportDirectoryEntry);
	},
	
	/**
	 * Called when the export directory could now be accessed, will fall back to app directory then
	 */
	_exportDirectoryError : function( p_fileError ) {
		GOFGSportsComputer._fileSystemError(p_fileError);
		
		// Fallback to the app directory
		GOFGSportsComputer._exportDirectory(GOFGSportsComputer.m_appDirectoryEntry);
	},
	
	/**
	 * Simple error handler for any FileErrors that might occur
	 */
	_fileSystemError : function( p_fileError ) {
		console.log( "Error while operating on the file-system: " + p_fileError.code );
	}
};

/**
 * Helper function for formatting a given time
 * @param p_hours Hours of time
 * @param p_minutes Minutes of time
 * @param p_seconds Seconds of time
 * @param p_bSeconds Wheter to include seconds in the string or not
 * @returns String Formatted string which contains the time
 */
function getFormattedTime( p_hours, p_minutes, p_seconds, p_bSeconds ) {
	var formattedTime = p_hours;
	
	if( p_hours < 10 ) formattedTime = "0" + p_hours;
	
	if( p_minutes < 10 ) {
		formattedTime += ":0" + p_minutes;
	}
	else {
		formattedTime += ":" + p_minutes;
	}
	
	if( p_bSeconds ) {
		if( p_seconds < 10 ) {
			formattedTime += ":0" + p_seconds;
		}
		else {
			formattedTime += ":" + p_seconds;
		}
	}
	
	return formattedTime;
}

function formatDate( p_date, p_bSeconds ) {
	return getFormattedTime( p_date.getHours(), p_date.getMinutes(), p_date.getSeconds(), p_bSeconds);
}

function getFormattedTimeDiff( p_timeDiff ) {
	var hours = parseInt(p_timeDiff / 3600);
	p_timeDiff -= 3600 * hours;
	var minutes = parseInt(p_timeDiff / 60);
	var seconds = p_timeDiff - minutes * 60;
	
	return getFormattedTime( hours, minutes, seconds, true );
}

/**
 * Application starts here
 */
$(document).ready( function() {
	document.addEventListener("deviceready", GOFGSportsComputer._systemReady, true);

	/**
	 * WARNING: TESTING AREA AHEAD
	 */
//	// Prepare our summary page
//	$( '#summary-page' ).bind( 'pagebeforeshow', function() {
//		$( '#navbar-buttons-summary > li > a' ).removeClass( 'ui-btn-active' );
//		$( '#navbar-buttons-summary > li > a[data-navbar="summary"]' ).addClass( 'ui-btn-active' );
//	} );
//	$( '#summary-page' ).bind( 'pageshow', function() {
//		$( 'body > div[data-role="page"][id!="summary-page"]' ).remove();
//	} );
//	prepareNavbar( 'summary' );
	
	
	
//	$( '#navbar-settings' ).bind( 'click', function() {
//		$( '#home-content' ).load( 'test.html', function(responseText, textStatus, XMLHttpRequest) {
//			alert( "Request completed: " + responseText + " / " + textStatus );
//		} );
//	});
			
	//TrackHandler.addSpeed( 10 );
	//updateDistance();
	//setTimeout( "GOFGSportsComputer._systemReady()", 1000 );
	//GOFGSportsComputer._systemReady();
//	var xmlRoot = $( '<customTag>should not be visible</customTag>' );
//	var xmlSub = $( '<subCustomTag attribute="value">My Tag content</subCustomTag>' );
//	xmlRoot.append( xmlSub );
//	alert( xmlRoot.html() );
//	var e = 1;
} );

