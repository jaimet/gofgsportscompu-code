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
	this.m_counter = SettingsHandler.getInt("ratemecounter");
	this.m_rated = SettingsHandler.getInt("apprated");
	this.m_rated = 0;
	
	this.m_counter += 1;
	
	console.log('RateApp: ' + this.m_counter + ' / ' + this.m_rated);
	
	if( this.m_rated <= 0 ) {
		// update rate-me-counter
		SettingsHandler.set("ratemecounter", this.m_counter);
		SettingsHandler._save();
		
		// only ask user every X starts
		if( (this.m_counter % 1) == 0 ) {
			console.log('confirming');
			navigator.notification.confirm('Do you enjoy GOFG Sports Computer? If yes please take a minute and rate our app!', function(p_button) {
				if( p_button == 1 || p_button == 3 ) {
					if( p_button == 1 ) {
						// open market for rating
						window.open('market://details?id=at.gofg.sportscomputer');
					}
					
					// save that we've rated
					SettingsHandler.set("apprated", 1);
					SettingsHandler._save();
				}
			}, 'Rate GOFG Sports Computer', 'Rate GOFG SC,Later,No thanks');
		}
	}
}

RateApp.prototype.m_counter = 0;
RateApp.prototype.m_rated = 0;
