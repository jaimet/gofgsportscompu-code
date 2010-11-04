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

int SettingsHandler::GetInt( std::string name ) {
	if( this->settingsStore.find( name ) != this->settingsStore.end() ) {
		return atoi( this->settingsStore[name].c_str() );
	}

	return -1;
}

std::string SettingsHandler::GetString( std::string name ) {
	if( this->settingsStore.find( name ) != this->settingsStore.end() ) {
		return this->settingsStore[name];
	}

	return NULL;
}

bool SettingsHandler::Load() {
	TiXmlDocument settingsDoc( "gsc_settings.xml" );

	// Check if settings file exists
	if( settingsDoc.LoadFile() ) {
		// Get the top-level node
		TiXmlElement *topNode = settingsDoc.FirstChildElement();

		// Cycle through our simple settings file and load all entries
		for( TiXmlElement *currElement = topNode->FirstChildElement(); currElement != NULL; currElement = currElement->NextSiblingElement() ) {
			if( this->settingsStore.find( currElement->Value() ) != this->settingsStore.end() ) {
				this->settingsStore[currElement->Value()] = currElement->GetText();
			}
		}

		return true;
	}

	return false;
}

bool SettingsHandler::Save() {
	TiXmlDocument settingsDoc;

	// Create top node of settings handler
	TiXmlElement *topNode = new TiXmlElement( "gsc_settings" );
	settingsDoc.LinkEndChild( topNode );

	// Iterate through the internal settingsstore and save all entries as xml-tags
	for( std::map<std::string,std::string>::iterator it = this->settingsStore.begin(); it != this->settingsStore.end(); it++ ) {
		TiXmlElement *settingsNode = new TiXmlElement( (*it).first.c_str() );
		settingsNode->LinkEndChild( new TiXmlText( (*it).second.c_str() ) );

		topNode->LinkEndChild( settingsNode );
	}

	// Write settings to disc
	return settingsDoc.SaveFile( "gsc_settings.xml" );
}

SettingsHandler::SettingsHandler() {
	// Define default settings here
	this->settingsStore["TrackFolder"] = "tracks";
	this->settingsStore["DefaultExportType"] = "0";

	this->Load();
}
