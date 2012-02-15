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

function Summary() {
}
Summary.prototype = new Page( "summary" );

Summary.prototype.m_mainTimer = 0;
Summary.prototype.m_contentHeight = 0;
Summary.prototype.m_speedTimer = 0;
Summary.prototype.m_pauseStart = 0;
Summary.prototype.m_leftTapHandler = null;
Summary.prototype.m_middleTapHandler = null;
Summary.prototype.m_rightTapHandler = null;
Summary.prototype.rightPage = "map.html";

Summary.prototype.oninit = function() {
	// Listen to button taps
	$( '#left-button' ).live( 'tap', pages.summary.leftTap );
	$( '#middle-button' ).live( 'tap', pages.summary.middleTap );
	$( '#right-button' ).live( 'tap', pages.summary.rightTap );
        $( '#enableGPS-button' ).live( 'tap', pages.summary.enableGPSTap );

	// Setup default tap handler
	pages.summary.m_middleTapHandler = pages.summary._lock;
	pages.summary.m_rightTapHandler = pages.summary._startGPS;
	
	// Disable the lock & stop button by default
	$( '#middle-button' ).button( 'disable' );
	$( '#left-button' ).button( 'disable' );
	
	$( '#summary-page' ).live( 'pageshow', pages.summary._pageshow );
};

Summary.prototype.enableGPSTap = function() {
    $('#enableGPS-button').button('disable');

    // Disable idle mode
    window.plugins.PowerManagement.acquire(
            function(){ console.log( "Success!" ) },
                    function(e){ console.log( "Error: " + e ) }
    );

    // Start GPS
    GPSHandler.setCallback( pages.summary._gpsFixWait );
    GPSHandler.startGPS( SettingsHandler.get( 'gpsinterval' ) );
}

/**
 * Wrapper function(s) for dynamic tap handling without having to call live / bind / die / unbind all the time
 */
Summary.prototype.leftTap = function() {
	if( typeof pages.summary.m_leftTapHandler === "function" ) pages.summary.m_leftTapHandler();
}
Summary.prototype.middleTap = function() {
	if( typeof pages.summary.m_middleTapHandler === "function" ) pages.summary.m_middleTapHandler();
};
Summary.prototype.rightTap = function() {
	if( typeof pages.summary.m_rightTapHandler === "function" ) pages.summary.m_rightTapHandler();
};

/**
 * Main timer which updates the display once a second
 */
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
	$( '#settings-button' ).hide();
	
	// Enable / disable buttons
	$( '#left-button' ).button( 'enable' );
	$( '#middle-button' ).button( 'enable' );
	$( '#right-button' ).button( 'disable' );
    // Setup tap handlers
	pages.summary.m_leftTapHandler = pages.summary._stopGPS;
	
	// Update accuracy status image
	$( '#status-infopanel' ).infopanel( 'setValueImage', 'images/wirelessSignalBad48.png', 48, 48 );

    pages.summary._startTracking();
};

/**
 * Simple helper function which waits for the first GPS fix and starts the track once called
 */
Summary.prototype._gpsFixWait = function() {
    $('#summary-page_enableGPS').hide();
    $('#summary-page_control').show();

    if( SettingsHandler.get( 'autostarttracking' ) > 0 ) {
        pages.summary._startGPS();
    }
};

/**
 * Start the real tracking
 */
Summary.prototype._startTracking = function() {
    console.log('Start-Tracking called');

	TrackHandler.startTrack();
	GPSHandler.setCallback( pages.summary._updatePosition );
	
	// Enable / disable buttons
	$( '#left-button' ).button( 'enable' );
	$( '#middle-button' ).button( 'enable' );
	$( '#right-button' ).button( 'enable' );
    // Update button icons
    $( '#right-button' ).parent().find( '.ui-icon' ).removeClass('ui-icon-gofgsc-play').addClass('ui-icon-gofgsc-pause');
	// Setup tap handlers
	pages.summary.m_leftTapHandler = pages.summary._stopGPS;
	pages.summary.m_rightTapHandler = pages.summary._pause;
	
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
    $('#summary-page_control').hide();
    setTimeout( "$('#summary-page_enableGPS').show()", 600 );
    $('#settings-button').show();

	// Enable / disable buttons
    $( '#left-button' ).button( 'disable' );
	$( '#middle-button' ).button( 'disable' );
	$( '#right-button' ).button( 'enable' );
    $('#enableGPS-button').button('enable');
    // Update button icons
    $( '#right-button' ).parent().find( '.ui-icon' ).removeClass('ui-icon-gofgsc-pause').addClass('ui-icon-gofgsc-play');
    // Setup tap handler
	pages.summary.m_rightTapHandler = pages.summary._startGPS;
	
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
	
	// Enable / disable buttons
	$( '#left-button' ).button( 'enable' );
	$( '#middle-button' ).button( 'disable' );
	$( '#right-button' ).button( 'disable' );
    // Update button icons
    $( '#left-button' ).parent().find( '.ui-icon' ).removeClass('ui-icon-gofgsc-stop').addClass('ui-icon-gofgsc-play');
    // Setup tap handler
	pages.summary.m_leftTapHandler = pages.summary._resume;
	
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
};

/**
 * Called when the resume button is clicked
 */
Summary.prototype._resume = function() {
	console.log( "Resume called" );

    // Enable / disable buttons
	$( '#left-button' ).button( 'enable' );
	$( '#middle-button' ).button( 'enable' );
	$( '#right-button' ).button( 'enable' );
    // Update button icons
    $( '#left-button' ).parent().find( '.ui-icon' ).removeClass('ui-icon-gofgsc-play').addClass('ui-icon-gofgsc-stop');
    // Setup tap handler
	pages.summary.m_leftTapHandler = pages.summary._stopGPS;
	pages.summary.m_rightTapHandler = pages.summary._pause;
	
	var pauseEnd = ((new Date()).getTime() / 1000).toFixed(0);
	
	// Start GPS again
    GPSHandler.startGPS( SettingsHandler.get( 'gpsinterval' ), pages.summary._updatePosition );
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
    pages.summary.m_speedTimer = setTimeout( "pages.summary._speedTimer()", SettingsHandler.get( 'gpsinterval' ) * 3 * 1000 );
	
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
	
	// Calculate available height for content
	pages.summary.m_contentHeight = $(window).height();
	pages.summary.m_contentHeight -= $('#summary-page > [data-role="header"]').outerHeight( true );
	pages.summary.m_contentHeight -= ($( '#summary-page > [data-role="content"]' ).outerHeight( true ) - $( '#summary-page > [data-role="content"]' ).height());
	pages.summary.m_contentHeight -= $('#summary-page_enableGPS').outerHeight( true );
	pages.summary.m_contentHeight -= $('#summary-pager-overlay').outerHeight( true );

	// Apply layout to all info-panels
	var rowHeight = (pages.summary.m_contentHeight / 7).toFixed(0);
//	console.log( "Row height: " + rowHeight );
	
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
	$( '#status-infopanel' ).infopanel( {
		'value' : '-',
		'maxSizeValue' : '000_/_000',
		'size' : { 'width' : 'auto', 'height' : rowHeight * 2 },
		'image' : 'images/find24.png',
		'unit' : 'Accuracy'
	} );
	$( '#status-infopanel' ).infopanel( 'setValueImage', 'images/wirelessSignalOff48.png', 48, 48 );
	
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
	$( '#stop-button' ).button( 'disable' );

	// Fix page height
	$( '#summary-page' ).height( $(window).height() );
	
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
