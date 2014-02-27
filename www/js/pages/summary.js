/*
 * Copyright (C) 2011-2013 Wolfgang Koller
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
Summary.prototype = new Page("summary");

Summary.prototype.m_mainTimer = 0;
Summary.prototype.m_contentHeight = 0;
Summary.prototype.m_bPauseEnding = false;
Summary.prototype.m_leftTapHandler = null;
Summary.prototype.m_middleTapHandler = null;
Summary.prototype.m_rightTapHandler = null;
Summary.prototype.m_track = null; // Currently active track
Summary.prototype.m_trackwriter = null; // Write for active track
Summary.prototype.m_trackFileEntry = null;	// File entry for active track
Summary.prototype.m_hrmImplementation = null;	// Reference to hrmImplementation

// Widgets references
Summary.prototype.m_odometerWidget = null;
Summary.prototype.m_clockWidget = null;
Summary.prototype.m_speedWidget = null;
Summary.prototype.m_distanceWidget = null;
Summary.prototype.m_timerWidget = null;
Summary.prototype.m_altitudeWidget = null;
Summary.prototype.m_heartrateWidget = null;
// Set to true if the page needs to adjust widget sizes (true on startup)
Summary.prototype.m_bWidgetDirty = true;

Summary.prototype.rightPage = "map.html";

/**
 * Called when the page is initialized
 */
Summary.prototype.oninit = function() {
    // Listen to button clicks
    $('#left-button').live('click', pages.summary.leftTap);
    $('#middle-button').live('click', pages.summary.middleTap);
    $('#right-button').live('click', pages.summary.rightTap);
    $('#enableGPS-button').live('click', pages.summary.enableGPSTap);

    // Listen to click event on listview in order to change icon + setting
    $('#summary-page_sporttype-popup a').bind('click', function(event, ui) {
        var sporttype = $(this).attr('href').replace('#', '');
        $('#summary-page_sporttype-button').buttonMarkup({icon: "gofgsc-" + sporttype});
        SettingsHandler.set('sporttype', sporttype);
        SettingsHandler._save();

        return true;
    });
    // load last sporttype and assign it to button
    $('#summary-page_sporttype-button').buttonMarkup({icon: "gofgsc-" + SettingsHandler.get('sporttype')});

    // Setup default click handler
    pages.summary.m_middleTapHandler = pages.summary._lock;

    // Register event handler for pageshow event
    $('#summary-page').live('pageshow', pages.summary._pageshow);

    // Register error callback for GPSHandler
    GPSHandler.setErrorCallback(pages.summary._positionError);

    /**
     * Create all widgets for our interface
     */
    var targetClass = 'ui-bar-c';
    // windows phone uses different coloring scheme
    switch (device.platform) {
        case 'WinCE':
        case 'Win32NT':
            targetClass = 'ui-bar-d';
            break;
    }

    // Create speed widget
    pages.summary.m_speedWidget = new InfoWidget('speed-infowidget', {
        value: '0.0',
        unit: 'km/h',
        sizeValue: '000.0',
        showIndicator: true,
        targetClass: targetClass
    });
    pages.summary.m_speedWidget.addSubInfo('avg:', '0.0', '000.0');
    pages.summary.m_speedWidget.addSubInfo('max:', '0.0', '000.0');

    // Create distance widget
    pages.summary.m_distanceWidget = new InfoWidget('distance-infowidget', {
        value: '0.00',
        unit: 'km',
        sizeValue: '0000.00',
        targetClass: targetClass
    });

    // Create timer widget
    pages.summary.m_timerWidget = new InfoWidget('timer-infowidget', {
        value: '00:00:00',
        unit: 'hh:mm:ss',
        targetClass: targetClass
    });

    // Create altitude widget
    pages.summary.m_altitudeWidget = new InfoWidget('altitude-infowidget', {
        value: '0.0',
        unit: 'm',
        sizeValue: '0000.0',
        showSubInfos: true,
        targetClass: targetClass
    });
    pages.summary.m_altitudeWidget.addSubInfo('curr:', '0%', '00%');
    pages.summary.m_altitudeWidget.addSubInfo('avg:', '0%', '00%');

    // Create heartrate widget
    pages.summary.m_heartrateWidget = new InfoWidget('heartrate-infowidget', {
        value: '0',
        unit: 'bpm',
        sizeValue: '000',
        showSubInfos: true,
        targetClass: targetClass
    });
    pages.summary.m_heartrateWidget.addSubInfo('avg:', '0', '000');
    pages.summary.m_heartrateWidget.addSubInfo('max:', '0', '000');

    // Create clock widget
    pages.summary.m_clockWidget = new InfoWidget('clock-infowidget', {
        value: '00:00',
        unit: 'hh:mm',
        sizeValue: '00:00',
        targetClass: targetClass
    });

    // Create widget for odo-meter display
    pages.summary.m_odometerWidget = new InfoWidget('odometer-infowidget', {
        value: '0.0',
        unit: 'km (odo)',
        sizeValue: '00000.0',
        targetClass: targetClass
    });

    // Add clock timer
    setInterval("pages.summary._updateClock()", 60000);

    new RateApp();
};

