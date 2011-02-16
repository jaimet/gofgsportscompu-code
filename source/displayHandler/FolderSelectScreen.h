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
#include "../lib/TaskSelectFolderRefresh.h"

#include "../uiLib/FolderTVItemSource.h"

class FolderSelectScreen : public Screen, public Singleton<FolderSelectScreen>
{
	friend class Singleton<FolderSelectScreen>;
public:
	void SetVisible( bool p_bVisible, bool p_bNoAnim = false );
	void Refresh();

	void CB_FSSHandleFolderSelection(CIwUIElement *pTrackEntry, bool bIsSelected);
	void CB_FSSExitButtonClick(CIwUIElement*);
private:
	FolderSelectScreen();

	CIwUITableView *folderList;
	Task *refreshTask;
};

#endif
