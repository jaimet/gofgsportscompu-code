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

void MainScreen::MA_StartButtonClick(CIwUIElement*) {
	this->bStopPending = false;
	this->totalDistance = 0.0;
	this->totalAltitudeDiff = 0.0;
	this->lastAltitude = 0.0;

	// Check if Location API is available at all
	if( !s3eLocationAvailable() ) {
		MsgBox::Self()->SetVisible( true, true );
		return;
	}

	this->StartButton->SetVisible( false );
	this->ExitButton->SetVisible( false );
	this->StopButton->SetVisible( true );

	//char fileName[20];
	std::ostringstream fileName;

	// Generate file name for tracking
	this->startTime = time( NULL );

	// Create the fileName
	fileName << SettingsHandler::Self()->GetString( "TrackFolder" ) << this->startTime << ".gsc";

	//sprintf( fileName, "%d.gsc", this->startTime );
	TrackHandler::Self()->startTracking( fileName.str() );

	// Initialize & start the GPS handler
	GPSHandler::Self()->SetMinAccuracy( SettingsHandler::Self()->GetInt( "MinLocationAccuracy" ) );
	GPSHandler::Self()->startGPS();

	// Prevent device from going to sleep
	//s3eDeviceRegister( S3E_DEVICE_PAUSE, &MainScreen::CB_Suspend, NULL );

	// Start main timer
	s3eTimerSetTimer( 1000, &MainScreen::mainTimer, NULL );
}

