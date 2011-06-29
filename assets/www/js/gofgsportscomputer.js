var GOFGSportsComputer = {
	m_mainTimer : 0,	// Reference for the main timer
		
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
		
		$( '#speed-infopanel' ).infopanel( 'setValue', (GPSHandler.getSpeed() * 3.6).toFixed(2) );
		$( '#distance-infopanel' ).infopanel( 'setValue', (TrackHandler.getTotalDistance() / 1000.0).toFixed(2) );
		$( '#altitude-infopanel' ).infopanel( 'setValue', TrackHandler.getElevationGain().toFixed(2) );
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
	
	/**
	 * Startup function which setups the sports computer software (init, interface, etc.)
	 */
	_systemReady : function() {
		console.log( "Startup code running..." );
		
		// Call init code for TrackHandler
		TrackHandler._init();

		// Apply layout to all info-panels
		var availableHeight = $( '#home-page' ).height();
		availableHeight -= $( '#home-page > [data-role="header"]' ).outerHeight();
		availableHeight -= $( '#home-page > [data-role="footer"]' ).outerHeight();
		availableHeight -= ($( '#home-page > [data-role="content"]' ).outerHeight() - $( '#home-page > [data-role="content"]' ).height());
		//availableHeight = availableHeight;
		var rowHeight = (availableHeight / 3).toFixed(0);
		
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
			'size' : { 'width' : 'auto', 'height' : (availableHeight - 2 * rowHeight) },
			'image' : 'images/clock24.png',
			'unit' : 'hh:mm'
		} );
		// Add clock timer
		GOFGSportsComputer.updateClock();
		
		// Timer infopanel
		$( '#timer-infopanel' ).infopanel( {
			'value' : '00:00:00',
			'size' : { 'width' : 'auto', 'height' : (availableHeight - 2 * rowHeight) },
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
			'unit' : 'Status'
		} );

		// Setup top toolbar
		$( '#stop-button' ).hide();
		$( '#stop-button' ).live( 'tap', GOFGSportsComputer.stopGPS );
		$( '#start-button' ).live( 'tap', GOFGSportsComputer.startGPS );

		console.log( "Up and running!" );
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
			
	<!-- Added for debugging in the browser (for "normal" JS calls) -->
	//TrackHandler.addSpeed( 10 );
	//updateDistance();
	//systemReady();
} );
