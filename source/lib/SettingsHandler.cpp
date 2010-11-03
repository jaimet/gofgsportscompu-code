/*
* Copyright (C) 2010 Wolfgang Koller
* 
* This file is part of GOFG Sports Computer.
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

#include "SettingsHandler.h"

template<>
SettingsHandler *Singleton<SettingsHandler>::mySelf = NULL;

void SettingsHandler::Set( std::string name, std::string value ) {
	if( this->settingsStore.find( name ) != this->settingsStore.end() ) {
		this->settingsStore[name] = value;
	}
}

void SettingsHandler::Set( std::string name, int value ) {
	char myBuf[11];	//11 chars are enough for a 32bit int
	sprintf( myBuf, "%d", value );	// Convert into to string

	// Call actual set function
	this->Set( name, myBuf );
}

// TODO: Continue Settings handler here
SettingsHandler::SettingsHandler() {
	// Define default settings here
	this->settingsStore["TrackFolder"] = "tracks";
	this->settingsStore["DefaultExportType"] = "tcx";

	TiXmlDocument settingsDoc( "gsc_settings.xml" );

	// Check if settings file exists
	if( settingsDoc.LoadFile() ) {
		// Cycle through our simple settings file and load all entries
		for( TiXmlElement *currElement = settingsDoc.FirstChildElement(); currElement != NULL; currElement = currElement->NextSiblingElement() ) {
			if( this->settingsStore.find( currElement->Value() ) != this->settingsStore.end() ) {
				this->settingsStore[currElement->Value()] = currElement->GetText();
			}
		}
	}
}