/**
 * Wrapper function(s) for dynamic click handling without having to call live / bind / die / unbind all the time
 */
Summary.prototype.leftTap = function() {
    if (typeof pages.summary.m_leftTapHandler === "function")
        pages.summary.m_leftTapHandler();
}
Summary.prototype.middleTap = function() {
    if (typeof pages.summary.m_middleTapHandler === "function")
        pages.summary.m_middleTapHandler();
};
Summary.prototype.rightTap = function() {
    if (typeof pages.summary.m_rightTapHandler === "function")
        pages.summary.m_rightTapHandler();
};

/**
 * Main timer which updates the display once a second
 */
Summary.prototype._mainTimer = function() {
    // Update display
    pages.summary._updateDisplay();
};

/**
 * Reset the display of the summary page to the values used during startup
 */
Summary.prototype._resetDisplay = function() {
    pages.summary.m_speedWidget.setValue('0.0');
    pages.summary.m_speedWidget.setSubInfo(0, '0.0');
    pages.summary.m_speedWidget.setSubInfo(1, '0.0');
    pages.summary.m_speedWidget.setIndicator(false, false);
    pages.summary.m_distanceWidget.setValue('0.00');
    pages.summary.m_timerWidget.setValue(getFormattedTimeDiff(0, true));
    pages.summary.m_altitudeWidget.setValue('0.0');
    pages.summary.m_altitudeWidget.setSubInfo(0, '0%');
    pages.summary.m_altitudeWidget.setSubInfo(1, '0%');
    pages.summary.m_heartrateWidget.setValue('0');
    pages.summary.m_heartrateWidget.setSubInfo(0, '0');
}

/**
 * Update the display of the app (regular interval, once a second)
 * @param bool p_bLoading true if we are loading a track
 */
