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

#include "MainScreen.h"

template<>
MainScreen *Singleton<MainScreen>::mySelf = NULL;

// TODO: Continue here with creating MainScreen Class
void MainScreen::MA_StartButtonClick(CIwUIElement*)
{
	this->bStopPending = false;
	this->totalDistance = 0.0;

	this->StartButton->SetVisible( false );
	this->ExitButton->SetVisible( false );
	this->StopButton->SetVisible( true );

	char fileName[20];

	// Generate file name for tracking
	this->startTime = time( NULL );
	sprintf( fileName, "%d.gsc", this->startTime );
	TrackHandler::Self()->startTracking( fileName );
	GPSHandler::Self()->startGPS();

	s3eTimerSetTimer( 1000, &MainScreen::mainTimer, NULL );
}

void MainScreen::MA_StopButtonClick(CIwUIElement*)
{
	GPSHandler::Self()->stopGPS();
	TrackHandler::Self()->stopTracking();

	this->StartButton->SetVisible( true );
	this->ExitButton->SetVisible( true );
	this->StopButton->SetVisible( false );

	this->bStopPending = true;
}

void MainScreen::MA_ExitButtonClick(CIwUIElement*)
{
	s3eDeviceRequestQuit();
}

void MainScreen::MA_MenuButtonClick(CIwUIElement*)
{
	MenuScreen::Self()->SetVisible( true );

	//this->SetVisible( false );
	//MenuScreen::Self()->GetScreen()->SetVisible(true);
	//ExportScreen::Self()->GetScreen()->SetVisible( true );
}

// Main timer, called once a second to update all infos
int MainScreen::mainTimer( void *systemData, void *userData ) {
	if( MainScreen::Self()->bStopPending ) return 1;

	if( GPSHandler::Self()->updateLocation() ) {
		MainScreen::Self()->totalDistance += GPSHandler::Self()->getDistance();

		TrackHandler::Self()->addGPSData( GPSHandler::Self()->getLongitude(), GPSHandler::Self()->getLatitude(), GPSHandler::Self()->getAltitude() );
		TrackHandler::Self()->addDistanceData( MainScreen::Self()->totalDistance );
		
		MainScreen::Self()->speedInfo->setValue( GPSHandler::Self()->getSpeed() * 3.6 );
		MainScreen::Self()->distanceInfo->setValue( MainScreen::Self()->totalDistance / 1000.0 ); // /1000.0 to convert meters to km
	}

	// Update timer (run-time)
	char myBuf[10];
	time_t timeNow = time( NULL );
	int timeDiff = (int) difftime( timeNow, MainScreen::Self()->startTime );

	// Calculate hours, mins and seconds
	int hours = timeDiff / 3600;
	int mins = (timeDiff % 3600) / 60;
	int secs = ((timeDiff % 3600) % 60);
	// Create formatted time-stamp & display it
	sprintf( myBuf, "%d:%02d:%02d", hours, mins, secs );
	MainScreen::Self()->timeInfo->setValue( myBuf );

	// Call main-timer again
	s3eTimerSetTimer( 1000, &MainScreen::mainTimer, NULL );

	return 0;
}

// Called once a minute to update the clock
int MainScreen::clockTimer( void *systemData, void *userData ) {
	char myBuf[6];
	// Get current time
	time_t now = time(NULL);
	// Convert to tm-struct
	struct tm* local_tm = localtime(&now);
	// Create formatted time string
	strftime( myBuf, strlen(myBuf), "%H:%M", local_tm );

	// Update display-label
	MainScreen::Self()->clockInfo->setValue( myBuf );

	// Continue calling the clock timer
	s3eTimerSetTimer( 60000, &MainScreen::clockTimer, NULL );

	return 0;
}

