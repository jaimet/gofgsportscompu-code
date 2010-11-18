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

#ifndef EXPORTSCREEN
#define EXPORTSCREEN

#include "IwUI.h"

#include "../displayHandler/Screen.h"
#include "../lib/Singleton.h"
#include "../lib/SettingsHandler.h"

#include "../lib/TaskHandler.h"
#include "../lib/TaskHTTPExport.h"
#include "../lib/TaskTCXExport.h"
#include "../lib/TaskFitlogExport.h"

enum ExportFormat {
	FITLOG,
	TCX,
	GOFG
};

class ExportScreen : public Screen, public Singleton<ExportScreen>
{
	friend class Singleton<ExportScreen>;
public:
	void SetVisible( bool p_bVisible, bool p_bNoAnim = false );

	void CB_ESExitButtonClick(CIwUIElement*);
	void CB_ESExportButtonClick(CIwUIElement*);
	void ES_HandleTrackSelection(CIwUIElement *pTrackEntry, bool bIsSelected);
	void ES_ExportFormatChanged(CIwUIElement*, int16 selection);

	static int32 CB_UpdateProgress( void *systemData, void *userData  );
//	static int32 CB_StartExport( void *systemData, void *userData );

private:
	ExportScreen();

	char es_currentFile[20];
	ExportFormat exportFormat;
	CIwUIProgressBar *exportProgress;
	CIwUILabel *exportStatus;
	CIwUITableView *trackList;
	CIwUIButton *exitButton;

	Task *exportTask;
};

#endif