Summary.prototype._updateDisplay = function(p_bLoading) {
    // Check if we have a track at all
    if (pages.summary.m_track === null)
        return;
    var waypoint = pages.summary.m_track.getCurrentWaypoint();
    // Check if we actually have an info yet
    if (waypoint === null)
        return;

    // Get reference to current coordinates
    var coords = waypoint.m_position.coords;

    // Calculate track duration
    var duration = 0;
    if (p_bLoading) {
        duration = pages.summary.m_track.getDuration();
    } else {
        duration = Utilities.getUnixTimestamp() - pages.summary.m_track.getStartTime();
    }
    // Substract pause from total duration
    duration -= pages.summary.m_track.getPauseTime();

    // Calculate average speed
    var avgSpeed = pages.summary.m_track.getTotalDistance() / duration * 3.6;
    var currSpeed = coords.speed * 3.6;
    if (isNaN(avgSpeed))
        avgSpeed = 0.00;
    // Check for speed timeout (means no new waypoint for a certain time)
    if (!p_bLoading && (Utilities.getUnixTimestamp() - waypoint.m_timestamp) >= 3) {
        currSpeed = 0.0;
    }

    // Current & average elevation rate
    var currElevation = waypoint.m_altitudeDiff / waypoint.m_distance * 100;
    if (isNaN(currElevation))
        currElevation = 0.00;
    var avgElevation = pages.summary.m_track.getElevationGain() / pages.summary.m_track.getTotalDistance() * 100;
    if (isNaN(avgElevation))
        avgElevation = 0.00;

    // Update display
    pages.summary.m_speedWidget.setValue((l10n.largeUnitValue(currSpeed)).toFixed(1));
    pages.summary.m_speedWidget.setSubInfo(0, l10n.largeUnitValue(avgSpeed).toFixed(1));
    pages.summary.m_speedWidget.setSubInfo(1, l10n.largeUnitValue(pages.summary.m_track.getMaximumSpeed() * 3.6).toFixed(1));
    pages.summary.m_speedWidget.setIndicator(currSpeed > avgSpeed, currSpeed < avgSpeed);
    pages.summary.m_distanceWidget.setValue(l10n.largeUnitValue(pages.summary.m_track.getTotalDistance() / 1000.0).toFixed(2));
    pages.summary.m_altitudeWidget.setValue(l10n.smallUnitValue(pages.summary.m_track.getElevationGain()).toFixed(1));
    pages.summary.m_altitudeWidget.setSubInfo(0, currElevation.toFixed(0) + '%');
    pages.summary.m_altitudeWidget.setSubInfo(1, avgElevation.toFixed(0) + '%');
    pages.summary.m_heartrateWidget.setValue(waypoint.m_heartrate);
    pages.summary.m_heartrateWidget.setSubInfo(0, pages.summary.m_track.getMaximumHeartrate());
    pages.summary.m_timerWidget.setValue(getFormattedTimeDiff(duration, true));
};

/**
 * Update image for accuracy display
 */
Summary.prototype._updateAccuracy = function(p_averageAccuracy) {
    var minimumAccuracy = SettingsHandler.get('minimumaccuracy');
    var imageSrc = 'images/wirelessSignalBad48.png';

    if (p_averageAccuracy < 0) {
        imageSrc = 'images/wirelessSignalOff48.png';
    } else if (p_averageAccuracy <= (minimumAccuracy / 2.0)) {
        imageSrc = 'images/wirelessSignalExcellent48.png';
    } else if (p_averageAccuracy <= minimumAccuracy) {
        imageSrc = 'images/wirelessSignalGood48.png';
    }

    // Finally set the new image src
    $('#summary-page_signal-strength').attr('src', imageSrc);
}

/**
 * Update unit labels based on selected display-units
 */
Summary.prototype.updateDisplayUnits = function() {
    pages.summary.m_speedWidget.setUnit(l10n.speedUnit());
    pages.summary.m_distanceWidget.setUnit(l10n.largeUnit());
    pages.summary.m_altitudeWidget.setUnit(l10n.smallUnit());
    pages.summary.m_odometerWidget.setUnit(l10n.largeUnit() + ' (odo)');
}

/**
 * Update & display odo value
 */
Summary.prototype._updateOdo = function(p_distance) {
    var odo = parseFloat(window.localStorage.getItem("odo"));
    if (isNaN(odo))
        odo = 0;

    if (p_distance !== undefined) {
        odo += p_distance;
    }
    window.localStorage.setItem("odo", odo);

    pages.summary.m_odometerWidget.setValue(l10n.largeUnitValue(odo / 1000.0).toFixed(1));
};

/**
 * Simple helper function which waits for the first GPS fix and starts the track once called
 */
