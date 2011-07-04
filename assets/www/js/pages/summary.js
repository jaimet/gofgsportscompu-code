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
			
			// Calculate available heigh based on empty loading page
			var availableHeight = $( '#empty-page' ).height();
			availableHeight -= $( '#empty-page > [data-role="header"]' ).outerHeight();
			availableHeight -= $( '#empty-page > [data-role="footer"]' ).outerHeight();
			availableHeight -= ($( '#empty-page > [data-role="content"]' ).outerHeight() - $( '#empty-page > [data-role="content"]' ).height());
			// Save available height as internal variable
			pages.summary.m_contentHeight = availableHeight;
			
			$( '#summary-page' ).live( 'pageshow', pages.summary._pageshow );
		},

		/**
		 * Update the display of the app (regular interval, once a second)
		 */
		_updateDisplay : function() {
			$( '#timer-infopanel' ).infopanel( 'setValue', getFormattedTimeDiff(TrackHandler.getDuration(), true) );
			
			pages.summary.m_mainTimer = setTimeout( "pages.summary._updateDisplay()", 1000 );
		},

		/**
		 * Button onClick-handler for starting GPS tracking
		 */
		_startGPS : function() {
			console.log( "Start-GPS called" );
			
			$( '#stop-button' ).show();
			$( '#start-button' ).hide();
			
			TrackHandler.startTrack();
			GPSHandler.startGPS( 5, pages.summary._updatePosition );
			window.plugins.PowerManagement.acquire(
		    	function(){ console.log( "Success!" ) },
				function(e){ console.log( "Error: " + e ) }
			);
			
			// Start updating our interface
			pages.summary._updateDisplay();
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
		 * Callback for the GPSHandler which is called whenever the GPS position is updated
		 */
		_updatePosition : function() {
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
			var rowHeight = (pages.summary.m_contentHeight / 3).toFixed(0);
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
				'size' : { 'width' : 'auto', 'height' : (pages.summary.m_contentHeight - 2 * rowHeight) },
				'image' : 'images/clock24.png',
				'unit' : 'hh:mm'
			} );
			// Add clock timer
			pages.summary._updateClock();
			
			// Timer infopanel
			$( '#timer-infopanel' ).infopanel( {
				'value' : '00:00:00',
				'size' : { 'width' : 'auto', 'height' : (pages.summary.m_contentHeight - 2 * rowHeight) },
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
			$( '#stop-button' ).live( 'tap', pages.summary._stopGPS );
			$( '#start-button' ).live( 'tap', pages.summary._startGPS );
		}
};
