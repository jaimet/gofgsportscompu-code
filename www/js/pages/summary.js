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

function Summary() {
}
Summary.prototype = new Page( "summary" );

Summary.prototype.m_mainTimer = 0;
Summary.prototype.m_contentHeight = 0;
Summary.prototype.m_speedTimer = 0;
Summary.prototype.m_pauseStart = 0;
//Summary.prototype.rightPage = "settings.html";

Summary.prototype.oncreate = function() {
	// Listen to events
	$( '#stop-button' ).live( 'tap', pages.summary._stopGPS );
	$( '#start-button' ).live( 'tap', pages.summary._startGPS );
	$( '#pause-button' ).live( 'tap', pages.summary._pause );
	$( '#resume-button' ).live( 'tap', pages.summary._resume );
	$( '#lock-button' ).live( 'tap', pages.summary._lock );
	
	$( '#summary-page' ).live( 'pageshow', pages.summary._pageshow );
};

Summary.prototype._mainTimer = function() {
	// Update display
	pages.summary._updateDisplay();
	
	// Start our timers
	pages.summary.m_mainTimer = setTimeout( "pages.summary._mainTimer()", 1000 );
};

/**
 * Called when the speed timeout is reached (resets speed display)
 */
Summary.prototype._speedTimer = function() {
	$( '#speed-infopanel' ).infopanel( 'setValue', '0.00' );
}

/**
 * Update the display of the app (regular interval, once a second)
 */
Summary.prototype._updateDisplay = function() {
	$( '#speed-infopanel' ).infopanel( 'setValue', (TrackHandler.getSpeed() * 3.6).toFixed(2) );
	$( '#speed-infopanel' ).infopanel( 'setStatistics', (TrackHandler.getAverageSpeed() * 3.6).toFixed(2), (TrackHandler.getMaximumSpeed() * 3.6).toFixed(2) );
	$( '#distance-infopanel' ).infopanel( 'setValue', (TrackHandler.getTotalDistance() / 1000.0).toFixed(2) );
	$( '#altitude-infopanel' ).infopanel( 'setValue', TrackHandler.getElevationGain().toFixed(2) );
	$( '#altitude-infopanel' ).infopanel( 'setInfo', TrackHandler.getElevationRise().toFixed(2) + "% / &Oslash; " + TrackHandler.getAverageElevationRise().toFixed(2) + "%" );
	
	var averageAccuracy = (TrackHandler.getAccuracy() + TrackHandler.getAltitudeAccuracy()) / 2.0;
	var minimumAccuracy = SettingsHandler.get( 'minimumaccuracy' );
	
	if( averageAccuracy <= (minimumAccuracy / 2.0) ) {
		$( '#status-infopanel' ).infopanel( 'setValueImage', 'images/wirelessSignalExcellent48.png', 48, 48 );
	}
	else if( averageAccuracy <= minimumAccuracy ) {
		$( '#status-infopanel' ).infopanel( 'setValueImage', 'images/wirelessSignalGood48.png', 48, 48 );
	}
	else {
		$( '#status-infopanel' ).infopanel( 'setValueImage', 'images/wirelessSignalBad48.png', 48, 48 );
	}
	
	//$( '#status-infopanel' ).infopanel( 'setValue', TrackHandler.getAccuracy() + " / " + TrackHandler.getAltitudeAccuracy() );
	$( '#timer-infopanel' ).infopanel( 'setValue', getFormattedTimeDiff(TrackHandler.getDuration(), true) );
};

/**
 * Update & display odo value
 */
Summary.prototype._updateOdo = function( p_distance ) {
	var odo = parseFloat(window.localStorage.getItem( "odo" ));
	if(isNaN(odo) ) odo = 0;

	if( p_distance != undefined ) {
		odo += p_distance;
	}
	window.localStorage.setItem( "odo", odo );
	
	$( '#distance-infopanel' ).infopanel( 'setInfo', "odo: " + (odo / 1000.0).toFixed(2) + "km" );
};

/**
 * Button onClick-handler for starting GPS tracking
 */
Summary.prototype._startGPS = function() {
	console.log( "Start-GPS called" );
	
	// Switch button display
	$( '#start-button' ).hide();
	$( '#stop-button' ).show();
	$( '#settings-button' ).hide();
	
	// Update accuracy status image
	$( '#status-infopanel' ).infopanel( 'setValueImage', 'images/wirelessSignalBad48.png', 48, 48 );

	// Start GPS
	GPSHandler.startGPS( SettingsHandler.get( 'gpsInterval' ) );
	// Disable idle mode
	window.plugins.PowerManagement.acquire(
	    	function(){ console.log( "Success!" ) },
			function(e){ console.log( "Error: " + e ) }
	);
		
	// Check if we have to wait for a GPS fix first
	if( SettingsHandler.get( 'waitForGPSFix' ) == 'yes' ) {
		GPSHandler.setCallback( pages.summary._gpsFixWait );
	}
	else {
		pages.summary._startTracking();
	}
};

