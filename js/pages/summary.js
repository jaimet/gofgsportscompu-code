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
Summary.prototype.m_track = null;               // Currently active track
Summary.prototype.m_trackwriter = null;         // Write for active track

Summary.prototype.rightPage = "map.html";

Summary.prototype.oninit = function() {
            // Listen to button taps
            $( '#left-button' ).live( 'tap', pages.summary.leftTap );
            $( '#middle-button' ).live( 'tap', pages.summary.middleTap );
            $( '#right-button' ).live( 'tap', pages.summary.rightTap );
            $( '#enableGPS-button' ).live( 'tap', pages.summary.enableGPSTap );

            // Setup default tap handler
            pages.summary.m_middleTapHandler = pages.summary._lock;

            $( '#summary-page' ).live( 'pageshow', pages.summary._pageshow );
        };

/**
 * Enable GPS and start searching for a signal
 */
Summary.prototype.enableGPSTap = function() {
            // Enable / disable buttons
            $( '#left-button' ).button( 'enable' );
            $( '#right-button' ).button( 'disable' );
            // Setup tap handlers
            pages.summary.m_leftTapHandler = pages.summary._stopGPS;

            // Switch button display
            $( '#settings-button' ).hide();
            $('#summary-page_enableGPS').fadeOut( 250 );
            setTimeout( "$('#summary-page_control').fadeIn( 250 )", 500 );

            // Show sat-search message
            $.mobile.loadingMessage = $.i18n.prop( "searching_message" );
            $.mobile.showPageLoadingMsg();

            // Disable idle mode
            window.plugins.PowerManagement.acquire(
                        function(){},
                        function(e){
                            MsgBox.show( $.i18n.prop( 'suspend_message_error' ) + e );
                            pages.summary._stopGPS();
                        }
                        );

            // Start GPS
            GPSHandler.setPositionCallback( pages.summary._gpsFixWait );
            GPSHandler.setErrorCallback( pages.summary_positionError );
            GPSHandler.startGPS( SettingsHandler.get( 'gpsinterval' ) );

            // Update accuracy status image
            $( '#status-infopanel' ).infopanel( 'setValueImage', 'images/wirelessSignalBad48.png', 48, 48 );

            // Check if auto-locking is on (but only apply it if we also enable autostart of tracking)
            if( SettingsHandler.get( 'autostarttracking' ) > 0 && SettingsHandler.get( 'autolock' ) > 0 ) {
                pages.summary._lock();
            }
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
            $( '#speed-infopanel' ).infopanel( 'setValue', (l10n.largeUnitValue(coords.speed * 3.6)).toFixed(2) );
            $( '#speed-infopanel' ).infopanel( 'setStatistics', l10n.largeUnitValue(avgSpeed).toFixed(2), l10n.largeUnitValue(pages.summary.m_track.getMaximumSpeed() * 3.6).toFixed(2) );
            $( '#distance-infopanel' ).infopanel( 'setValue', l10n.largeUnitValue(pages.summary.m_track.getTotalDistance() / 1000.0).toFixed(2) );
            $( '#altitude-infopanel' ).infopanel( 'setValue', l10n.smallUnitValue(pages.summary.m_track.getElevationGain()).toFixed(1) );
            $( '#altitude-infopanel' ).infopanel( 'setInfo', currElevation.toFixed(2) + "% / &Oslash; " + avgElevation.toFixed(2) + "%" );
            if( p_bLoading ) {
                $( '#timer-infopanel' ).infopanel( 'setValue', getFormattedTimeDiff(pages.summary.m_track.getDuration(), true) );
            }
            else {
                $( '#timer-infopanel' ).infopanel( 'setValue', getFormattedTimeDiff(Utilities.getUnixTimestamp() - pages.summary.m_track.getStartTime(), true) );
            }

        };

/**
 * Update image for accuracy display
 */
Summary.prototype._updateAccuracy = function( p_averageAccuracy ) {
            var minimumAccuracy = SettingsHandler.get( 'minimumaccuracy' );

            if( p_averageAccuracy <= (minimumAccuracy / 2.0) ) {
                $( '#status-infopanel' ).infopanel( 'setValueImage', 'images/wirelessSignalExcellent48.png', 48, 48 );
            }
            else if( p_averageAccuracy <= minimumAccuracy ) {
                $( '#status-infopanel' ).infopanel( 'setValueImage', 'images/wirelessSignalGood48.png', 48, 48 );
            }
            else {
                $( '#status-infopanel' ).infopanel( 'setValueImage', 'images/wirelessSignalBad48.png', 48, 48 );
            }
        }

