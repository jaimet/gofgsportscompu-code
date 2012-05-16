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
Summary.prototype.m_bPauseEnding = false;
Summary.prototype.m_leftTapHandler = null;
Summary.prototype.m_middleTapHandler = null;
Summary.prototype.m_rightTapHandler = null;
Summary.prototype.m_track = null;               // Currently active track
Summary.prototype.m_trackwriter = null;         // Write for active track
Summary.prototype.m_powerManagement = null;

// Widgets references
Summary.prototype.m_odometerWidget = null;
Summary.prototype.m_clockWidget = null;
Summary.prototype.m_speedWidget = null;
Summary.prototype.m_distanceWidget = null;
Summary.prototype.m_timerWidget = null;
Summary.prototype.m_altitudeWidget = null;
Summary.prototype.m_heartrateWidget = null;

Summary.prototype.rightPage = "map.html";

Summary.prototype.oninit = function() {
            // Listen to button clicks
            $( '#left-button' ).live( 'click', pages.summary.leftTap );
            $( '#middle-button' ).live( 'click', pages.summary.middleTap );
            $( '#right-button' ).live( 'click', pages.summary.rightTap );
            $( '#enableGPS-button' ).live( 'click', pages.summary.enableGPSTap );

            // Setup default click handler
            pages.summary.m_middleTapHandler = pages.summary._lock;

            $( '#summary-page' ).live( 'pageshow', pages.summary._pageshow );
        };

/**
 * Wrapper function(s) for dynamic click handling without having to call live / bind / die / unbind all the time
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
            pages.summary.m_speedWidget.setValue( '0.0' );
        }

/**
 * Update the display of the app (regular interval, once a second)
 * @param bool p_bLoading true if we are loading a track
 */
Summary.prototype._updateDisplay = function( p_bLoading ) {
            // Check if we have a track at all
            if( pages.summary.m_track === null ) return;
            var waypoint = pages.summary.m_track.getCurrentWaypoint();
            // Check if we actually have an info yet
            if( waypoint === null ) return;

            // Get reference to current coordinates
            var coords = waypoint.m_position.coords;

            // Calculate average speed
            var avgSpeed = pages.summary.m_track.getTotalDistance() / pages.summary.m_track.getDuration() * 3.6;
            if( isNaN(avgSpeed) ) avgSpeed = 0.00;
            // Current & average elevation rate
            var currElevation = waypoint.m_altitudeDiff / waypoint.m_distance * 100;
            if( isNaN(currElevation) ) currElevation = 0.00;
            var avgElevation = pages.summary.m_track.getElevationGain() / pages.summary.m_track.getTotalDistance() * 100;
            if( isNaN(avgElevation) ) avgElevation = 0.00;

            // Update display
            pages.summary.m_speedWidget.setValue( (l10n.largeUnitValue(coords.speed * 3.6)).toFixed(1) );
            pages.summary.m_speedWidget.setSubInfo( 0, l10n.largeUnitValue(avgSpeed).toFixed(1) );
            pages.summary.m_speedWidget.setSubInfo( 1, l10n.largeUnitValue(pages.summary.m_track.getMaximumSpeed() * 3.6).toFixed(1) );
            pages.summary.m_distanceWidget.setValue( l10n.largeUnitValue(pages.summary.m_track.getTotalDistance() / 1000.0).toFixed(2) );
            pages.summary.m_altitudeWidget.setValue( l10n.smallUnitValue(pages.summary.m_track.getElevationGain()).toFixed(1) );
            pages.summary.m_altitudeWidget.setSubInfo( 0, currElevation.toFixed(2) + '%' );
            pages.summary.m_altitudeWidget.setSubInfo( 1, avgElevation.toFixed(2) + '%' );

            // Calculate track duration
            var duration = 0;
            if( p_bLoading ) {
                duration = pages.summary.m_track.getDuration();
            }
            else {
                duration = Utilities.getUnixTimestamp() - pages.summary.m_track.getStartTime();
            }
            // Substract pause from total duration
            duration -= pages.summary.m_track.getPauseTime();

            pages.summary.m_timerWidget.setValue( getFormattedTimeDiff(duration, true) );
        };

/**
 * Update image for accuracy display
 */
