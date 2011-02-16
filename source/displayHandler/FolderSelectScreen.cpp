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

#include "FolderSelectScreen.h"

template<>
FolderSelectScreen *Singleton<FolderSelectScreen>::mySelf = NULL;

void FolderSelectScreen::SetVisible( bool p_bVisible, bool p_bNoAnim ) {
	if( p_bVisible ) {
		this->Refresh();
	}

	Screen::SetVisible( p_bVisible, p_bNoAnim );
}

void FolderSelectScreen::Refresh() {
	CIwUITableViewItemSource *newSource = new FolderTVItemSource();

	this->folderList->SetSelection( -1 );
	this->folderList->SetItemSource( newSource );
	this->folderList->RecreateItemsFromSource();
}

void FolderSelectScreen::CB_FSSHandleFolderSelection(CIwUIElement *pTrackEntry, bool bIsSelected) {
	if( bIsSelected ) {
		CIwPropertyString folderName;

		if (pTrackEntry->GetChildNamed("fileName")->GetProperty("caption", folderName))
		{
			std::string currentPath = SettingsHandler::Self()->GetString( "SelectFolderPath" );

			if( folderName == ".." ) {
				currentPath.replace( currentPath.length() - 1, 1, "" );
				currentPath.replace( currentPath.find_last_of( "/" ) + 1, currentPath.length() - 1 - currentPath.find_last_of( "/" ), "" );
			}
			else {
				currentPath += folderName.c_str();
				currentPath += "/";
			}

			SettingsHandler::Self()->Set( "SelectFolderPath", currentPath );
		}

		// Create new refresh task
		if( this->refreshTask != NULL ) {
			delete this->refreshTask;
		}

		this->refreshTask = new TaskSelectFolderRefresh();
		TaskHandler::Self()->Add( this->refreshTask );
	}
}

void FolderSelectScreen::CB_FSSExitButtonClick(CIwUIElement*) {
	this->SetVisible( false );
}

FolderSelectScreen::FolderSelectScreen() : Screen( "FolderSelectScreen" ) {
	IW_UI_CREATE_VIEW_SLOT2(this, "FolderSelectScreen", FolderSelectScreen, CB_FSSHandleFolderSelection, CIwUIElement*,bool)
	IW_UI_CREATE_VIEW_SLOT1(this, "FolderSelectScreen", FolderSelectScreen, CB_FSSExitButtonClick, CIwUIElement*)

	this->folderList = (CIwUITableView*) this->myScreen->GetChildNamed( "FolderList" );
	this->refreshTask = NULL;

	IwGetUIView()->AddElementToLayout( this->myScreen );
}
