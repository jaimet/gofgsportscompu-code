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

pages.settings = {
		init : function() {
			console.log( "settings-page loaded!" );
			
			$( '#settings-page' ).live( 'pagebeforeshow', pages.settings._pagebeforeshow );
		},
		
		_pagebeforeshow : function( p_event, p_ui ) {
			$( '#settings-page' ).find( '#minAccuracySlider' ).val( SettingsHandler.get( 'minimumaccuracy' ) ).slider( 'refresh' );
		}
};