Summary.prototype._updateAccuracy = function( p_averageAccuracy ) {
            var minimumAccuracy = SettingsHandler.get( 'minimumaccuracy' );
            var imageSrc = 'images/wirelessSignalBad48.png';

            if( p_averageAccuracy < 0 ) {
                imageSrc = 'images/wirelessSignalOff48.png';
            }
            else if( p_averageAccuracy <= (minimumAccuracy / 2.0) ) {
                imageSrc = 'images/wirelessSignalExcellent48.png';
            }
            else if( p_averageAccuracy <= minimumAccuracy ) {
                imageSrc = 'images/wirelessSignalGood48.png';
            }

            // Finally set the new image src
            $( '#summary-page_signal-strength' ).attr( 'src', imageSrc );
        }

/**
 * Update unit labels based on selected display-units
 */
Summary.prototype.updateDisplayUnits = function() {
            pages.summary.m_speedWidget.setUnit( l10n.speedUnit() );
            pages.summary.m_distanceWidget.setUnit( l10n.largeUnit );
            pages.summary.m_altitudeWidget.setUnit( l10n.smallUnit() );
        }

/**
 * Update & display odo value
 */
Summary.prototype._updateOdo = function( p_distance ) {
            var odo = parseFloat(window.localStorage.getItem( "odo" ));
            if(isNaN(odo) ) odo = 0;

            if( p_distance !== undefined ) {
                odo += p_distance;
            }
            window.localStorage.setItem( "odo", odo );

            pages.summary.m_odometerWidget.setValue( l10n.largeUnitValue(odo / 1000.0).toFixed(2) );
        };

/**
 * Simple helper function which waits for the first GPS fix and starts the track once called
 */
Summary.prototype._gpsFixWait = function( p_position ) {
            // Reset / hide sat-searching message
            $.mobile.hidePageLoadingMsg();
            $.mobile.loadingMessage = $.i18n.prop( "loading_message" );

            // Update accuracy display
            pages.summary._updateAccuracy((p_position.coords.accuracy + p_position.coords.altitudeAccuracy) / 2.0);

            // Enable / disable buttons
            $( '#left-button' ).button( 'enable' );
            $( '#right-button' ).button( 'enable' );
            // Setup click handlers
            pages.summary.m_leftTapHandler = pages.summary._stopGPS;
            pages.summary.m_rightTapHandler = pages.summary._startGPS;

            // Disable gpsfixwait callback
            GPSHandler.setPositionCallback( null );

            // Check if we automatically start tracking
            if( SettingsHandler.get( 'autostarttracking' ) > 0 ) {
                pages.summary._startGPS();
            }
        };

/**
 * Helper function which starts searching for satellites and calls successCallback once we have a GPS lock
 */
Summary.prototype._searchForSatellites = function( p_successCallback, p_errorCallback ) {
            // Define internal success callback
            var successCallback = function( p_position ) {
                // Reset / hide sat-searching message
                $.mobile.hidePageLoadingMsg();
                $.mobile.loadingMessage = $.i18n.prop( "loading_message" );

                if( typeof p_successCallback === "function" ) p_successCallback( p_position );
            };

            // Define internal error callback
            var errorCallback = function( p_error ) {
                // Reset / hide sat-searching message
                $.mobile.hidePageLoadingMsg();
                $.mobile.loadingMessage = $.i18n.prop( "loading_message" );

                if( typeof p_errorCallback === "function" ) p_errorCallback( p_error );
            }

            // Show sat-search message
            $.mobile.loadingMessage = $.i18n.prop( "searching_message" );
            $.mobile.showPageLoadingMsg();

            // Disable idle mode
            pages.summary.m_powerManagement.acquire(
                        function(){},
                        errorCallback
                        );

            // Start GPS
            GPSHandler.setPositionCallback( successCallback );
            GPSHandler.startGPS( SettingsHandler.get( 'gpsinterval' ) );
        }

/**
 * Enable GPS and start searching for a signal
 */
Summary.prototype.enableGPSTap = function() {
            // Enable / disable buttons
            $( '#left-button' ).button( 'enable' );
            $( '#right-button' ).button( 'disable' );
            // Setup click handlers
            pages.summary.m_leftTapHandler = pages.summary._stopGPS;

            // Switch button display
            $( '#settings-button' ).hide();
            $('#summary-page_enableGPS').fadeOut( 250, function() {
                                                     $('#summary-page_control').fadeIn( 250 );
                                                 } );

            // Show accuracy status image
            $( '#summary-page_signal-strength' ).show();

            // Start searching forsatellites
            pages.summary._searchForSatellites( pages.summary._gpsFixWait, function( p_error ) {
                                                   MsgBox.show( $.i18n.prop( 'suspend_message_error' ) + e );
                                                   pages.summary._stopGPS();
                                               } );

            // Check if auto-locking is on (but only apply it if we also enable autostart of tracking)
            if( SettingsHandler.get( 'autostarttracking' ) > 0 && SettingsHandler.get( 'autolock' ) > 0 ) {
                pages.summary._lock();
            }
        }

