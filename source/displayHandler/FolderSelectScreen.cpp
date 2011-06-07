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

void FolderSelectScreen::Show( std::string path, s3eCallback p_selectCallback, void *userData ) {
	FolderSelectScreen::Self()->selectCallback = p_selectCallback;
	FolderSelectScreen::Self()->selectCallbackUserData = userData;
	FolderSelectScreen::Self()->m_currPath = path;

	FolderSelectScreen::Self()->Refresh();

	// Call parent setvisible function (required to actually show the screen)
	((Screen*)FolderSelectScreen::Self())->SetVisible( true );
}

void FolderSelectScreen::SetVisible( bool p_bVisible, bool p_bNoAnim ) {
	return;	// NOTE: You should use the static members function Show() instead!
}

void FolderSelectScreen::Refresh() {
	this->CurrentFolderLabel->SetCaption( this->m_currPath.c_str() );

	this->itemSource->Refresh();
	this->folderList->SetSelection( -1 );
	this->folderList->RecreateItemsFromSource();
}

void FolderSelectScreen::CB_FSSHandleFolderSelection(CIwUIElement *pTrackEntry, bool bIsSelected) {
	if( bIsSelected ) {
		CIwPropertyString folderName;

		if (pTrackEntry->GetChildNamed("folderName")->GetProperty("caption", folderName)) {
			std::string currentPath = this->m_currPath;

			if( folderName == ".." ) {
				currentPath.replace( currentPath.length() - 1, 1, "" );
				currentPath.replace( currentPath.find_last_of( "/" ) + 1, currentPath.length() - 1 - currentPath.find_last_of( "/" ), "" );
			}
			else {
				currentPath += folderName.c_str();
				currentPath += "/";
			}

			this->m_currPath = currentPath;
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
	Screen::SetVisible( false );
}

void FolderSelectScreen::CB_FSSSelectButtonClick(CIwUIElement*) {
	//this->selectCallback( (void*) SettingsHandler::Self()->GetString( "SelectFolderPath" ).c_str(), this->selectCallbackUserData );
	this->selectCallback( (void*) FolderSelectScreen::Self()->m_currPath.c_str(), this->selectCallbackUserData );

	Screen::SetVisible( false );
}

// !!! TODO: Create Folder functionality !!!
void FolderSelectScreen::CB_FSSAddButtonClick(CIwUIElement*) {
}

std::string FolderSelectScreen::GetCurrPath() {
	return this->m_currPath;
}

FolderSelectScreen::FolderSelectScreen() : Screen( "FolderSelectScreen" ) {
	IW_UI_CREATE_VIEW_SLOT2(this, "FolderSelectScreen", FolderSelectScreen, CB_FSSHandleFolderSelection, CIwUIElement*,bool)
	IW_UI_CREATE_VIEW_SLOT1(this, "FolderSelectScreen", FolderSelectScreen, CB_FSSExitButtonClick, CIwUIElement*)
	IW_UI_CREATE_VIEW_SLOT1(this, "FolderSelectScreen", FolderSelectScreen, CB_FSSSelectButtonClick, CIwUIElement*)

	this->folderList = (CIwUITableView*) this->myScreen->GetChildNamed( "FolderList" );
	this->CurrentFolderLabel = (CIwUILabel*) this->myScreen->GetChildNamed( "CurrentFolderLabel" );
	this->itemSource = (FolderTVItemSource*) this->folderList->GetItemSource();
	this->refreshTask = NULL;

	IwGetUIView()->AddElementToLayout( this->myScreen );
}

FolderSelectScreen::~FolderSelectScreen() {
/*	delete this->folderList;
	delete this->CurrentFolderLabel;*/
}
