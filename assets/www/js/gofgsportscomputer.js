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
	m_mainTimer : 0,	// Reference for the main timer
	m_persistentFileSystem : null,	// Reference to the persistent file-system
	m_appDirectoryEntry : null,		// Reference to the app directory entry
	m_trackDirectoryEntry : null,	// Reference to the track directory entry
	m_contentHeight : 0,			// Calculated maximum height for content
		
	/**
	 * Updates the clock (called once a minute)
	 */
	updateClock : function() {
		$( '#clock-infopanel' ).infopanel( 'setValue', formatDate( new Date() ) );
		setTimeout( "GOFGSportsComputer.updateClock()", 60000 );
	},
	
	/**
	 * Callback for the GPSHandler which is called whenever the GPS position is updated
	 */
	updatePosition : function() {
		//console.log( "updatePosition" );
		TrackHandler.addDistance( GPSHandler.getDistance() );
		TrackHandler.addSpeed( GPSHandler.getSpeed() );
		TrackHandler.addPosition( GPSHandler.getLatitude(), GPSHandler.getLongitude(), GPSHandler.getAltitude() );
		TrackHandler.addAccuracy( GPSHandler.getAccuracy() );
		
		$( '#speed-infopanel' ).infopanel( 'setValue', (GPSHandler.getSpeed() * 3.6).toFixed(2) );
		$( '#distance-infopanel' ).infopanel( 'setValue', (TrackHandler.getTotalDistance() / 1000.0).toFixed(2) );
		$( '#altitude-infopanel' ).infopanel( 'setValue', TrackHandler.getElevationGain().toFixed(2) );
		$( '#status-infopanel' ).infopanel( 'setValue', GPSHandler.getAccuracy() );
	},
	
	/**
	 * Update the display of the app (regular interval, once a second)
	 */
	updateDisplay : function() {
		//console.log( "updateDisplay" );
		
		//var diffDate = new Date();
		//diffDate.setTime( TrackHandler.getDuration() * 1000 );
		
		$( '#timer-infopanel' ).infopanel( 'setValue', getFormattedTimeDiff(TrackHandler.getDuration(), true) );
		
		GOFGSportsComputer.m_mainTimer = setTimeout( "GOFGSportsComputer.updateDisplay()", 1000 );
	},

	/**
	 * Button onClick-handler for starting GPS tracking
	 */
	startGPS : function() {
		console.log( "Start-GPS called" );
		
		$( '#stop-button' ).show();
		$( '#start-button' ).hide();
		
		TrackHandler.startTrack();
		GPSHandler.startGPS( 5, GOFGSportsComputer.updatePosition );
		window.plugins.PowerManagement.acquire(
	    	function(){ console.log( "Success!" ) },
			function(e){ console.log( "Error: " + e ) }
		);
		
		// Start updating our interface
		GOFGSportsComputer.updateDisplay();
	},

	/**
	 * Button onClick-handler for stopping GPS tracking
	 */
	stopGPS : function() {
		console.log( "Stop-GPS called" );
		
		$( '#start-button' ).show();
		$( '#stop-button' ).hide();
		
		GPSHandler.stopGPS();
		TrackHandler.stopTrack();
		window.plugins.PowerManagement.release(
	    	function(){ console.log( "Success!" ) },
			function(e){ console.log( "Error: " + e ) }
		);
		
		// Disable interface timer
		if( GOFGSportsComputer.m_mainTimer != 0 ) clearTimeout(GOFGSportsComputer.m_mainTimer);
		GOFGSportsComputer.m_mainTimer = 0;
	},
	
	_refreshTracks : function() {
		//alert( 'Refreshing!' );
		$( '#tracks-list' ).html('');
		
		var trackDirectoryReader = GOFGSportsComputer.m_trackDirectoryEntry.createReader();
		
		trackDirectoryReader.readEntries( GOFGSportsComputer._refreshTracksEntries, GOFGSportsComputer._fileSystemError );
	},
	
	_refreshTracksEntries : function( entries ) {
		console.log( 'Refreshing!' );
		
//		<div data-role="fieldcontain">
//		<fieldset data-role="controlgroup" id="tracks-list">
//		</fieldset>
//	</div>
		var containerdiv = $( '<div data-role="fieldcontain">' );
		var controlgroup = $( '<fieldset data-role="controlgroup" id="tracks-list">' );
		
		for( var i = 0; i < entries.length; i++ ) {
			console.log('Got entry: ' + entries[i].name);
			
			controlgroup.append( $( '<input type="radio" name="track-select" id="track-' + entries[i].name + '" value="' + entries[i].name + '" />' ) );
			controlgroup.append( $( '<label for="track-' + entries[i].name + '">' + entries[i].name + '</label>' ) );
		}
		
		//$( "input[type='radio']" ).checkboxradio();
		containerdiv.append(controlgroup);
		containerdiv.page();
		
		$( '#tracks-list' ).append( containerdiv );
	},
	
	_summaryInit : function() {
		// Apply layout to all info-panels
		//var rowHeight = (availableHeight / 3).toFixed(0);
		var rowHeight = (GOFGSportsComputer.m_contentHeight / 3).toFixed(0);
		console.log( "Row height: " + rowHeight );

		// Distance infopanel
		$( '#distance-infopanel' ).infopanel( {
			'value' : '0.00',
			'size' : { 'width' : 'auto', 'height' : rowHeight },
			'image' : 'images/web24.png',
			'unit' : 'km'
		} );
		
		// Clock infopanel
		$( '#clock-infopanel' ).infopanel( {
			'value' : formatDate( new Date() ),
			'size' : { 'width' : 'auto', 'height' : (GOFGSportsComputer.m_contentHeight - 2 * rowHeight) },
			'image' : 'images/clock24.png',
			'unit' : 'hh:mm'
		} );
		// Add clock timer
		GOFGSportsComputer.updateClock();
		
		// Timer infopanel
		$( '#timer-infopanel' ).infopanel( {
			'value' : '00:00:00',
			'size' : { 'width' : 'auto', 'height' : (GOFGSportsComputer.m_contentHeight - 2 * rowHeight) },
			'image' : 'images/timer24.png',
			'unit' : 'hh:mm:ss'
		} );

		// Speed infopanel
		$( '#speed-infopanel' ).infopanel( {
			'value' : '0.00',
			'size' : { 'width' : 'auto', 'height' : rowHeight },
			'image' : 'images/gowebsite24.png',
			'unit' : 'km/h'
		} );

		// Altitude infopanel
		$( '#altitude-infopanel' ).infopanel( {
			'value' : '0.00',
			'size' : { 'width' : 'auto', 'height' : rowHeight },
			'image' : 'images/pictures24.png',
			'unit' : 'm'
		} );

		// Status infopanel
		$( '#status-infopanel' ).infopanel( {
			'value' : '-',
			'size' : { 'width' : 'auto', 'height' : rowHeight },
			'image' : 'images/find24.png',
			'unit' : 'Accuracy (m)'
		} );

		// Setup top toolbar
		$( '#stop-button' ).hide();
		$( '#stop-button' ).live( 'tap', GOFGSportsComputer.stopGPS );
		$( '#start-button' ).live( 'tap', GOFGSportsComputer.startGPS );
		
		// Remove init handler
		$( '#summary-page' ).die( 'pageshow', GOFGSportsComputer._summaryInit );
	},

	/**
	 * Startup function which setups the sports computer software (init, interface, etc.)
	 */
	_systemReady : function() {
		console.log( "Startup code running..." );

		// Calculate available heigh based on empty loading page
		var availableHeight = $( '#empty-page' ).height();
		availableHeight -= $( '#empty-page > [data-role="header"]' ).outerHeight();
		availableHeight -= $( '#empty-page > [data-role="footer"]' ).outerHeight();
		availableHeight -= ($( '#empty-page > [data-role="content"]' ).outerHeight() - $( '#summary-page > [data-role="content"]' ).height());
		// Save available height as internal variable
		GOFGSportsComputer.m_contentHeight = availableHeight;
		
		// Add our page events
		$( '#tracks-page' ).live( 'pagebeforeshow', GOFGSportsComputer._refreshTracks );
		$( '#summary-page' ).live( 'pageshow', GOFGSportsComputer._summaryInit );
		
		// Change to summary page
		$.mobile.changePage( 'summary.html', { transition : 'pop' } );
		
		// Find our file storage
		window.requestFileSystem( LocalFileSystem.PERSISTENT, 0, GOFGSportsComputer._fileSystem, GOFGSportsComputer._fileSystemError );

		console.log( "Up and running!" );
	},
	
	_fileSystem : function( p_fileSystem ) {
		GOFGSportsComputer.m_persistentFileSystem = p_fileSystem;
		
		// Make sure our app data folder exist
		GOFGSportsComputer.m_persistentFileSystem.root.getDirectory( "at.gofg.sportscomputer", { create : true, exclusive : false }, GOFGSportsComputer._appDirectory, GOFGSportsComputer._appDirectoryError );
		
//		console.log( "FileSystem Name: " + TrackHandler.m_persistentFileSystem.name );
//		console.log( "FileSystem Root Name: " + TrackHandler.m_persistentFileSystem.root.name );
	},

	/**
	 * Called when the app directory was successfully accessed and is ready for use
	 */
	_appDirectory : function( p_directoryEntry ) {
		GOFGSportsComputer.m_appDirectoryEntry = p_directoryEntry;
		
		// Get the track folder entry
		GOFGSportsComputer.m_appDirectoryEntry.getDirectory( "tracks", { create : true, exclusive : false }, GOFGSportsComputer._trackDirectory, GOFGSportsComputer._trackDirectoryError );
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

//function prepareNavbar( p_activeTarget ) {
//	
//	// Bind the load page function for each navbar button
//	$( '#navbar-buttons-' + p_activeTarget + ' > li > a' ).each( function(index, Element) {
//		var target = $(this).attr( 'data-navbar' );
//		
//		// Ignore links to ourself
//		if( target == p_activeTarget ) return;
//		
//		console.log( "Found target: " + target );
//		
//		if( target == "summary" ) {
//			$(this).bind( 'click', function() {
//				$.mobile.changePage( $( '#summary-page' ) );
//
////				$( '#navbar-buttons-summary > li > a' ).removeClass( 'ui-btn-active' );
////				$(this).addClass( 'ui-btn-active' );
//			} );
//		}
//		else {
//			$(this).bind( 'click', function() {
//				$.mobile.showPageLoadingMsg();
//				$.get( target + '.html', '', function(data, textStatus, jqXHR) {
//					$( 'body' ).append( data );
//					//alert( 'Loaded: ' + textStatus );
//					
//					$('#' + target + '-page').bind( 'pageshow', function() {
//						console.log( 'pageshow of ' + $(this).attr( 'id' ) );
//						
//						$( 'body > div[data-role="page"][id!="summary-page"][id!="' + target + '-page"]' ).remove();
//						prepareNavbar( target );
//					} );
//					
//					$.mobile.changePage( $('#' + target + '-page') );
//					// Remove any unused pages
//					//$( 'body > div[data-role="page"][id!="home-page"]' ).remove();
//				}, 'html' );
//			} );
//		}
//	} );
//}

/**
 * Application starts here
 */
$(document).ready( function() {
	document.addEventListener("deviceready", GOFGSportsComputer._systemReady, true);
	
	// Before showing the tracks-page, we want to refresh the list of tracks
	//$( '#tracks-page' ).bind( 'pagebeforeshow', GOFGSportsComputer._refreshTracks );
	
	
//	$( '#test-button' ).bind( 'click', function() {
//		$.mobile.changePage( 'test.html', {
//			pageContainer : $( '#home-content' )
//		} );
//	} );



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