/**
 * Button onClick-handler for starting GPS tracking
 */
Summary.prototype._startGPS = function( p_position ) {
            // Start the new track
            pages.summary.m_track = new Track();
            GOFGSportsComputer.m_trackDirectoryEntry.getFile(
                        Utilities.getUnixTimestamp() + ".gsc",
                        {create: true, exclusive: true},
                        function( p_fileEntry ) {
                            // Create track-writer object & write initial information
                            pages.summary.m_trackwriter = new TrackWriter( pages.summary.m_track, p_fileEntry );
                            pages.summary.m_trackwriter.writeInfo();

                            // Set position callback
                            GPSHandler.setPositionCallback( pages.summary._updatePosition );

                            // Enable / disable buttons
                            $( '#left-button' ).button( 'enable' );
                            $( '#right-button' ).button( 'enable' );
                            // Update button icons
                            $( '#right-button' ).parent().find( '.ui-icon' ).removeClass('ui-icon-gofgsc-play').addClass('ui-icon-gofgsc-pause');
                            // Setup click handlers
                            pages.summary.m_leftTapHandler = pages.summary._stopGPS;
                            pages.summary.m_rightTapHandler = pages.summary._pause;

                            // Start updating our interface
                            pages.summary._mainTimer();

                            // Check if auto-locking is on
                            if( SettingsHandler.get( 'autolock' ) > 0 ) {
                                pages.summary._lock();
                            }

                            // Notify map- & altitude-screen of new track
                            pages.map.newtrack();
                            pages.graph.newtrack();
                        },
                        function( p_fileError ) {
                            MsgBox.show( 'Error while trying to open track for writing. The error returned is: ' + p_fileError.code );
                            pages.summary._stopGPS();
                        }
                        );
        };

/**
 * Button onClick-handler for stopping GPS tracking
 */
Summary.prototype._stopGPS = function() {
            // Hide accuracy status image & update it
            $( '#summary-page_signal-strength' ).hide();
            pages.summary._updateAccuracy( -1 );

            // Switch button display
            $('#summary-page_control').fadeOut( 250, function() {
                                                   $('#summary-page_enableGPS').fadeIn( 250 );
                                               } );
            $('#settings-button').show();

            // Reset loading message (because searching for satellites might still be active)
            $.mobile.loadingMessage = $.i18n.prop( "loading_message" );
            $.mobile.hidePageLoadingMsg();

            // Update button icons
            $( '#right-button' ).parent().find( '.ui-icon' ).removeClass('ui-icon-gofgsc-pause').addClass('ui-icon-gofgsc-play');

            // Stop GPS & release power lock
            GPSHandler.stopGPS();
            pages.summary.m_powerManagement.release(
                        function(){},
                        function(e){}
                        );

            // No more actions to take if track didn't start yet
            if( pages.summary.m_track === null ) return;

            // Disable interface timer
            if( pages.summary.m_mainTimer !== 0 ) clearTimeout(pages.summary.m_mainTimer);
            pages.summary.m_mainTimer = 0;

            // Finalize track
            pages.summary.m_trackwriter.writeWaypoint(true);

            // Notify map- & altitude-screen of ending track
            pages.map.endtrack( pages.summary.m_track );
            pages.graph.endtrack( pages.summary.m_track );

            // Remove references to closed tracks
            pages.summary.m_track = null;
            pages.summary.m_trackwriter = null;
        };

/**
 * Called when the pause button is clicked
 */
Summary.prototype._pause = function() {
            // Enable / disable buttons
            $( '#left-button' ).button( 'enable' );
            $( '#right-button' ).button( 'enable' );
            // Update button icons
            $( '#right-button' ).parent().find( '.ui-icon' ).removeClass('ui-icon-gofgsc-pause').addClass('ui-icon-gofgsc-play');
            // Setup click handler
            pages.summary.m_leftTapHandler = pages.summary._stopGPS;
            pages.summary.m_rightTapHandler = pages.summary._resume;

            // Stop GPS tracking
            GPSHandler.stopGPS();
            // Disable interface timer
            if( pages.summary.m_mainTimer !== 0 ) clearTimeout(pages.summary.m_mainTimer);
            pages.summary.m_mainTimer = 0;
            // Enable suspend
            pages.summary.m_powerManagement.release(
                        function(){},
                        function(e){}
                        );
        };

/**
 * Called when the resume button is clicked
 */