/**
 * Simple helper function which waits for the first GPS fix and starts the track once called
 */
Summary.prototype._gpsFixWait = function() {
	pages.summary._startTracking();
};

/**
 * Start the real tracking
 */
Summary.prototype._startTracking = function() {
	TrackHandler.startTrack();
	GPSHandler.setCallback( pages.summary._updatePosition );
	
	// Display pause button
	setTimeout( "$( '#pause-button' ).fadeIn( 'slow' );", 500 );
	
	// Start updating our interface
	pages.summary._mainTimer();
};

/**
 * Button onClick-handler for stopping GPS tracking
 */
Summary.prototype._stopGPS = function() {
	console.log( "Stop-GPS called" );
	
	// Switch button display
	$( '#start-button' ).show();
	$( '#stop-button' ).hide();
	$( '#pause-button' ).hide();
	$( '#settings-button' ).show();
	
	GPSHandler.stopGPS();
	TrackHandler.stopTrack();
	window.plugins.PowerManagement.release(
    	function(){ console.log( "Success!" ) },
		function(e){ console.log( "Error: " + e ) }
	);
	
	// Disable interface timer
	if( pages.summary.m_mainTimer != 0 ) clearTimeout(pages.summary.m_mainTimer);
	pages.summary.m_mainTimer = 0;
	
	// Update accuracy status image
	$( '#status-infopanel' ).infopanel( 'setValueImage', 'images/wirelessSignalOff48.png', 48, 48 );
};

/**
 * Called when the pause button is clicked
 */
Summary.prototype._pause = function() {
	console.log( "Pause called" );
	
	pages.summary.m_pauseStart = ((new Date()).getTime() / 1000).toFixed(0);
	// Stop GPS tracking
	GPSHandler.stopGPS();
	// Disable interface timer
	if( pages.summary.m_mainTimer != 0 ) clearTimeout(pages.summary.m_mainTimer);
	pages.summary.m_mainTimer = 0;
	// Enable suspend again
	window.plugins.PowerManagement.release(
		function(){ console.log( "Success!" ) },
		function(e){ console.log( "Error: " + e ) }
	);
	
	// Hide / Show the buttons
	$( '#stop-button' ).hide();
	$( '#pause-button' ).hide();
	$( '#resume-button' ).show();
};

/**
 * Called when the resume button is clicked
 */
Summary.prototype._resume = function() {
	console.log( "Resume called" );

	var pauseEnd = ((new Date()).getTime() / 1000).toFixed(0);
	
	// Start GPS again
	GPSHandler.startGPS( SettingsHandler.get( 'gpsInterval' ), pages.summary._updatePosition );
	// Disable suspend
	window.plugins.PowerManagement.acquire(
    	function(){ console.log( "Success!" ) },
		function(e){ console.log( "Error: " + e ) }
	);
	
	// Add pause to track
	TrackHandler.addPause( pages.summary.m_pauseStart, pauseEnd );
	pages.summary.m_pauseStart = 0;
	
	// Start updating our interface
	pages.summary._mainTimer();

	// Hide / Show the buttons
	$( '#resume-button' ).hide();
	$( '#pause-button' ).show();
	setTimeout( "$( '#stop-button' ).fadeIn()", 500 );
};

/**
 * Callback when the lock button is tapped
 */
Summary.prototype._lock = function() {
	$( '#lock-overlay' ).show();
};

/**
 * Callback for the GPSHandler which is called whenever the GPS position is updated
 */
Summary.prototype._updatePosition = function() {
	// Handle speed timeout
	if( pages.summary.m_speedTimer != 0 ) {
		clearTimeout( pages.summary.m_speedTimer );
	}
	pages.summary.m_speedTimer = setTimeout( "pages.summary._speedTimer()", SettingsHandler.get( 'gpsInterval' ) * 3 * 1000 );
	
	// Update odo (total distance - see odometer)
	pages.summary._updateOdo( GPSHandler.getDistance() );
	
	// Add new position info to track
	TrackHandler.addDistance( GPSHandler.getDistance() );
	TrackHandler.addSpeed( GPSHandler.getSpeed() );
	TrackHandler.addPosition( GPSHandler.getLatitude(), GPSHandler.getLongitude(), GPSHandler.getAltitude() );
	TrackHandler.addAccuracy( GPSHandler.getAccuracy(), GPSHandler.getAltitudeAccuracy() );
};