Summary.prototype._gpsFixWait = function(p_position) {
    // Reset / hide sat-searching message
    $.mobile.loading('hide');

    // Update accuracy display
    pages.summary._updateAccuracy((p_position.coords.accuracy + p_position.coords.altitudeAccuracy) / 2.0);

    // Enable / disable buttons
    $('#left-button').button('enable');
    $('#right-button').button('enable');
    // Setup click handlers
    pages.summary.m_leftTapHandler = pages.summary._stopTap;
    pages.summary.m_rightTapHandler = pages.summary._startGPS;

    // Disable gpsfixwait callback
    GPSHandler.setPositionCallback(null);

    // Check if we automatically start tracking, but ignore first waypoint
    if (SettingsHandler.get('autostarttracking') > 0) {
        pages.summary._startGPS();
    }
};

/**
 * Helper function which starts searching for satellites and calls successCallback once we have a GPS lock
 */
Summary.prototype._searchForSatellites = function(p_successCallback, p_errorCallback) {
    // Define internal success callback
    var successCallback = function(p_position) {
        // Check if position is accurate enough
        if (p_position.coords.accuracy > SettingsHandler.getInt('minimumaccuracy'))
            return;

        // Reset / hide sat-searching message
        $.mobile.loading('hide');

        if (typeof p_successCallback === "function")
            p_successCallback(p_position);
    };

    // Define internal error callback
    var errorCallback = function(p_error) {
        // Reset / hide sat-searching message
        $.mobile.loading('hide');

        if (typeof p_errorCallback === "function")
            p_errorCallback(p_error);
    }

    // Show sat-search message
    $.mobile.loading('show', {text: $.i18n.prop("searching_message")});

    // Disable idle mode
    window.powerManagement.acquire(function() {
    }, errorCallback, true);

    // Start GPS
    GPSHandler.setPositionCallback(successCallback);
    GPSHandler.startGPS(SettingsHandler.get('positioninterval'));
}

/**
 * Enable GPS and start searching for a signal
 */
Summary.prototype.enableGPSTap = function() {
    // Reset display
    pages.summary._resetDisplay();

    // Enable / disable buttons
    $('#left-button').button('enable');
    $('#right-button').button('disable');
    // Setup click handlers
    pages.summary.m_leftTapHandler = pages.summary._stopTap;

    // Switch button display
    $('#summary-page_enableGPS').hide();
    $('#summary-page_control').show();

    // Show accuracy status image
    $('#settings-button').hide();
    $('#summary-page_sporttype-button').hide();
    $('#summary-page_signal-strength').show();

    // Start searching for satellites
    pages.summary._searchForSatellites(pages.summary._gpsFixWait, function(p_error) {
        MsgBox.show($.i18n.prop('suspend_message_error') + p_error);
        pages.summary._stopGPS();
    });

    // Check if user has a HRM selected
    /*var hrmType = SettingsHandler.getInt('hrmtype');
     console.log("hrmType: " + hrmType);
     if (hrmType > 0) {
     // Search for fitting hrm implementation
     for ( var i = 0; i < HeartRateMonitor.m_implementations.length; i++) {
     if (HeartRateMonitor.m_implementations[i].m_id === hrmType) {
     pages.summary.m_hrmImplementation = HeartRateMonitor.m_implementations[i];
     break;
     }
     }
     
     // If we found a HRM implementation, start the connection
     if (pages.summary.m_hrmImplementation !== null) {
     // Setup error handler for HRM
     pages.summary.m_hrmImplementation.setErrorCallback(function(p_error) {
     alert( 'HRM error: ' + p_error );
     });
     
     // Called when we receive a new HRM value
     pages.summary.m_hrmImplementation.setCallback(function(p_hrm) {
     pages.summary.m_heartrateWidget.setValue( p_hrm );
     if( pages.summary.m_track !== null ) {
     pages.summary.m_track.addHeartrate( p_hrm );
     }
     });
     
     // List all devices and connect to first found
     pages.summary.m_hrmImplementation.listDevices(function(p_devices) {
     console.log('Found devices: ' + p_devices);
     if (p_devices.length > 0) {
     var device = p_devices[0];
     
     // Connect to devie & start reading
     pages.summary.m_hrmImplementation.connect(device.id);
     }
     });
     }
     }*/

    // Check if auto-locking is on (but only apply it if we also enable autostart of tracking)
    if (SettingsHandler.get('autostarttracking') > 0 && SettingsHandler.get('autolock') > 0) {
        pages.summary._lock();
    }
}

