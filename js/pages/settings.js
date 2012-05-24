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

function Settings() {
}
Settings.prototype = new Page("settings");
//Settings.prototype.rightPage = "tracks.html";

/**
 * Called when the page is created
 */
Settings.prototype.oninit = function() {
	$('#settings-page').bind('pagebeforeshow', pages.settings._pagebeforeshow);
	$('#settings-page').find('#settings-save-button').bind('click', pages.settings._save);

	// Bind change events
	$('#settings-page').find('input').bind('change', pages.settings._changed);
	$('#settings-page').find('select').bind('change', pages.settings._changed);

	// Bind button events
	$('#settings-page').find('#settings-odoReset-button').bind('click', pages.settings._odoReset);
};

Settings.prototype.oncreate = function() {
	// Append all available HRM implementation
	var hrmTypeSelect = $('#hrmTypeSelect');
	for ( var i = 0; i < HeartRateMonitor.m_implementations.length; i++) {
		if (HeartRateMonitor.m_implementations[i].isSupported()) {
			hrmTypeSelect.append($('<option value="' + HeartRateMonitor.m_implementations[i].m_id + '">' + HeartRateMonitor.m_implementations[i].m_name + '</option>'));
		} else {
			console.log('Sorry, ' + HeartRateMonitor.m_implementations[i].m_name + ' is not supported!');
		}
	}
}

/**
 * Called when the user clicks the save-button
 * Updates all settings and forces a save to disk
 */
Settings.prototype._save = function() {
	// Store all settings in settingshandler & save them
	SettingsHandler.set('minimumaccuracy', $('#settings-page').find('#minAccuracySlider').val());
	SettingsHandler.set('minimumaltitudechange', $('#settings-page').find('#minAltitudeChangeSlider').val());
	SettingsHandler.set('showdidyouknow', $('#settings-page').find('#showdidyouknowSlider').val());
	SettingsHandler.set('language', $('#settings-page').find('#languageSelect').val());
	SettingsHandler.set('gpsinterval', $('#settings-page').find('#gpsIntervalSlider').val());
	SettingsHandler.set('autostarttracking', $('#settings-page').find('#autostartTrackingSlider').val());
	SettingsHandler.set('authkey', $('#settings-page').find('#authKeyInput').val());
	SettingsHandler.set('autolock', $('#settings-page').find('#autolockSlider').val());
	SettingsHandler.set('displayunits', $('#settings-page').find('#displayUnitSelect').val());
	SettingsHandler.set('hrmtype', $('#settings-page').find('#hrmTypeSelect').val());
	SettingsHandler._save();

	// Init re-translation
	Translator.changeLanguage(SettingsHandler.get('language'));
	// Update display units
	pages.graph.updateDisplayUnits();

	$('#settings-page').find('#settings-save-button').hide();
};

/**
 * Called whenever a setting changes (displays save button for settings)
 */
Settings.prototype._changed = function() {
	$('#settings-page').find('#settings-save-button').show();
};

/**
 * Called when the user clicks on the reset odo-meter button
 */
Settings.prototype._odoReset = function() {
	MsgBox.confirm("Do you really want to reset the ODO-meter value?", function(p_button) {
		if (p_button === MsgBox.BUTTON_YES) {
			window.localStorage.setItem("odo", 0.0);
			pages.summary._updateOdo();
		}
	});
};

/**
 * Called short before the page is displayed
 */
Settings.prototype._pagebeforeshow = function(p_event, p_ui) {
	// Read values from settings handler
	$('#settings-page').find('#minAccuracySlider').val(SettingsHandler.get('minimumaccuracy')).slider('refresh');
	$('#settings-page').find('#minAltitudeChangeSlider').val(SettingsHandler.get('minimumaltitudechange')).slider('refresh');
	$('#settings-page').find('#languageSelect').val(SettingsHandler.get('language')).selectmenu('refresh');
	$('#settings-page').find('#gpsIntervalSlider').val(SettingsHandler.get('gpsinterval')).slider('refresh');
	$('#settings-page').find('#autostartTrackingSlider').slider('refresh', SettingsHandler.get('autostarttracking'));
	$('#settings-page').find('#authKeyInput').val(SettingsHandler.get('authkey'));
	$('#settings-page').find('#autolockSlider').slider('refresh', SettingsHandler.get('autolock'));
	$('#settings-page').find('#displayUnitSelect').val(SettingsHandler.get('displayunits')).selectmenu('refresh');
	$('#settings-page').find('#hrmTypeSelect').val(SettingsHandler.get('hrmtype')).selectmenu('refresh');
	// Setup page layout
	$('#settings-page').find('#settings-save-button').hide();
	$('#settings-page').find('#settings-odoReset-button').show();
};

new Settings();
