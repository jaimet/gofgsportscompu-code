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

pages.summary = {
		m_mainTimer : 0,		// Reference for the main timer
		m_contentHeight : 0,	// Calculated height for one infopanel row
		
		init : function() {
			console.log( "summary-page loaded!" );
			
			// Calculate available height based on empty loading page
			var availableHeight = $( '#empty-page' ).height();
			availableHeight -= $( '#empty-page > [data-role="header"]' ).outerHeight();
			//availableHeight -= $( '#empty-page > [data-role="footer"]' ).outerHeight();
			availableHeight -= ($( '#empty-page > [data-role="content"]' ).outerHeight() - $( '#empty-page > [data-role="content"]' ).height());
			availableHeight -= $( '#empty-button' ).outerHeight();
			// Save available height as internal variable
			pages.summary.m_contentHeight = availableHeight;
			
			$( '#summary-page' ).live( 'pageshow', pages.summary._pageshow );
		},
		
		_mainTimer : function() {
			pages.summary._updateDisplay();
			pages.summary.m_mainTimer = setTimeout( "pages.summary._mainTimer()", 1000 );
		},

		/**
		 * Update the display of the app (regular interval, once a second)
		 */
		_updateDisplay : function() {
			$( '#speed-infopanel' ).infopanel( 'setValue', (TrackHandler.getSpeed() * 3.6).toFixed(2) );
			$( '#speed-infopanel' ).infopanel( 'setStatistics', (TrackHandler.getAverageSpeed() * 3.6).toFixed(2), (TrackHandler.getMaximumSpeed() * 3.6).toFixed(2) );
			$( '#distance-infopanel' ).infopanel( 'setValue', (TrackHandler.getTotalDistance() / 1000.0).toFixed(2) );
			$( '#altitude-infopanel' ).infopanel( 'setValue', TrackHandler.getElevationGain().toFixed(2) );
			$( '#altitude-infopanel' ).infopanel( 'setInfo', TrackHandler.getElevationRise().toFixed(2) + "% / &Oslash; " + TrackHandler.getAverageElevationRise().toFixed(2) + "%" );
			$( '#status-infopanel' ).infopanel( 'setValue', TrackHandler.getAccuracy() + " / " + TrackHandler.getAltitudeAccuracy() );
			$( '#timer-infopanel' ).infopanel( 'setValue', getFormattedTimeDiff(TrackHandler.getDuration(), true) );
		},
		
		/**
		 * Update & display odo value
		 */
		_updateOdo : function( p_distance ) {
			var odo = parseFloat(window.localStorage.getItem( "odo" ));
			if(isNaN(odo) ) odo = 0;

			if( p_distance != undefined ) {
				odo += p_distance;
			}
			window.localStorage.setItem( "odo", odo );
			
			$( '#distance-infopanel' ).infopanel( 'setInfo', "odo: " + (odo / 1000.0).toFixed(2) + "km" );
		},

		/**
		 * Button onClick-handler for starting GPS tracking
		 */
		_startGPS : function() {
			console.log( "Start-GPS called" );
			
//			window.open( "https://www.facebook.com/dialog/oauth?client_id=178026202259967&redirect_uri=http://www.gofg.at" );
			
			$( '#stop-button' ).show();
			$( '#start-button' ).hide();
			
			TrackHandler.startTrack();
			GPSHandler.startGPS( 5, pages.summary._updatePosition );
			window.plugins.PowerManagement.acquire(
		    	function(){ console.log( "Success!" ) },
				function(e){ console.log( "Error: " + e ) }
			);
			
			// Start updating our interface
			pages.summary._mainTimer();
		},

		/**
		 * Button onClick-handler for stopping GPS tracking
		 */
		_stopGPS : function() {
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
			if( pages.summary.m_mainTimer != 0 ) clearTimeout(pages.summary.m_mainTimer);
			pages.summary.m_mainTimer = 0;
		},
		
		/**
		 * Called when the pause button is clicked
		 */
		_pause : function() {
			/*
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
			*/
		},
		
		/**
		 * Callback for the GPSHandler which is called whenever the GPS position is updated
		 */
		_updatePosition : function() {
			//console.log( "updatePosition" );
			// Update odo (total distance - see odometer)
			pages.summary._updateOdo( GPSHandler.getDistance() );
			
			// Add new position info to track
			TrackHandler.addDistance( GPSHandler.getDistance() );
			TrackHandler.addSpeed( GPSHandler.getSpeed() );
			TrackHandler.addPosition( GPSHandler.getLatitude(), GPSHandler.getLongitude(), GPSHandler.getAltitude() );
			TrackHandler.addAccuracy( GPSHandler.getAccuracy(), GPSHandler.getAltitudeAccuracy() );
		},
		
		/**
		 * Updates the clock (called once a minute)
		 */
		_updateClock : function() {
			$( '#clock-infopanel' ).infopanel( 'setValue', formatDate( new Date() ) );
			setTimeout( "pages.summary._updateClock()", 60000 );
		},
		
		_pageshow : function( p_event, p_ui ) {
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
			$( '#status-infopanel' ).infopanel( {
				'value' : '-',
				'maxSizeValue' : '000_/_000',
				'size' : { 'width' : 'auto', 'height' : rowHeight * 2 },
				'image' : 'images/find24.png',
				'unit' : 'Accuracy (m)'
			} );
			
			// Timer infopanel
			$( '#timer-infopanel' ).infopanel( {
				'value' : '00:00:00',
				'maxSizeValue' : '00:00:00',
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
			
			// Setup top toolbar
			$( '#stop-button' ).hide();
			$( '#pause-button' ).hide();
			$( '#stop-button' ).live( 'tap', pages.summary._stopGPS );
			$( '#start-button' ).live( 'tap', pages.summary._startGPS );
			$( '#pause-button' ).live( 'tap', pages.summary._pause );
		}
};
