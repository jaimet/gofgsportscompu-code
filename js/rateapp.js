/*
 * Copyright (C) 2013 Wolfgang Koller
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

function RateApp() {
	this.m_counter = SettingsHandler.getInt("appratecounter");
	this.m_rated = SettingsHandler.getInt("apprated");
	this.m_notRated = SettingsHandler.getInt("appnotrated");
	this.m_counter += 1;
	
	// check if user did not rate yet, or does not want to rate
	if( this.m_rated <= 0 && this.m_notRated != 1 ) {
		// update rate-me-counter
		SettingsHandler.set("appratecounter", this.m_counter);
		SettingsHandler._save();
		
		// only ask user every X starts
		if( (this.m_counter % 10) == 0 ) {
			navigator.notification.confirm('Do you enjoy GOFG Sports Computer? If yes please take a minute and rate our app!', function(p_button) {
				if( p_button == 1 ) {
					switch (device.platform) {
					case 'Android':
						// open play store for rating
						window.open('market://details?id=at.gofg.sportscomputer');
						break;
			        case 'WinCE':
						// open marketplace for rating
			        	exec(null, null, 'RateApp', 'rate', []);
			            break;
			        case 'iPhone':
						// open AppStore for rating
			        	window.open('itms://itunes.apple.com/at/app/gofg-sc/id453824252?mt=8&uo=4');
						break;
					}
					
					// save that we've rated
					SettingsHandler.set("apprated", 1);
					SettingsHandler._save();
				}
				else if( p_button == 3 ) {
					// save that user does not want to rate
					SettingsHandler.set("appnotrated", 1);
					SettingsHandler._save();
				}
			}, 'Rate GOFG Sports Computer', 'Rate GOFG SC,Later,No thanks');
		}
	}
}

RateApp.prototype.m_counter = 0;
RateApp.prototype.m_rated = 0;
RateApp.prototype.m_notRated = 0;
