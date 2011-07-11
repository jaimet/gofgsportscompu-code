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

var SettingsHandler = {
	m_appDirectoryEntry : null,
	m_settingsStore : {
		"minimumaccuracy" : 25,
		"minimumaltitudeaccuracy" : 10,
		"minimumaltitudechange" : 3,
		"showdidyouknow" : 'show',
	},
	m_settingsFileEntry : null,
	
	init : function( p_appDirectoryEntry ) {
		SettingsHandler.m_appDirectoryEntry = p_appDirectoryEntry;
		
		SettingsHandler.m_appDirectoryEntry.getFile( "gsc_settings.xml", { create: true, exclusive: false }, SettingsHandler._settingsFileEntry, SettingsHandler._fileError );
	},
	
	get : function( p_key ) {
		if( p_key in SettingsHandler.m_settingsStore ) {
			return SettingsHandler.m_settingsStore[p_key];
		}
		
		return null;
	},
	
	set : function( p_key, p_value ) {
		if( p_key in SettingsHandler.m_settingsStore ) {
			SettingsHandler.m_settingsStore[p_key] = p_value;
		}
	},
	
	_save : function() {
		SettingsHandler.m_settingsFileEntry.createWriter( function( p_fileWriter ) {
			// Create settings header
			var settingsString = "<?xml version='1.0' encoding='UTF-8' ?>\n";
			settingsString += "<settings>\n";
			
			$.each( SettingsHandler.m_settingsStore, function( p_key, p_value ) {
				settingsString += "\t<" + p_key + ">" + p_value + "</" + p_key + ">\n";
			} );
			
			settingsString += '</settings>';
			
			p_fileWriter.write( settingsString );
		},
		SettingsHandler._fileError );
	},
	
	_settingsFileEntry : function( p_fileEntry ) {
		SettingsHandler.m_settingsFileEntry = p_fileEntry;

		SettingsHandler.m_settingsFileEntry.file( function( p_file ) {
			var reader = new FileReader();
			reader.onload = function( p_evt ) {
//				console.log( "Settings-File loaded" );
//				console.log( p_evt.target.result );
				
				var xmlDoc = $.parseXML( p_evt.target.result );
				
				$(xmlDoc).find( "settings > *" ).each( function(p_index, p_element) {
//					console.log( "Found setting '" + this.nodeName.toLowerCase() + "' with value '" + $(this).text() + "'" );
					
					SettingsHandler.m_settingsStore[this.nodeName.toLowerCase()] = $(this).text();
				});
			}
			reader.readAsText( p_file );
		}, this._fileError );
	},
	
	_fileError : function( p_fileError ) {
		console.log( "Error while handling settings file: " + p_fileError );
	}
};


/*
var SettingsHandler = function( p_appDirectoryEntry ) {
	this.m_appDirectoryEntry = p_appDirectoryEntry;
	this.m_settingsRoot = $( '<div></div>' );
	
	this.m_appDirectoryEntry.getFile( "gsc_settings.xml", { create: true, exclusive: false }, this._fileEntry, this._fileError );
}

SettingsHandler.prototype.setSetting = function( p_key, p_value ) {
}

SettingsHandler.prototype.getSetting = function( p_key ) {
}

SettingsHandler.prototype._fileEntry = function( p_fileEntry ) {
	this.m_settingsFileEntry = p_fileEntry;
	
	this.m_settingsFileEntry.file( function( p_file ) {
		var reader = new FileReader();
		reader.onload = function( p_evt ) {
			console.log( "Settings-File loaded" );
			console.log( m_settingsRoot );
			console.log( p_evt.target.result );
			
			$( m_settingsRoot ).append( p_evt.target.result );
		}
		reader.readAsText( p_file );
	}, this._fileError );
}

SettingsHandler.prototype._fileError = function( p_fileError ) {
	console.log( "Error while getting settings file: " + p_fileError );
}
*/