/**
 * Update unit labels based on selected display-units
 */
Summary.prototype.updateDisplayUnits = function() {
            $( '#speed-infopanel' ).infopanel( 'setUnit', l10n.speedUnit() );
            $( '#distance-infopanel' ).infopanel( 'setUnit', l10n.largeUnit() );
            $( '#altitude-infopanel' ).infopanel( 'setUnit', l10n.smallUnit() );
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

            $( '#distance-infopanel' ).infopanel( 'setInfo', "odo: " + l10n.largeUnitValue(odo / 1000.0).toFixed(2) + l10n.largeUnit() );
        };

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
                            // Setup tap handlers
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
 * Simple helper function which waits for the first GPS fix and starts the track once called
 */
Summary.prototype._gpsFixWait = function( p_position ) {
            // Reset / hide sat-searching message
            $.mobile.loadingMessage = $.i18n.prop( "loading_message" );
            $.mobile.hidePageLoadingMsg();

            // Update accuracy display
            pages.summary._updateAccuracy((p_position.coords.accuracy + p_position.coords.altitudeAccuracy) / 2.0);

            // Enable / disable buttons
            $( '#left-button' ).button( 'enable' );
            $( '#right-button' ).button( 'enable' );
            // Setup tap handlers
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
 * Button onClick-handler for stopping GPS tracking
 */
Summary.prototype._stopGPS = function() {
            // Switch button display
            $('#summary-page_control').fadeOut( 250 );
            setTimeout( "$('#summary-page_enableGPS').fadeIn( 250 )", 500 );
            $('#settings-button').show();

            // Reset loading message (because searching for satellites might still be active)
            $.mobile.loadingMessage = $.i18n.prop( "loading_message" );
            $.mobile.hidePageLoadingMsg();

            // Update button icons
            $( '#right-button' ).parent().find( '.ui-icon' ).removeClass('ui-icon-gofgsc-pause').addClass('ui-icon-gofgsc-play');

            // Stop GPS & release power lock
            GPSHandler.stopGPS();
            window.plugins.PowerManagement.release(
                        function(){},
                        function(e){}
                        );

            // Update accuracy status image
            $( '#status-infopanel' ).infopanel( 'setValueImage', 'images/wirelessSignalOff48.png', 48, 48 );

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
            // Setup tap handler
            pages.summary.m_leftTapHandler = pages.summary._stopGPS;
            pages.summary.m_rightTapHandler = pages.summary._resume;

            pages.summary.m_pauseStart = ((new Date()).getTime() / 1000).toFixed(0);
            // Stop GPS tracking
            GPSHandler.stopGPS();
            // Disable interface timer
            if( pages.summary.m_mainTimer != 0 ) clearTimeout(pages.summary.m_mainTimer);
            pages.summary.m_mainTimer = 0;
            // Enable suspend again
            window.plugins.PowerManagement.release(
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
            // Setup tap handler
            pages.summary.m_leftTapHandler = pages.summary._stopGPS;
            pages.summary.m_rightTapHandler = pages.summary._pause;

            var pauseEnd = Utilities.getUnixTimestamp();

            // Start GPS again
            GPSHandler.startGPS( SettingsHandler.get( 'gpsinterval' ), pages.summary._updatePosition );
            // Disable suspend
            window.plugins.PowerManagement.acquire(
                        function(){},
                        function(e){
                            MsgBox.show( $.i18n.prop( 'suspend_message_error' ) + e );
                            pages.summary._stopGPS();
                        }
                        );

            // Add pause to track
            pages.summary.m_track.addPause( pages.summary.m_pauseStart, pauseEnd );
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
            pages.summary.m_track.addPosition( p_position, distance );
            pages.summary.m_trackwriter.writeWaypoint();

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
Summary.prototype_positionError = function( p_positionError ) {
            MsgBox.show( $.i18n.prop( 'position_message_error' ) + p_positionError.message + " (" + p_positionError.code + ")" );
        }

/**
 * Updates the clock (called once a minute)
 */
Summary.prototype._updateClock = function() {
            $( '#clock-infopanel' ).infopanel( 'setValue', formatDate( new Date() ) );
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
                                                     'maxSizeValue' : '00000.0',
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

            // Update display units
            pages.summary.updateDisplayUnits();
        };

new Summary();