void MainScreen::MA_StopButtonClick(CIwUIElement*)
{
	// Allow sleep again
	//s3eDeviceUnRegister( S3E_DEVICE_PAUSE, &MainScreen::CB_Suspend );

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

	// As long as the main timer is running, keep the device awake
	s3eDeviceBacklightOn();

	if( GPSHandler::Self()->updateLocation() ) {
		MainScreen::Self()->totalDistance += GPSHandler::Self()->getDistance();
		MainScreen::Self()->totalAltitudeDiff += (GPSHandler::Self()->getAltitude() - MainScreen::Self()->lastAltitude);
		MainScreen::Self()->lastAltitude = GPSHandler::Self()->getAltitude();

		TrackHandler::Self()->addGPSData( GPSHandler::Self()->getLongitude(), GPSHandler::Self()->getLatitude(), GPSHandler::Self()->getAltitude() );
		TrackHandler::Self()->addDistanceData( MainScreen::Self()->totalDistance );
		
		MainScreen::Self()->speedInfo->setValue( GPSHandler::Self()->getSpeed() * 3.6 );
		MainScreen::Self()->distanceInfo->setValue( MainScreen::Self()->totalDistance / 1000.0 ); // /1000.0 to convert meters to km
		MainScreen::Self()->altitudeInfo->setValue( MainScreen::Self()->totalAltitudeDiff );
	}

	// Update accuracy image based on minimum location accuracy
	double currAccuracy = GPSHandler::Self()->getAccuracy();
	double minAccuracy = (double) SettingsHandler::Self()->GetInt( "MinLocationAccuracy" );
	if( currAccuracy > minAccuracy || currAccuracy < 0.0 ) {
		MainScreen::Self()->statusInfo->setValue( (CIwTexture*)IwGetResManager()->GetResNamed( "wireless_none", IW_GX_RESTYPE_TEXTURE ) );
	}
	else if( currAccuracy > (minAccuracy / 3.0 * 2.0) ) {
		MainScreen::Self()->statusInfo->setValue( (CIwTexture*)IwGetResManager()->GetResNamed( "wireless_low", IW_GX_RESTYPE_TEXTURE ) );
	}
	else if( currAccuracy > (minAccuracy / 3.0 * 1.0) ) {
		MainScreen::Self()->statusInfo->setValue( (CIwTexture*)IwGetResManager()->GetResNamed( "wireless_medium", IW_GX_RESTYPE_TEXTURE ) );
	}
	else {
		MainScreen::Self()->statusInfo->setValue( (CIwTexture*)IwGetResManager()->GetResNamed( "wireless_full", IW_GX_RESTYPE_TEXTURE ) );
	}


	// Update accuracy
	//MainScreen::Self()->statusInfo->setValue( GPSHandler::Self()->getAccuracy() );

	// Update timer (run-time)
	char myBuf[10];
	time_t timeNow = time( NULL );
	int timeDiff = (int) difftime( timeNow, MainScreen::Self()->startTime );

	// Calculate hours, mins and seconds
	int hours = timeDiff / 3600;
	int mins = (timeDiff % 3600) / 60;
	int secs = ((timeDiff % 3600) % 60);
	// Create formatted time-stamp & display it
	sprintf( myBuf, "%02d:%02d:%02d", hours, mins, secs );
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

	// Find timer/status grid
	CIwUIElement *timeStatusElement = this->myScreen->GetChildNamed( "TimeStatusElement" );
	CIwUILayoutGrid *timeStatusLayout = (CIwUILayoutGrid*) timeStatusElement->GetLayout();

	// Add time infopanel to grid
	texture = (CIwTexture*)IwGetResManager()->GetResNamed( "timer24", IW_GX_RESTYPE_TEXTURE );
	InfoPanel *timeInfo = new InfoPanel( "timeInfo", true );
	timeInfo->setUnit( "hh:mm:ss" );
	timeInfo->setImage( texture );
	timeInfo->getInfoPanel()->SetSizeHint( CIwVec2( 120, 60 ) );
	this->timeInfo = timeInfo;
	timeStatusLayout->AddElement( timeInfo->getInfoPanel(), 0, 0, 1, 1, IW_UI_ALIGN_CENTRE, IW_UI_ALIGN_MIDDLE, CIwSVec2( 1, 1 ) );

	// Add time infopanel to grid
	texture = (CIwTexture*)IwGetResManager()->GetResNamed( "Satellite", IW_GX_RESTYPE_TEXTURE );
	InfoPanel *statusInfo = new InfoPanel( "statusInfo", true );
	statusInfo->setUnit( "Status" );
	statusInfo->setImage( texture );
	statusInfo->getInfoPanel()->SetSizeHint( CIwVec2( 120, 60 ) );
	this->statusInfo = statusInfo;
	timeStatusLayout->AddElement( statusInfo->getInfoPanel(), 0, 1, 1, 1, IW_UI_ALIGN_CENTRE, IW_UI_ALIGN_MIDDLE, CIwSVec2( 1, 1 ) );

	// Add clock infopanel to grid
	texture = (CIwTexture*)IwGetResManager()->GetResNamed( "clock24", IW_GX_RESTYPE_TEXTURE );
	InfoPanel *clockInfo = new InfoPanel( "clockInfo", true );
	clockInfo->setUnit( "hh:mm" );
	clockInfo->setImage( texture );
	clockInfo->getInfoPanel()->SetSizeHint( CIwVec2( 120, 60 ) );
	this->clockInfo = clockInfo;
	//MainScreen::clockTimer( NULL, NULL );	// Call clock timer once to start displaying the current time
	gridLayout->AddElement( clockInfo->getInfoPanel(), 0, 2, 2, 1, IW_UI_ALIGN_CENTRE, IW_UI_ALIGN_MIDDLE, CIwSVec2( 1, 1 ) );
	s3eTimerSetTimer( 100, &MainScreen::clockTimer, NULL ); // Start calling the timer to display the current time

	//this->myScreen = CIwUIElement::CreateFromResource( "MenuScreen" );

	//this->tracksButton = this->myScreen->GetChildNamed( "TracksButton" );
	IwGetUIView()->AddElementToLayout( this->myScreen );

	// Set our labels once, so that scaling can take place
	this->speedInfo->setValue( "0.00" );
	this->distanceInfo->setValue( "0.00" );
	this->altitudeInfo->setValue( "0.00" );
	this->timeInfo->setValue( "00:00:00" );
	//this->statusInfo->setValue( "0000.00" );
}

/**
* Called to prevent device from going to suspend, only used if tracking is active
*/
int32 MainScreen::CB_Suspend( void *systemData, void *userData ) {
	s3eDeviceBacklightOn();

	return 0;
}
