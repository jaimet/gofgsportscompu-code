/*
* Copyright (C) 2010-2011 Wolfgang Koller
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

#define LOCATION_STARTUP_DELAY 3
#define POWER_SAVE_INTERVAL 10

#include <string>
#include <iostream>
#include <sstream>
#include <iomanip>

//#include <s3eExt_OSExec.h>
//#include <Iw2D.h>
//#include <s3eConfig.h>

#include "Screen.h"
#include "../lib/Singleton.h"
#include "../lib/GPSHandler.h"
#include "../lib/TrackHandler.h"
#include "../lib/SettingsHandler.h"
#include "../lib/HxMHandler.h"

#include "../uiLib/InfoPanel.h"

#include "MenuScreen.h"
#include "MsgBox.h"

class TaskTrackLoad;

class MainScreen : public Screen, public Singleton<MainScreen> {
	friend class Singleton<MainScreen>;
	friend class TaskTrackLoad;
public:
	void MA_StartButtonClick(CIwUIElement*);
	void MA_StopButtonClick(CIwUIElement*);
	void MA_ExitButtonClick(CIwUIElement*);
	void MA_MenuButtonClick(CIwUIElement*);
	void CB_MAPauseButtonClick(CIwUIElement*);
	void CB_MAContinueButtonClick(CIwUIElement*);

	static int clockTimer( void *systemData, void *userData );
	static int startupTimer( void *systemData, void *userData );
	static int mainTimer( void *systemData, void *userData );
	static int32 CB_AwakeTimer( void *systemData, void *userData );	// Timer which is called once a second to keep the device awake (only during active recording of tracks)

	// Callbacks for implementing power-save functions (disable gps on suspend)
	static int32 CB_DevicePause(void *systemData, void *userData);
	static int32 CB_DeviceUnPause(void *systemData, void *userData);

protected:
	MainScreen();
	~MainScreen();
	void Reset();

	void UpdateTimerDisplay( int timeDiff );
	void UpdateAccuracyDisplay( double accuracy );
	void UpdateDisplay( double speed, double hr, double distance, double altitudeDiff, int timeDiff, double accuracy );

	void SurfaceChanged( s3eSurfaceBlitDirection direction );

	CIwUIButton *ExitButton;
	CIwUIButton *StartButton;
	CIwUIButton *StopButton;
	CIwUIButton *MenuButton;
	CIwUIButton *PauseButton;
	CIwUIButton *ContinueButton;

	CIwUIElement *mainGrid;
	CIwUIElement *timeStatusElement;
	InfoPanel *speedInfo;
	InfoPanel *distanceInfo;
	InfoPanel *altitudeInfo;
	InfoPanel *timeInfo;
	InfoPanel *clockInfo;
	InfoPanel *statusInfo;
	InfoPanel *pulseInfo;

	bool bStopPending;
	double totalDistance;
	double totalAltitudeDiff;
	double lastAltitude;
	time_t startTime;

	unsigned int fixCount;
};

#endif