/**
 * Called when GPS tracking is ready & should be started
 */
Summary.prototype._startGPS = function() {
    // Start the new track
    pages.summary.m_track = new Track(SettingsHandler.get('sporttype'));
    GOFGSportsComputer.m_trackDirectoryEntry.getFile(Utilities.getUnixTimestamp() + ".gsc", {
        create: true,
        exclusive: true
    }, function(p_fileEntry) {
    	// remember track-fileEntry
    	pages.summary.m_trackFileEntry = p_fileEntry;
    	
        // Create track-writer object & write initial information
        pages.summary.m_trackwriter = new TrackWriter(pages.summary.m_track, pages.summary.m_trackFileEntry);
        pages.summary.m_trackwriter.writeInfo();

        // Enable / disable buttons
        $('#left-button').button('enable');
        $('#right-button').button('enable');
        // Update button icons
        $('#right-button').parent().find('.ui-icon').removeClass('ui-icon-gofgsc-play').addClass('ui-icon-gofgsc-pause');
        // Setup click handlers
        pages.summary.m_leftTapHandler = pages.summary._stopTap;
        pages.summary.m_rightTapHandler = pages.summary._pause;

        // Start updating our interface
        pages.summary.m_mainTimer = setInterval("pages.summary._mainTimer()", 1000);

        // Check if auto-locking is on
        if (SettingsHandler.get('autolock') > 0) {
            pages.summary._lock();
        }

        // Notify map- & altitude-screen of new track
        pages.map.newtrack();
        pages.graph.newtrack();

        // Set position callback
        GPSHandler.setPositionCallback(pages.summary._updatePosition);
    }, function(p_fileError) {
        MsgBox.show('Error while trying to open track for writing. The error returned is: ' + p_fileError.code);
        pages.summary._stopGPS();
    });
};

/**
 * Button onClick-handler for stopping GPS tracking
 */
Summary.prototype._stopGPS = function() {
    // Hide accuracy status image & update it
    $('#summary-page_signal-strength').hide();
    pages.summary._updateAccuracy(-1);

    // Switch button display
    $('#summary-page_control').fadeOut(250, function() {
        $('#summary-page_enableGPS').fadeIn(250);
    });
    $('#settings-button').show();
    $('#summary-page_sporttype-button').show();

    // Reset loading message (because searching for satellites might still be active)
    $.mobile.loading('hide');

    // Update button icons
    $('#right-button').parent().find('.ui-icon').removeClass('ui-icon-gofgsc-pause').addClass('ui-icon-gofgsc-play');

    // Stop GPS & release power lock
    GPSHandler.stopGPS();
    window.powerManagement.release(function() {
    }, function(e) {
    });

    // Check if there is an active HRM
    if (pages.summary.m_hrmImplementation !== null) {
        pages.summary.m_hrmImplementation.disconnect();
        pages.summary.m_hrmImplementation = null;
    }

    // No more actions to take if track didn't start yet
    if (pages.summary.m_track === null)
        return;

    // Disable interface timer
    if (pages.summary.m_mainTimer !== 0)
        clearInterval(pages.summary.m_mainTimer);
    pages.summary.m_mainTimer = 0;

    // Finalize track
    pages.summary.m_trackwriter.writeWaypoint(true);

    // Notify map- & altitude-screen of ending track
    pages.map.endtrack(pages.summary.m_track);
    pages.graph.endtrack(pages.summary.m_track);

    // automatically upload the track (if enabled in settings)
    if (SettingsHandler.getInt("automaticupload") > 0) {
    	pages.summary._autoUploadTrack();
    }

    // Remove references to closed tracks
    pages.summary.m_track = null;
    pages.summary.m_trackwriter = null;
    pages.summary.m_trackFileEntry = null;
};

