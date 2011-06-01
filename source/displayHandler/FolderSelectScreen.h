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

#ifndef FOLDERSELECTSCREEN
#define FOLDERSELECTSCREEN

#include <string>
#include <iostream>
#include <sstream>

#include "IwUI.h"

#include "../displayHandler/Screen.h"
#include "../lib/Singleton.h"
#include "../lib/SettingsHandler.h"

#include "../lib/TaskHandler.h"
#include "../lib/Tasks/TaskSelectFolderRefresh.h"

#include "../uiLib/FolderTVItemSource.h"

class FolderSelectScreen : public Screen, public Singleton<FolderSelectScreen> {
	friend class Singleton<FolderSelectScreen>;
public:
	static void Show( std::string path, s3eCallback p_selectCallback, void *userData = NULL );

	void SetVisible( bool p_bVisible, bool p_bNoAnim = false );
	void Refresh();

	void CB_FSSHandleFolderSelection(CIwUIElement *pTrackEntry, bool bIsSelected);
	void CB_FSSExitButtonClick(CIwUIElement*);
	void CB_FSSSelectButtonClick(CIwUIElement*);
	void CB_FSSAddButtonClick(CIwUIElement*);

	std::string GetCurrPath();
private:
	FolderSelectScreen();
	~FolderSelectScreen();

	CIwUITableView *folderList;
	CIwUILabel *CurrentFolderLabel;

	Task *refreshTask;
	s3eCallback selectCallback;
	void *selectCallbackUserData;
	
	std::string m_currPath;
	FolderTVItemSource *itemSource;
};

#endif