// Create the mainscreen-handler and intialize all panels
MainScreen::MainScreen() : Screen( "MainScreen" ) {
	IW_UI_CREATE_VIEW_SLOT1(this, "MainScreen", MainScreen, MA_StartButtonClick, CIwUIElement*)
	IW_UI_CREATE_VIEW_SLOT1(this, "MainScreen", MainScreen, MA_StopButtonClick, CIwUIElement*)
	IW_UI_CREATE_VIEW_SLOT1(this, "MainScreen", MainScreen, MA_ExitButtonClick, CIwUIElement*)
	IW_UI_CREATE_VIEW_SLOT1(this, "MainScreen", MainScreen, MA_MenuButtonClick, CIwUIElement*)

	// Find our buttons and save references to them
	this->StartButton = (CIwUIButton*) this->myScreen->GetChildNamed("StartButton");
	this->StopButton = (CIwUIButton*) this->myScreen->GetChildNamed("StopButton");
	this->ExitButton = (CIwUIButton*) this->myScreen->GetChildNamed("ExitButton");

	// Find our main grid and fill it
	CIwUIElement* gridElement = this->myScreen->GetChildNamed( "MainGrid" );
	CIwUILayoutGrid* gridLayout =(CIwUILayoutGrid *)gridElement->GetLayout();

	// Add speed infopanel to grid
	CIwTexture *texture = (CIwTexture*)IwGetResManager()->GetResNamed( "gowebsite24", IW_GX_RESTYPE_TEXTURE );
	InfoPanel* speedInfo = new InfoPanel( "speedInfo" );
	speedInfo->setUnit( "km/h" );
	speedInfo->setImage( texture );
	this->speedInfo = speedInfo;
	gridLayout->AddElement( speedInfo->getInfoPanel(), 0, 0, 1, 1, IW_UI_ALIGN_CENTRE, IW_UI_ALIGN_MIDDLE, CIwSVec2( 1, 1 ) );

	// Add distance infopanel to grid
	texture = (CIwTexture*)IwGetResManager()->GetResNamed( "web24", IW_GX_RESTYPE_TEXTURE );
	InfoPanel *distanceInfo = new InfoPanel( "distanceInfo", true );
	distanceInfo->setUnit ( "km" );
	distanceInfo->setImage( texture );
	this->distanceInfo = distanceInfo;
	gridLayout->AddElement( distanceInfo->getInfoPanel(), 1, 0, 1, 1, IW_UI_ALIGN_CENTRE, IW_UI_ALIGN_MIDDLE, CIwSVec2( 1, 1 ) );

	// Add altitude infopanel to grid
	texture = (CIwTexture*)IwGetResManager()->GetResNamed( "mountain24", IW_GX_RESTYPE_TEXTURE );
	InfoPanel *altitudeInfo = new InfoPanel( "altitudeInfo", true );
	altitudeInfo->setUnit( "m" );
	altitudeInfo->setImage( texture );
	this->altitudeInfo = altitudeInfo;
	gridLayout->AddElement( altitudeInfo->getInfoPanel(), 0, 1, 1, 1, IW_UI_ALIGN_CENTRE, IW_UI_ALIGN_MIDDLE, CIwSVec2( 1, 1 ) );

	// Add time infopanel to grid
	texture = (CIwTexture*)IwGetResManager()->GetResNamed( "timer24", IW_GX_RESTYPE_TEXTURE );
	InfoPanel *timeInfo = new InfoPanel( "timeInfo", true );
	timeInfo->setUnit( "hh:mm:ss" );
	timeInfo->setImage( texture );
	this->timeInfo = timeInfo;
	gridLayout->AddElement( timeInfo->getInfoPanel(), 1, 1, 1, 1, IW_UI_ALIGN_CENTRE, IW_UI_ALIGN_MIDDLE, CIwSVec2( 1, 1 ) );

	// Add clock infopanel to grid
	texture = (CIwTexture*)IwGetResManager()->GetResNamed( "clock24", IW_GX_RESTYPE_TEXTURE );
	InfoPanel *clockInfo = new InfoPanel( "clockInfo", true );
	clockInfo->setUnit( "hh:mm" );
	clockInfo->setImage( texture );
	clockInfo->getInfoPanel()->SetSizeHint( CIwVec2( 120, 60 ) );
	this->clockInfo = clockInfo;
	s3eTimerSetTimer( 1000, &MainScreen::clockTimer, NULL ); // Start calling the timer to display the current time
	//MainScreen::clockTimer( NULL, NULL );	// Call clock timer once to start displaying the current time
	gridLayout->AddElement( clockInfo->getInfoPanel(), 0, 2, 2, 1, IW_UI_ALIGN_CENTRE, IW_UI_ALIGN_MIDDLE, CIwSVec2( 1, 1 ) );

	//this->myScreen = CIwUIElement::CreateFromResource( "MenuScreen" );

	//this->tracksButton = this->myScreen->GetChildNamed( "TracksButton" );
	IwGetUIView()->AddElementToLayout( this->myScreen );
}