/**
 * called when the user clicks on stop
 */
Summary.prototype._stopTap = function() {
    if (SettingsHandler.getInt("confirmstop") > 0) {
        MsgBox.confirm($.i18n.prop('stop_message'), function(p_button) {
            if (p_button === MsgBox.BUTTON_YES) {
                pages.summary._stopGPS();
            }
        });
    }
    else {
        pages.summary._stopGPS();
    }
}

/**
 * Called when the pause button is clicked
 */
Summary.prototype._pause = function() {
    // Enable / disable buttons
    $('#left-button').button('enable');
    $('#right-button').button('enable');
    // Update button icons
    $('#right-button').parent().find('.ui-icon').removeClass('ui-icon-gofgsc-pause').addClass('ui-icon-gofgsc-play');
    // Setup click handler
    pages.summary.m_leftTapHandler = pages.summary._stopTap;
    pages.summary.m_rightTapHandler = pages.summary._resume;

    // Stop GPS tracking
    GPSHandler.stopGPS();
    // Disable interface timer
    if (pages.summary.m_mainTimer !== 0)
        clearInterval(pages.summary.m_mainTimer);
    pages.summary.m_mainTimer = 0;
    // Enable suspend
    window.powerManagement.release(function() {
    }, function(e) {
    });
};

/**
 * Called when the resume button is clicked
 */
Summary.prototype._resume = function() {
    // Enable / disable buttons
    $('#left-button').button('enable');
    $('#right-button').button('enable');
    // Update button icons
    $('#right-button').parent().find('.ui-icon').removeClass('ui-icon-gofgsc-play').addClass('ui-icon-gofgsc-pause');
    // Setup click handler
    pages.summary.m_leftTapHandler = pages.summary._stopTap;
    pages.summary.m_rightTapHandler = pages.summary._pause;

    // Pause is ending
    pages.summary.m_bPauseEnding = true;

    // Start searching for GPS signal again
    pages.summary._searchForSatellites(function(p_position) {
        // Setup new position callback
        GPSHandler.setPositionCallback(pages.summary._updatePosition);

        // Call position callback with current position
        pages.summary._updatePosition(p_position);

        // Start updating our interface
        pages.summary.m_mainTimer = setInterval("pages.summary._mainTimer()", 1000);
    }, function(p_error) {
        MsgBox.show($.i18n.prop('suspend_message_error') + p_error);
        pages.summary._stopGPS();
    });
};

/**
 * Callback when the lock button is clicked
 */
Summary.prototype._lock = function() {
    $('#lock-overlay').show();
};

/**
 * Callback for the GPSHandler which is called whenever the GPS position is updated
 */