/**
 * Updates the clock (called once a minute)
 */
Summary.prototype._updateClock = function() {
	$( '#clock-infopanel' ).infopanel( 'setValue', formatDate( new Date() ) );
	setTimeout( "pages.summary._updateClock()", 60000 );
};

Summary.prototype._pageshow = function( p_event, p_ui ) {
	// Remove init handler
	$( '#summary-page' ).die( 'pageshow', pages.summary._pageshow );

	// Apply layout to all info-panels
	var rowHeight = (pages.summary.m_contentHeight / 7).toFixed(0);
	//console.log( "Row height: " + rowHeight );

	// Speed infopanel
	$( '#speed-infopanel' ).infopanel( {
		'value' : '0.00',
		'maxSizeValue' : '000.00',
		'size' : { 'width' : 'auto', 'height' : rowHeight * 3 },
		'image' : 'images/gowebsite24.png',
		'unit' : 'km/h',
		'showStatistics' : true
	} );
	$( '#speed-infopanel' ).infopanel( 'setStatistics', "0.00", "0.00" );

	// Distance infopanel
	$( '#distance-infopanel' ).infopanel( {
		'value' : '0.00',
		'maxSizeValue' : '000.00',
		'size' : { 'width' : 'auto', 'height' : rowHeight * 3 },
		'image' : 'images/web24.png',
		'unit' : 'km',
		'showStatistics' : true
	} );
	// Show initial odo
	pages.summary._updateOdo();
	
	// Altitude infopanel
	$( '#altitude-infopanel' ).infopanel( {
		'value' : '0.0',
		'maxSizeValue' : '0000.0',
		'size' : { 'width' : 'auto', 'height' : rowHeight * 2 },
		'image' : 'images/pictures24.png',
		'unit' : 'm',
		'showStatistics' : true
	} );
	$( '#altitude-infopanel' ).infopanel( 'setInfo', "0.00% / &Oslash; 0.00%" );

	// Status infopanel
//	$( '#status-infopanel' ).infopanel( {
//		'value' : '-',
//		'maxSizeValue' : '000_/_000',
//		'size' : { 'width' : 'auto', 'height' : rowHeight * 2 },
//		'image' : 'images/find24.png',
//		'unit' : 'Accuracy'
//	} );
//	$( '#status-infopanel' ).infopanel( 'setValueImage', 'images/wirelessSignalOff48.png', 48, 48 );
	
	$( '#status-infopanel' ).css( 'height', rowHeight * 2 );
	var track_map = new L.Map( 'status-infopanel', {
    	dragging: false,
    	touchZoom: false,
    	zoomControl: false,
    	attributionControl: false,
    	doubleClickZoom: false,
	} );
	var osmUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    osmAttrib = 'Map data &copy; 2011 OpenStreetMap contributors',
    osm = new L.TileLayer(osmUrl, {
    	maxZoom: 18,
    	attribution: osmAttrib,
    	tileSize = 32,
    });
	var vienna = new L.LatLng(48.208889, 16.3725);
	track_map.addLayer( osm );
	track_map.setView(vienna, 13);

	// Timer infopanel
	$( '#timer-infopanel' ).infopanel( {
		'value' : '00:00:00',
		'size' : { 'width' : 'auto', 'height' : (pages.summary.m_contentHeight - 5 * rowHeight) },
		'image' : 'images/timer24.png',
		'unit' : 'hh:mm:ss'
	} );

	// Clock infopanel
	$( '#clock-infopanel' ).infopanel( {
		'value' : '00:00',
		'size' : { 'width' : 'auto', 'height' : (pages.summary.m_contentHeight - 5 * rowHeight) },
		'image' : 'images/clock24.png',
		'unit' : 'hh:mm'
	} );

	// Add clock timer
	pages.summary._updateClock();
	$( '#stop-button' ).hide();
	$( '#pause-button' ).hide();
	$( '#resume-button' ).hide();
	
	// Bind pagebeforeshow event
	$( '#summary-page' ).live( 'pagebeforeshow', pages.summary._pagebeforeshow );
};

/**
 * Called just before the page is shown, used to update global values
 */
Summary.prototype._pagebeforeshow = function() {
	// Refresh ODO display
	pages.summary._updateOdo( 0.0 );
};

new Summary();
