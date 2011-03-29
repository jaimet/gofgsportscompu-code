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

#ifndef SETTINGSSCREEN
#define SETTINGSSCREEN

#include "IwUICheckbox.h"

#include "../lib/SettingsHandler.h"

#include "../displayHandler/Screen.h"
#include "../lib/Singleton.h"

#include "FolderSelectScreen.h"

class SettingsScreen : public Screen, public Singleton<SettingsScreen>
{
	friend class Singleton<SettingsScreen>;
public:
	void CB_SSExitButtonClick(CIwUIElement*);
	void CB_SSSaveButtonClick(CIwUIElement*);
	void CB_SSTrackFolderButtonClick(CIwUIElement*);
	void CB_SSExportFolderButtonClick(CIwUIElement*);

	static int32 CB_SSSelectFolder( void *systemData, void *userData  );

	void SetVisible( bool p_bVisible, bool p_bNoAnim = false );
private:
	SettingsScreen();
	~SettingsScreen();

	CIwUITextField *MinLocationAccuracy_Value;
	CIwUITextField *TrackFolder_Value;
	CIwUITextField *ExportFolder_Value;
	CIwUICheckbox *WaitForGPSFix_Value;
};

#endif
