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
			// Translate the page
			Translator.register( $('#settings-page') );
			
			$( '#settings-page' ).live( 'pagebeforeshow', pages.settings._pagebeforeshow );
			$( '#settings-page' ).find( '#settings-save-button' ).bind( 'tap', pages.settings._save );
			
			// Bind change events
			$( '#settings-page' ).find( 'input' ).bind( 'change', pages.settings._changed );
			$( '#settings-page' ).find( 'select' ).bind( 'change', pages.settings._changed );
		},
		
		_save : function() {
			console.log( "settings-page save!" );
			
			SettingsHandler.set( 'minimumaccuracy', $( '#settings-page' ).find( '#minAccuracySlider' ).val() );
			SettingsHandler.set( 'minimumaltitudeaccuracy', $( '#settings-page' ).find( '#minAltitudeAccuracySlider' ).val() );
			SettingsHandler.set( 'minimumaltitudechange', $( '#settings-page' ).find( '#minAltitudeChangeSlider' ).val() );
			SettingsHandler.set( 'showdidyouknow', $( '#settings-page' ).find( '#showdidyouknowSlider' ).val() );
			SettingsHandler.set( 'language', $( '#settings-page' ).find( '#languageSelect' ).val() );
			SettingsHandler._save();
			
			// Init re-translation
			Translator.changeLanguage(SettingsHandler.get( 'language' ));

			$( '#settings-page' ).find( '#settings-save-button' ).hide();
		},
		
		_changed : function() {
			$( '#settings-page' ).find( '#settings-save-button' ).show();
		},
		
		_pagebeforeshow : function( p_event, p_ui ) {
			// Read values from settings handler
			$( '#settings-page' ).find( '#minAccuracySlider' ).val( SettingsHandler.get( 'minimumaccuracy' ) ).slider( 'refresh' );
			$( '#settings-page' ).find( '#minAltitudeAccuracySlider' ).val( SettingsHandler.get( 'minimumaltitudeaccuracy' ) ).slider( 'refresh' );
			$( '#settings-page' ).find( '#minAltitudeChangeSlider' ).val( SettingsHandler.get( 'minimumaltitudechange' ) ).slider( 'refresh' );
			$( '#settings-page' ).find( '#showdidyouknowSlider' ).val( SettingsHandler.get( 'showdidyouknow' ) ).slider( 'refresh' );
			$( '#settings-page' ).find( '#languageSelect' ).val( SettingsHandler.get( 'language' ) ).selectmenu( 'refresh' );
			// Setup page layout
			$( '#settings-page' ).find( '#settings-save-button' ).hide();
		}
};