Summary.prototype._resume = function() {
            // Enable / disable buttons
            $( '#left-button' ).button( 'enable' );
            $( '#right-button' ).button( 'enable' );
            // Update button icons
            $( '#right-button' ).parent().find( '.ui-icon' ).removeClass('ui-icon-gofgsc-play').addClass('ui-icon-gofgsc-pause');
            // Setup click handler
            pages.summary.m_leftTapHandler = pages.summary._stopGPS;
            pages.summary.m_rightTapHandler = pages.summary._pause;

            // Pause is ending
            pages.summary.m_bPauseEnding = true;

            // Start searching for GPS signal again
            pages.summary._searchForSatellites( function( p_position ) {
                                                   // Setup new position callback
                                                   GPSHandler.setPositionCallback( pages.summary._updatePosition );

                                                   // Call position callback with current position
                                                   pages.summary._updatePosition( p_position );

                                                   // Start updating our interface
                                                   pages.summary._mainTimer();
                                               },
                                               function( p_error ) {
                                                   MsgBox.show( $.i18n.prop( 'suspend_message_error' ) + e );
                                                   pages.summary._stopGPS();
                                               } );
        };

/**
 * Callback when the lock button is clicked
 */
Summary.prototype._lock = function() {
            $( '#lock-overlay' ).show();
        };

/**
 * Callback for the GPSHandler which is called whenever the GPS position is updated
 */
Summary.prototype._updatePosition = function( p_position ) {
            // Update accuracy display
            pages.summary._updateAccuracy((p_position.coords.accuracy + p_position.coords.altitudeAccuracy) / 2.0);

            // Check if position is accurate enough
            if( p_position.coords.accuracy > SettingsHandler.getInt( 'minimumaccuracy' ) ) return;

            // Calculate distance
            var distance = 0;
            var waypoint = pages.summary.m_track.getCurrentWaypoint();

            if( waypoint !== null ) {
                distance = Utilities.haversineDistance( waypoint.m_position.coords, p_position.coords );

                // Check if new waypoint is out of the tolerance of the last one
                if( distance <= waypoint.m_position.coords.accuracy ) return;

                // Check if altitude difference is within tolerance
                if( Math.abs(waypoint.m_position.coords.altitude - p_position.coords.altitude) < SettingsHandler.getInt( 'minimumaltitudechange' ) ) {
                    p_position.coords.altitude = waypoint.m_position.coords.altitude;
                }

                // Update odo (total distance - see odometer)
                pages.summary._updateOdo( distance );
            }

            // Update track information
            pages.summary.m_track.addPosition( p_position, distance, pages.summary.m_bPauseEnding );
            pages.summary.m_trackwriter.writeWaypoint();
            pages.summary.m_bPauseEnding = false;

            // Handle speed timeout
            if( pages.summary.m_speedTimer != 0 ) {
                clearTimeout( pages.summary.m_speedTimer );
            }
            pages.summary.m_speedTimer = setTimeout( "pages.summary._speedTimer()", SettingsHandler.get( 'gpsinterval' ) * 3 * 1000 );

            // Pass waypoint on to map- & altitude-screen
            pages.map.waypoint(pages.summary.m_track.getCurrentWaypoint(), pages.summary.m_track);
            pages.graph.waypoint(pages.summary.m_track.getCurrentWaypoint(), pages.summary.m_track);
        };

/**
 * Called by the GPSHandler if there was an error
 */
Summary.prototype._positionError = function( p_positionError ) {
            MsgBox.show( $.i18n.prop( 'position_message_error' ) + p_positionError.message + " (" + p_positionError.code + ")" );
        }

/**
 * Updates the clock (called once a minute)
 */
Summary.prototype._updateClock = function() {
            pages.summary.m_clockWidget.setValue( formatDate( new Date() ) );
            setTimeout( "pages.summary._updateClock()", 60000 );
        };

/**
 * Try to load a track from a given fileEntry
 */
Summary.prototype.loadTrack = function( p_fileEntry ) {
            // Notify map & altitude-graph of new track
            pages.map.newtrack();
            pages.graph.newtrack();
            // Start reading the track
            var trackReader = new TrackReader( p_fileEntry,
                                              function( p_waypoint, p_track ) {
                                                  pages.map.waypoint( p_waypoint, p_track );
                                                  pages.graph.waypoint( p_waypoint, p_track );
                                              },
                                              function( p_track ) {
                                                  pages.summary.m_track = p_track;
                                                  pages.summary._updateDisplay( true );

                                                  // Finish track
                                                  pages.map.endtrack( p_track );
                                                  pages.graph.endtrack( p_track );
                                                  pages.summary.m_track = null;

                                                  // Display summary page
                                                  $.mobile.changePage( "summary.html", { transition: 'slidedown', reverse : true } );
                                              },
                                              null );
        }

