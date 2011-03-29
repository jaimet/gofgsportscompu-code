/*
* Copyright (C) 2011 Wolfgang Koller
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

#include "SettingsScreen.h"

template<>
SettingsScreen *Singleton<SettingsScreen>::mySelf = NULL;

void SettingsScreen::CB_SSExitButtonClick(CIwUIElement*) {
	this->SetVisible(false);
}

void SettingsScreen::CB_SSSaveButtonClick(CIwUIElement*) {
	// Store all settings and save them
	SettingsHandler::Self()->Set( "MinLocationAccuracy", strtol(this->MinLocationAccuracy_Value->GetCaption(), NULL, 10) );
	SettingsHandler::Self()->Set( "TrackFolder", (std::string) this->TrackFolder_Value->GetCaption() );
	SettingsHandler::Self()->Set( "ExportFolder", (std::string) this->ExportFolder_Value->GetCaption() );
	SettingsHandler::Self()->Set( "WaitForGPSFix", this->WaitForGPSFix_Value->GetChecked() );
	SettingsHandler::Self()->Save();

	this->SetVisible(false);
}

void SettingsScreen::CB_SSTrackFolderButtonClick(CIwUIElement*) {
	FolderSelectScreen::Self()->Show( &SettingsScreen::CB_SSSelectFolder, this->TrackFolder_Value );
}

void SettingsScreen::CB_SSExportFolderButtonClick(CIwUIElement*) {
	FolderSelectScreen::Self()->Show( &SettingsScreen::CB_SSSelectFolder, this->ExportFolder_Value );
}

int32 SettingsScreen::CB_SSSelectFolder( void *systemData, void *userData  ) {
	((CIwUITextField*) userData)->SetCaption( (const char*) systemData );

	//SettingsScreen::Self()->TrackFolder_Value->SetCaption( (char*) systemData );

	return 0;
}

void SettingsScreen::SetVisible( bool p_bVisible, bool p_bNoAnim ) {
	// Read all settings and display them
	this->MinLocationAccuracy_Value->SetCaption( SettingsHandler::Self()->GetString( "MinLocationAccuracy" ).c_str() );
	this->TrackFolder_Value->SetCaption( SettingsHandler::Self()->GetString( "TrackFolder" ).c_str() );
	this->ExportFolder_Value->SetCaption( SettingsHandler::Self()->GetString( "ExportFolder" ).c_str() );
	this->WaitForGPSFix_Value->SetChecked( SettingsHandler::Self()->GetBool( "WaitForGPSFix" ) );

	Screen::SetVisible( p_bVisible, p_bNoAnim );
}

SettingsScreen::SettingsScreen() : Screen( "SettingsScreen" ) {
	IW_UI_CREATE_VIEW_SLOT1(this, "SettingsScreen", SettingsScreen, CB_SSExitButtonClick, CIwUIElement*)
	IW_UI_CREATE_VIEW_SLOT1(this, "SettingsScreen", SettingsScreen, CB_SSSaveButtonClick, CIwUIElement*)
	IW_UI_CREATE_VIEW_SLOT1(this, "SettingsScreen", SettingsScreen, CB_SSTrackFolderButtonClick, CIwUIElement*)
	IW_UI_CREATE_VIEW_SLOT1(this, "SettingsScreen", SettingsScreen, CB_SSExportFolderButtonClick, CIwUIElement*)

	// Find the ui elements for each setting
	this->MinLocationAccuracy_Value = (CIwUITextField*) this->myScreen->GetChildNamed( "MinLocationAccuracy_Value" );
	this->TrackFolder_Value = (CIwUITextField*) this->myScreen->GetChildNamed( "TrackFolder_Value" );
	this->ExportFolder_Value = (CIwUITextField*) this->myScreen->GetChildNamed( "ExportFolder_Value" );
	this->WaitForGPSFix_Value = (CIwUICheckbox*) this->myScreen->GetChildNamed( "WaitForGPSFix_Value" );

	IwGetUIView()->AddElementToLayout( this->myScreen );
}
