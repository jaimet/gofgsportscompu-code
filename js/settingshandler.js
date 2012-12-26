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

var SettingsHandler = {
	m_appDirectoryEntry : null,
	m_settingsStore : {
		"minimumaccuracy" : 10,
		"minimumaltitudechange" : 15,
		"licenseagreed" : 0,
		"language" : ((navigator.language) ? navigator.language : navigator.browserLanguage).substr(0, 2).toLowerCase(),
		"gpsinterval" : 3, // Interval (in seconds) which is used to receive new GPS position updates
		"autostarttracking" : 1, // Automatically start tracking once the GPS signal is active
		"trackuploadurl" : "", // Hardcoded path to track upload-URL
		"authkey" : "", // Key for authentication against the GOFG system
		"autolock" : 1, // Automatically lock screen once tracking has started
		"displayunits" : 1, // Unit(s) to use for displaying values
		"uploadagree_3" : 0, // Agreed to the upload agreement
		"hrmtype" : 0,
		"enablehrm": 0,	// Enable heart rate monitor
		"sporttype": "cycling",	// Default sport type
		"confirmstop": 0,	// confirm stop of tracking
	},
	m_settingsFileEntry : null,
	onload : function() {
	}, // Called when the settings have been loaded

	init : function(p_appDirectoryEntry) {
		SettingsHandler.m_appDirectoryEntry = p_appDirectoryEntry;
		SettingsHandler.m_appDirectoryEntry.getFile("gsc_settings.xml", {
			create : true,
			exclusive : false
		}, SettingsHandler._settingsFileEntry, SettingsHandler._fileError);
	},

	/**
	 * Return value without pre-parsing, null if not found
	 */
	get : function(p_key) {
		if (p_key in SettingsHandler.m_settingsStore) {
			return SettingsHandler.m_settingsStore[p_key];
		}

		return null;
	},

	/**
	 * Return a settings parsed as integer value, null if invalid
	 */
	getInt : function(p_key) {
		var val = parseInt(SettingsHandler.get(p_key));

		// Check if we do not have a number
		if (isNaN(val)) return null;

		// Return parsed value
		return val;
	},

	set : function(p_key, p_value) {
		if (p_key in SettingsHandler.m_settingsStore) {
			SettingsHandler.m_settingsStore[p_key] = p_value;
		}
	},

	_save : function() {
		SettingsHandler.m_settingsFileEntry.createWriter(function(p_fileWriter) {
			// Create settings header
			var settingsString = "<?xml version='1.0' encoding='UTF-8' ?>\n";
			settingsString += "<settings>\n";

			$.each(SettingsHandler.m_settingsStore, function(p_key, p_value) {
				settingsString += "\t<" + p_key + ">" + p_value + "</" + p_key + ">\n";
			});

			settingsString += '</settings>';

			p_fileWriter.write(settingsString);
		}, SettingsHandler._fileError);
	},

	_settingsFileEntry : function(p_fileEntry) {
		SettingsHandler.m_settingsFileEntry = p_fileEntry;

		SettingsHandler.m_settingsFileEntry.file(function(p_file) {
			var reader = new FileReader();
			reader.onload = function(p_evt) {
				if (p_evt.target.result.length > 0) {
					var xmlDoc = $.parseXML(p_evt.target.result);

					$(xmlDoc).find("settings > *").each(function(p_index, p_element) {
						SettingsHandler.m_settingsStore[this.nodeName.toLowerCase()] = $(this).text();
					});
				}
				// force disabled hrm
				SettingsHandler.m_settingsStore['enablehrm'] = 0;
				// Notify others
				if (typeof SettingsHandler.onload === "function") SettingsHandler.onload();
			};
			reader.readAsText(p_file);
		}, this._fileError);
	},

	_fileError : function(p_fileError) {
		console.log("Error while handling settings file: " + p_fileError);
	}
};
