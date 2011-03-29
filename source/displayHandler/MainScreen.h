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

#ifndef MAINSCREEN
#define MAINSCREEN

#include <string>
#include <iostream>
#include <sstream>
#include <iomanip>

//#include <s3eExt_OSExec.h>

#include "Screen.h"
#include "../lib/Singleton.h"
#include "../lib/GPSHandler.h"
#include "../lib/TrackHandler.h"
#include "../lib/SettingsHandler.h"

#include "../uiLib/InfoPanel.h"

#include "MenuScreen.h"
#include "MsgBox.h"

class MainScreen : public Screen, public Singleton<MainScreen> {
	friend class Singleton<MainScreen>;
public:
	void MA_StartButtonClick(CIwUIElement*);
	void MA_StopButtonClick(CIwUIElement*);
	void MA_ExitButtonClick(CIwUIElement*);
	void MA_MenuButtonClick(CIwUIElement*);

	static int clockTimer( void *systemData, void *userData );
	static int startupTimer( void *systemData, void *userData );
	static int mainTimer( void *systemData, void *userData );

	static int32 CB_Suspend( void *systemData, void *userData );

protected:
	MainScreen();

	void displayTimer( int timeDiff );

	CIwUIButton *ExitButton;
	CIwUIButton *StartButton;
	CIwUIButton *StopButton;
	CIwUIButton *MenuButton;

	InfoPanel *speedInfo;
	InfoPanel *distanceInfo;
	InfoPanel *altitudeInfo;
	InfoPanel *timeInfo;
	InfoPanel *clockInfo;
	InfoPanel *statusInfo;

	bool bStopPending;
	double totalDistance;
	double totalAltitudeDiff;
	double lastAltitude;
	time_t startTime;
};

#endif