/**
 * Invoked on first display to size & configure all the display panels
 */
Summary.prototype._pageshow = function( p_event, p_ui ) {
            // Fetch reference to powermanagement object
            pages.summary.m_powerManagement = (typeof window.plugins.PowerManagement !== "undefined" ) ? window.plugins.PowerManagement :  cordova.require('cordova/plugin/powermanagement');

            // Remove init handler
            $( '#summary-page' ).die( 'pageshow', pages.summary._pageshow );

            // Calculate available height for content
            pages.summary.m_contentHeight = $(window).height();
            pages.summary.m_contentHeight -= $('#summary-page > [data-role="header"]').outerHeight( true );
            pages.summary.m_contentHeight -= ($( '#summary-page > [data-role="content"]' ).outerHeight( true ) - $( '#summary-page > [data-role="content"]' ).height());
            pages.summary.m_contentHeight -= $('#summary-page_enableGPS').outerHeight( true );
            pages.summary.m_contentHeight -= $('#summary-pager-overlay').outerHeight( true );

            // Apply layout to all info-panels
            var rowHeight = (pages.summary.m_contentHeight / 5).toFixed(0);

            // Create speed widget
            pages.summary.m_speedWidget = new InfoWidget( 'speed-infowidget', {
                                                 value: '0.0',
                                                 size: { width: 'auto', height: rowHeight },
                                                 unit: 'km/h',
                                                 sizeValue: '000.0',
                                                 showIndicator: true
                                             } );
            pages.summary.m_speedWidget.addSubInfo( 'avg:', '0.0', '000.0' );
            pages.summary.m_speedWidget.addSubInfo( 'max:', '0.0', '000.0' );

            // Create distance widget
            pages.summary.m_distanceWidget = new InfoWidget( 'distance-infowidget', {
                                                    value: '0.00',
                                                    size: { width: 'auto', height: rowHeight },
                                                    unit: 'km',
                                                    sizeValue: '0000.00'
                                                } );

            pages.summary.m_timerWidget = new InfoWidget( 'timer-infowidget', {
                                                 value: '00:00:00',
                                                 size: { width: 'auto', height: rowHeight },
                                                 unit: 'hh:mm:ss'
                                             } );

            pages.summary.m_altitudeWidget = new InfoWidget( 'altitude-infowidget', {
                                                    value: '0.00',
                                                    size: { width: 'auto', height: rowHeight },
                                                    unit: 'm',
                                                    sizeValue: '0000.00',
                                                    showSubInfos: true
                                                } );
            pages.summary.m_altitudeWidget.addSubInfo( 'curr:',  '0%', '00%' );
            pages.summary.m_altitudeWidget.addSubInfo( 'avg:', '0%', '00%' );

            pages.summary.m_heartrateWidget = new InfoWidget( 'heartrate-infowidget', {
                                                     value: '0',
                                                     size: { width: 'auto', height: rowHeight },
                                                     unit: 'bpm',
                                                     sizeValue: '000',
                                                     showSubInfos: true
                                                 } );
            pages.summary.m_heartrateWidget.addSubInfo( 'avg:', '0', '000' );
            pages.summary.m_heartrateWidget.addSubInfo( 'max:', '0', '000' );

            pages.summary.m_clockWidget = new InfoWidget( 'clock-infowidget', {
                                                             value: '00:00',
                                                             size: { width: 'auto', height: pages.summary.m_contentHeight - rowHeight * 4 },
                                                             unit: 'hh:mm',
                                                             sizeValue: '00:00'
                                                         } );

            // Create widget for odo-meter display
            pages.summary.m_odometerWidget = new InfoWidget( 'odometer-infowidget', {
                                                                value: '0.0',
                                                                size: { width: 'auto', height: pages.summary.m_contentHeight - rowHeight * 4 },
                                                                unit: 'km (odo)',
                                                                sizeValue: '00000.00'
                                                            } );

            // Show initial odo
            pages.summary._updateOdo();

            // Add clock timer
            pages.summary._updateClock();

            // Fix page height
            $( '#summary-page' ).height( $(window).height() );

            // Update display units
            pages.summary.updateDisplayUnits();

            // Register error callback for GPSHandler
            GPSHandler.setErrorCallback( pages.summary._positionError );
        };

new Summary();