Summary.prototype._updatePosition = function(p_position) {
    // Update accuracy display
    pages.summary._updateAccuracy((p_position.coords.accuracy + p_position.coords.altitudeAccuracy) / 2.0);

    // Check if position is accurate enough
    if (p_position.coords.accuracy > SettingsHandler.getInt('minimumaccuracy'))
        return;

    // Calculate distance
    var distance = 0;
    var waypoint = pages.summary.m_track.getCurrentWaypoint();

    if (waypoint !== null) {
        distance = Utilities.haversineDistance(waypoint.m_position.coords, p_position.coords);

        // Check if new waypoint is out of the tolerance of the last one
        if (distance <= waypoint.m_position.coords.accuracy)
            return;

        // Check if altitude accuracy is outside the minimum accuracy
        if (p_position.coords.altitudeAccuracy > SettingsHandler.getInt('minimumaccuracy')) {
            p_position.coords.altitude = waypoint.m_position.coords.altitude;
        }

        // Check if altitude difference is within tolerance
        if (Math.abs(waypoint.m_position.coords.altitude - p_position.coords.altitude) < SettingsHandler.getInt('minimumaltitudechange')) {
            p_position.coords.altitude = waypoint.m_position.coords.altitude;
        }

        // Update odo (total distance - see odometer)
        pages.summary._updateOdo(distance);
    }

    // Update track information
    pages.summary.m_track.addPosition(p_position, distance, pages.summary.m_bPauseEnding);
    pages.summary.m_trackwriter.writeWaypoint();
    pages.summary.m_bPauseEnding = false;

    // Pass waypoint on to map- & altitude-screen
    pages.map.waypoint(pages.summary.m_track.getCurrentWaypoint(), pages.summary.m_track);
    pages.graph.waypoint(pages.summary.m_track.getCurrentWaypoint(), pages.summary.m_track);
};

/**
 * Called by the GPSHandler if there was an error
 */
Summary.prototype._positionError = function(p_positionError) {
    // ignore "The last location provider is no longer available" on Android
    if (device.platform.toLowerCase() == "android" && p_positionError.code == 2)
        return;

    MsgBox.show($.i18n.prop('position_message_error') + p_positionError.message + " (" + p_positionError.code + ")");
}

/**
 * Updates the clock (called once a minute)
 */
Summary.prototype._updateClock = function() {
    pages.summary.m_clockWidget.setValue(formatDate(new Date()));
};

/**
 * Called on track end to automatically upload it
 */
Summary.prototype._autoUploadTrack = function() {
    // Show loading & start uploading
    $.mobile.loading('show', {text: $.i18n.prop("upload_message")});

    // Disable idle mode
    window.powerManagement.acquire(function() {
        // start uploading the track
        var tu = new TrackUploader(SettingsHandler.get('authkey'), pages.summary.m_trackFileEntry, function(p_id_track) {
            // hide loading message
            $.mobile.loading('hide');
            // enable idle mode again
            window.powerManagement.release(function() {}, function() {});
            
            // fetch localStorage entry for already uploaded tracks
            window.localStorage.setItem("uploadedTracks_" + pages.summary.m_trackFileEntry.name, true);

            // show success message
            MsgBox.show($.i18n.prop("upload_message_success"), '', MsgBox.BUTTON_OK | MsgBox.BUTTON_OPEN_TRACK, function(p_button) {
                if (p_button == MsgBox.BUTTON_OPEN_TRACK) {
                    var trackUrl = SettingsHandler.URL_trackDisplay + p_id_track;

                    // open link to track
                    switch (device.platform) {
                        case 'Android':
                            navigator.app.loadUrl(trackUrl, {openExternal: true});
                            break;
                        default:
                            window.open(trackUrl, '_system');
                            break;
                    }
                }
            });
        }, function(textStatus) {
            // hide loading message
            $.mobile.loading('hide');
            // enable idle mode again
            window.powerManagement.release(function() {}, function() {});

            MsgBox.show($.i18n.prop("upload_message_error") + " " + textStatus);
        });
    }, function(p_error) {
        // hide loading message
        $.mobile.loading('hide');
        // show power management error
        MsgBox.show($.i18n.prop('suspend_message_error') + p_error);
    }, true);
};

/**
 * Try to load a track from a given fileEntry
 */
Summary.prototype.loadTrack = function(p_fileEntry) {
    // Notify map & altitude-graph of new track
    pages.map.newtrack();
    pages.graph.newtrack();
    // Reset display
    pages.summary._resetDisplay();
    // Start reading the track
    var trackReader = new TrackReader(p_fileEntry, function(p_waypoint, p_track) {
        pages.map.waypoint(p_waypoint, p_track);
        pages.graph.waypoint(p_waypoint, p_track);
    }, function(p_track) {
        pages.summary.m_track = p_track;
        pages.summary._updateDisplay(true);

        // Finish track
        pages.map.endtrack(p_track);
        pages.graph.endtrack(p_track);
        pages.summary.m_track = null;

        // Display summary page
        $.mobile.changePage("summary.html");
    }, null);
}

