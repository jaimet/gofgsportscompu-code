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

var GOFGSportsComputer = {
	m_persistentFileSystem : null, // Reference to the persistent file-system
	m_appDirectoryEntry : null, // Reference to the app directory entry
	m_trackDirectoryEntry : null, // Reference to the track directory entry
	m_exportDirectoryEntry : null, // Reference to the export directory entry

	/**
	 * Settings have been loaded (called by SettingsHandler.onload)
	 */
	_settingsReady : function() {
		// Translate empty page
		Translator.register($('#empty-page'));

		// Translate lock-overlay
		Translator.register($('#lock-overlay'));

		Translator.ontranslate = function() {
			// Check if the user already agreed to our license
			if (SettingsHandler.get("licenseagreed") == 0) {
				$.mobile.changePage('license.html');
			} else {
				// Change to summary page
				$.mobile.changePage('summary.html');
			}

			Translator.ontranslate = null;
		}

		Translator.changeLanguage(SettingsHandler.get('language'));
	},

	/**
	 * Startup function which setups the sports computer software (init, interface, etc.)
	 */
	_deviceReady : function() {
		// Bind swipe event to lock-overlay
		$('#lock-overlay').bind('swipe', function() {
			$(this).hide();
		});

		// Listen to back button events
		$(document).bind('backbutton', Page.backInHistory);
		
		// Load the correct stylesheet for jquery-mobile
		var link_style = $('<link rel="stylesheet" />');
		var script_style = $('<script type="text/javascript" src=""></script>');
		switch (device.platform) {
		case 'Android':
			link_style.attr('href', 'lib/jquery.mobile/themes/android/AndroidHoloDarkLight.css');
			break;
		case 'iPhone':
			link_style.attr('href', 'lib/jquery.mobile/themes/ios/styles.css');
			break;
        case 'WinCE':
            link_style.attr('href', 'lib/jquery.mobile/themes/wp/jquery.mobile.wp.theme.css');
            script_style.attr('src', 'lib/jquery.mobile/themes/wp/jquery.mobile.wp.theme.init.js');
            break;
        default:
			link_style.attr('href', 'lib/jquery.mobile/jquery.mobile.css');
			break;
		}
		$('#jqm-theme-css').before( link_style );
		$('#jqm-js').after(script_style);

		// Find our file storage
		window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, GOFGSportsComputer._fileSystem, GOFGSportsComputer._fileSystemError);
	},

	_fileSystem : function(p_fileSystem) {
		GOFGSportsComputer.m_persistentFileSystem = p_fileSystem;

		// Make sure our app data folder exist
		GOFGSportsComputer.m_persistentFileSystem.root.getDirectory("at.gofg.sportscomputer", {
			create : true,
			exclusive : false
		}, GOFGSportsComputer._appDirectory, GOFGSportsComputer._appDirectoryError);
	},

	/**
	 * Called when the app directory was successfully accessed and is ready for use
	 */
	_appDirectory : function(p_directoryEntry) {
		GOFGSportsComputer.m_appDirectoryEntry = p_directoryEntry;

		// Get the track folder entry
		GOFGSportsComputer.m_appDirectoryEntry.getDirectory("tracks", {
			create : true,
			exclusive : false
		}, GOFGSportsComputer._trackDirectory, GOFGSportsComputer._trackDirectoryError);
	},

	/**
	 * Called when the application directory could now be accessed, will fall back to default directory then
	 */
	_appDirectoryError : function(p_fileError) {
		GOFGSportsComputer._fileSystemError(p_fileError);

		// Fallback to default root directory
		GOFGSportsComputer._appDirectory(GOFGSportsComputer.m_persistentFileSystem.root);
	},

	/**
	 * Called when the track directory was successfully accessed and is ready for use
	 */
	_trackDirectory : function(p_directoryEntry) {
		GOFGSportsComputer.m_trackDirectoryEntry = p_directoryEntry;

		// Get the export folder entry
		GOFGSportsComputer.m_appDirectoryEntry.getDirectory("exports", {
			create : true,
			exclusive : false
		}, GOFGSportsComputer._exportDirectory, GOFGSportsComputer._exportDirectoryError);
	},

	/**
	 * Called when the track directory could now be accessed, will fall back to app directory then
	 */
	_trackDirectoryError : function(p_fileError) {
		GOFGSportsComputer._fileSystemError(p_fileError);

		// Fallback to the app directory
		GOFGSportsComputer._trackDirectory(GOFGSportsComputer.m_appDirectoryEntry);
	},

	/**
	 * Called when the export directory was successfully accessed and is ready for use
	 */
	_exportDirectory : function(p_directoryEntry) {
		GOFGSportsComputer.m_exportDirectoryEntry = p_directoryEntry;

		// Initialize settings handler
		SettingsHandler.onload = GOFGSportsComputer._settingsReady;
		SettingsHandler.init(GOFGSportsComputer.m_appDirectoryEntry);
	},

	/**
	 * Called when the export directory could now be accessed, will fall back to app directory then
	 */
	_exportDirectoryError : function(p_fileError) {
		GOFGSportsComputer._fileSystemError(p_fileError);

		// Fallback to the app directory
		GOFGSportsComputer._exportDirectory(GOFGSportsComputer.m_appDirectoryEntry);
	},

	/**
	 * Simple error handler for any FileErrors that might occur
	 */
	_fileSystemError : function(p_fileError) {
		MsgBox.error("Error while operating on the file-system: " + p_fileError.code + " / " + p_fileError.name);
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
function getFormattedTime(p_hours, p_minutes, p_seconds, p_bSeconds) {
	var formattedTime = p_hours;

	if (p_hours < 10) formattedTime = "0" + p_hours;

	if (p_minutes < 10) {
		formattedTime += ":0" + p_minutes;
	} else {
		formattedTime += ":" + p_minutes;
	}

	if (p_bSeconds) {
		if (p_seconds < 10) {
			formattedTime += ":0" + p_seconds;
		} else {
			formattedTime += ":" + p_seconds;
		}
	}

	return formattedTime;
}

function formatDate(p_date, p_bSeconds) {
	return getFormattedTime(p_date.getHours(), p_date.getMinutes(), p_date.getSeconds(), p_bSeconds);
}

function getFormattedTimeDiff(p_timeDiff) {
	var hours = parseInt(p_timeDiff / 3600);
	p_timeDiff -= 3600 * hours;
	var minutes = parseInt(p_timeDiff / 60);
	var seconds = p_timeDiff - minutes * 60;

	return getFormattedTime(hours, minutes, seconds, true);
}

/**
 * Application starts here
 */
$(document).ready(function() {
	document.addEventListener("deviceready", GOFGSportsComputer._deviceReady, true);
	
	//$.mobile.changePage('summary.html');
});