/**
 * Set the widgets to "dirty" (meaning that they should redraw the next time)
 */
Summary.prototype.setWidgetDirty = function() {
    pages.summary.m_bWidgetDirty = true;
}

/**
 * Invoked on first display to size & configure all the display panels
 */
Summary.prototype._pageshow = function(p_event, p_ui) {
    // Check if we need to rescale
    if (!pages.summary.m_bWidgetDirty)
        return;
    
    // check if content height was not calculated previously (which means this is the first display)
    if (pages.summary.m_contentHeight <= 0) {
        // Calculate available height for content
        pages.summary.m_contentHeight = $(window).height();
        pages.summary.m_contentHeight -= $('#summary-page > [data-role="header"]').outerHeight(true);
        pages.summary.m_contentHeight -= ($('#summary-page > [data-role="content"]').outerHeight(true) - $('#summary-page > [data-role="content"]').height());
        pages.summary.m_contentHeight -= $('#summary-page_control').outerHeight(true);
        pages.summary.m_contentHeight -= $('#summary-page_footer').outerHeight(true);
        pages.summary.m_contentHeight -= $('#summary-page_app-bar').outerHeight(true);

        // hide the control buttons (used only for initial height calculations)
        $('#summary-page_control').hide();
    }

    // Set fixed page height
    $('#summary-page').height($(window).height() - $('#summary-page_footer').outerHeight(true));

    // Calculate available height for each row
    var rowDivider = 4;
    var rowHeight = (pages.summary.m_contentHeight / rowDivider).toFixed(0);

    // Show HRM widget if enabled
    if (SettingsHandler.getInt('enablehrm')) {
        $('#heartrate-infowidget').show();
        rowDivider = 5;
    }
    else {
        $('#heartrate-infowidget').hide();
    }

    // Show measurement-span of infowidget class
    InfoWidget.measurementSpan.show();

    // Adjust infowidget sizes
    pages.summary.m_speedWidget.setOptions({
        size: {
            width: 'auto',
            height: rowHeight
        }
    });
    pages.summary.m_speedWidget.autoSize();
    pages.summary.m_distanceWidget.setOptions({
        size: {
            width: 'auto',
            height: rowHeight
        }
    });
    pages.summary.m_distanceWidget.autoSize();
    pages.summary.m_timerWidget.setOptions({
        size: {
            width: 'auto',
            height: rowHeight
        }
    });
    pages.summary.m_timerWidget.autoSize();
    pages.summary.m_altitudeWidget.setOptions({
        size: {
            width: 'auto',
            height: rowHeight
        }
    });
    pages.summary.m_altitudeWidget.autoSize();
    pages.summary.m_heartrateWidget.setOptions({
        size: {
            width: 'auto',
            height: rowHeight
        }
    });
    pages.summary.m_heartrateWidget.autoSize();
    pages.summary.m_clockWidget.setOptions({
        size: {
            width: 'auto',
            height: pages.summary.m_contentHeight - rowHeight * (rowDivider - 1)
        }
    });
    pages.summary.m_clockWidget.autoSize();
    pages.summary.m_odometerWidget.setOptions({
        size: {
            width: 'auto',
            height: pages.summary.m_contentHeight - rowHeight * (rowDivider - 1)
        }
    });
    pages.summary.m_odometerWidget.autoSize();

    // Hide the info widget
    InfoWidget.measurementSpan.hide();

    // Update odometer & display units
    pages.summary._updateOdo();
    pages.summary.updateDisplayUnits();

    // Update clock
    pages.summary._updateClock();

    // We are all clean now
    pages.summary.m_bWidgetDirty = false;
};

new Summary();
