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

#include "MainScreen.h"

template<>
MainScreen *Singleton<MainScreen>::mySelf = NULL;

void MainScreen::MA_StartButtonClick(CIwUIElement*) {
	// Reset the mainscreen display
	this->Reset();

	// Check if Location API is available at all
	if( !s3eLocationAvailable() ) {
		MsgBox::Self()->SetVisible( true, true );
		return;
	}

	// Change visibility of the menu buttons
	this->StartButton->SetVisible( false );
	this->ExitButton->SetVisible( false );
	this->MenuButton->SetVisible( false );
	this->StopButton->SetVisible( true );

	// Save start time for tracking duration
	this->startTime = time( NULL );

	// Initialize & start the GPS handler
	GPSHandler::Self()->startGPS();
	GPSHandler::Self()->SetMinAccuracy( SettingsHandler::Self()->GetInt( "MinLocationAccuracy" ) );

	// Start tracking by using the startup timer
	MainScreen::startupTimer( NULL, NULL );
}

void MainScreen::MA_StopButtonClick(CIwUIElement*) {
	// Stop GPS Tracking & File recording
	GPSHandler::Self()->stopGPS();
	TrackHandler::Self()->stopTracking();

	// Display correct buttons again
	this->StartButton->SetVisible( true );
	this->ExitButton->SetVisible( true );
	this->MenuButton->SetVisible( true );
	this->StopButton->SetVisible( false );

	// Notify timers that a stop is pending
	this->bStopPending = true;
}

void MainScreen::MA_ExitButtonClick(CIwUIElement*) {
	s3eDeviceRequestQuit();
}

void MainScreen::MA_MenuButtonClick(CIwUIElement*) {
	MenuScreen::Self()->SetVisible( true );
}

// Called once a minute to update the clock
int MainScreen::clockTimer( void *systemData, void *userData ) {
	std::ostringstream clockString;

	// Get current time
	time_t now = time(NULL);
	// Convert to tm-struct
	struct tm* local_tm = localtime(&now);
	// Create formatted time string
	clockString << std::setfill('0') << std::setw(2) << local_tm->tm_hour << ":" << std::setfill('0') << std::setw(2) << local_tm->tm_min;

	// Update display-label
	MainScreen::Self()->clockInfo->setValue( clockString.str() );

	// Continue calling the clock timer
	s3eTimerSetTimer( 60000, &MainScreen::clockTimer, NULL );

	return 0;
}


/**
 * <summary>	Startup and initialization routine. Waits for GPS fix if set by user. </summary>
 *
 * <remarks>	Wkoller, 23.03.2011. </remarks>
 *
 * <param name="systemData">	[in,out] system data. </param>
 * <param name="userData">  	[in,out] user data. </param>
 *
 * <returns>	. </returns>
 */
int MainScreen::startupTimer( void *systemData, void *userData ) {
	if( MainScreen::Self()->bStopPending ) return 1;

	// As long as the startup timer is running, keep the device awake
	s3eDeviceBacklightOn();

	// Check if we have a fix
	bool bFixFound = GPSHandler::Self()->updateLocation();

	// Update display
	MainScreen::Self()->UpdateDisplay( 0.0, 0.0, 0.0, 0.0, (int) difftime( time(NULL), MainScreen::Self()->startTime ), GPSHandler::Self()->getAccuracy() );

	// Update timer display
	//MainScreen::Self()->UpdateTimerDisplay( (int) difftime( time(NULL), MainScreen::Self()->startTime ) );

	// Check if we have to wait for the GPS fix
	if( SettingsHandler::Self()->GetBool( "WaitForGPSFix" ) ) { // && !GPSHandler::Self()->updateLocation() ) {
		if( !bFixFound ) {
			s3eTimerSetTimer( 1000, &MainScreen::startupTimer, NULL );
			return 0;
		}
		// Wait at least 2 fixes before starting with the track
		else if( MainScreen::Self()->fixCount < 2 ) {
			MainScreen::Self()->fixCount += 1;
			s3eTimerSetTimer( 1000, &MainScreen::startupTimer, NULL );
			return 0;
		}
	}

	// Finally we can start, set new start time
	MainScreen::Self()->startTime = time( NULL );

	// Create the fileName
	std::ostringstream fileName;
	fileName << SettingsHandler::Self()->GetString( "TrackFolder" ) << MainScreen::Self()->startTime << ".gsc";
	TrackHandler::Self()->startTracking( fileName.str() );

	// Finally start the GPS tracking
	s3eTimerSetTimer( 1000, &MainScreen::mainTimer, NULL );

	return 0;
}

// Main timer, called once a second to update all infos
int MainScreen::mainTimer( void *systemData, void *userData ) {
	if( MainScreen::Self()->bStopPending ) return 1;

	// Calculate current time difference
	time_t timeNow = time( NULL );
	int timeDiff = (int) difftime( timeNow, MainScreen::Self()->startTime );

	// As long as the main timer is running, keep the device awake
	s3eDeviceBacklightOn();

	if( GPSHandler::Self()->updateLocation() ) {
		// Update Altitude difference (only if positive, so upwards)
		double currAltitudeDiff = GPSHandler::Self()->getAltitude() - MainScreen::Self()->lastAltitude;
		if( currAltitudeDiff > 0 && MainScreen::Self()->lastAltitude > -1000.0 ) MainScreen::Self()->totalAltitudeDiff += currAltitudeDiff;
		MainScreen::Self()->lastAltitude = GPSHandler::Self()->getAltitude();

		// Update total distance
		MainScreen::Self()->totalDistance += GPSHandler::Self()->getDistance();

		// Add GPS & Distance data to our track
		TrackHandler::Self()->addGPSData( GPSHandler::Self()->getLongitude(), GPSHandler::Self()->getLatitude(), GPSHandler::Self()->getAltitude() );
		TrackHandler::Self()->addDistanceData( MainScreen::Self()->totalDistance );

		// Update display
		MainScreen::Self()->UpdateDisplay( GPSHandler::Self()->getSpeed(), 0.0, MainScreen::Self()->totalDistance, MainScreen::Self()->totalAltitudeDiff, timeDiff, GPSHandler::Self()->getAccuracy() );
	}
	else {
		// Update display
		MainScreen::Self()->UpdateDisplay( 0.0, 0.0, MainScreen::Self()->totalDistance, MainScreen::Self()->totalAltitudeDiff, timeDiff, GPSHandler::Self()->getAccuracy() );
	}

	// Call main-timer again
	s3eTimerSetTimer( 1000, &MainScreen::mainTimer, NULL );

	return 0;
}

/**
* Called to prevent device from going to suspend, only used if tracking is active
*/
int32 MainScreen::CB_Suspend( void *systemData, void *userData ) {
	s3eDeviceBacklightOn();

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
	this->MenuButton = (CIwUIButton*) this->myScreen->GetChildNamed("MenuButton");

	// Find our main grid and fill it
	this->mainGrid = this->myScreen->GetChildNamed( "MainGrid" );
	//CIwUILayoutGrid* gridLayout =(CIwUILayoutGrid*) this->mainGrid->GetLayout();

	// Add speed infopanel to grid
	CIwTexture *texture = (CIwTexture*)IwGetResManager()->GetResNamed( "gowebsite24", IW_GX_RESTYPE_TEXTURE );
	this->speedInfo = new InfoPanel( "speedInfo" );
	this->speedInfo->setUnit( "km/h" );
	this->speedInfo->setImage( texture );
	//gridLayout->AddElement( this->speedInfo->getInfoPanel(), 0, 0, 1, 1, IW_UI_ALIGN_CENTRE, IW_UI_ALIGN_MIDDLE, CIwSVec2( 1, 1 ) );

	// Add distance infopanel to grid
	texture = (CIwTexture*)IwGetResManager()->GetResNamed( "web24", IW_GX_RESTYPE_TEXTURE );
	this->distanceInfo = new InfoPanel( "distanceInfo", true );
	this->distanceInfo->setUnit ( "km" );
	this->distanceInfo->setImage( texture );
	//gridLayout->AddElement( this->distanceInfo->getInfoPanel(), 1, 0, 1, 1, IW_UI_ALIGN_CENTRE, IW_UI_ALIGN_MIDDLE, CIwSVec2( 1, 1 ) );

	// Get the distance / altitude container element
	//CIwUIElement *distanceAltitudeElement = this->myScreen->GetChildNamed( "DistanceAltitudeElement" );
	//CIwUILayoutGrid *distanceAltitudeLayout = (CIwUILayoutGrid*) distanceAltitudeElement->GetLayout();

	// Add altitude infopanel to grid
	texture = (CIwTexture*)IwGetResManager()->GetResNamed( "mountain24", IW_GX_RESTYPE_TEXTURE );
	this->altitudeInfo = new InfoPanel( "altitudeInfo", true );
	this->altitudeInfo->setUnit( "m" );
	this->altitudeInfo->setImage( texture );
	//distanceAltitudeLayout->AddElement( this->altitudeInfo->getInfoPanel(), 0, 0, 1, 1, IW_UI_ALIGN_CENTRE, IW_UI_ALIGN_MIDDLE, CIwSVec2( 1, 1 ) );

	// Check if we use the zephyr hxm, if yes we  will move the distance info and display a pulse info instead
	if( HxMHandler::Self()->IsAvailable() && SettingsHandler::Self()->GetBool( "UseZephyrHxM" ) ) {
		// Change size of distance / altitude info
		//this->distanceInfo->getInfoPanel()->SetSizeHint( CIwVec2( 120, 60 ) );
		//this->altitudeInfo->getInfoPanel()->SetSizeHint( CIwVec2( 120, 60 ) );

		// Reposition the distance info
		//distanceAltitudeLayout->AddRow();
		//gridLayout->RemoveElement( this->distanceInfo->getInfoPanel() );
		//distanceAltitudeLayout->AddElement( this->distanceInfo->getInfoPanel(), 0, 1, 1, 1, IW_UI_ALIGN_CENTRE, IW_UI_ALIGN_MIDDLE, CIwSVec2( 1, 1 ) );

		// Add pulse infopanel to grid
		texture = (CIwTexture*)IwGetResManager()->GetResNamed( "fav24", IW_GX_RESTYPE_TEXTURE );
		this->pulseInfo = new InfoPanel( "pulseInfo" );
		this->pulseInfo->setUnit ( "b/min" );
		this->pulseInfo->setImage( texture );
		//gridLayout->AddElement( this->pulseInfo->getInfoPanel(), 1, 0, 1, 1, IW_UI_ALIGN_CENTRE, IW_UI_ALIGN_MIDDLE, CIwSVec2( 1, 1 ) );
	}
	else {
		this->pulseInfo = NULL;
	}

	// Find timer/status grid
	//CIwUIElement *timeStatusElement = this->myScreen->GetChildNamed( "TimeStatusElement" );
	//CIwUILayoutGrid *timeStatusLayout = (CIwUILayoutGrid*) timeStatusElement->GetLayout();

	// Add time infopanel to grid
	texture = (CIwTexture*)IwGetResManager()->GetResNamed( "timer24", IW_GX_RESTYPE_TEXTURE );
	this->timeInfo = new InfoPanel( "timeInfo", true );
	this->timeInfo->setUnit( "hh:mm:ss" );
	this->timeInfo->setImage( texture );
	this->timeInfo->getInfoPanel()->SetSizeHint( CIwVec2( 120, 60 ) );
	//timeStatusLayout->AddElement( this->timeInfo->getInfoPanel(), 0, 0, 1, 1, IW_UI_ALIGN_CENTRE, IW_UI_ALIGN_MIDDLE, CIwSVec2( 1, 1 ) );

	// Add time infopanel to grid
	texture = (CIwTexture*)IwGetResManager()->GetResNamed( "Satellite", IW_GX_RESTYPE_TEXTURE );
	this->statusInfo = new InfoPanel( "statusInfo", true );
	this->statusInfo->setUnit( "Status" );
	this->statusInfo->setImage( texture );
	this->statusInfo->getInfoPanel()->SetSizeHint( CIwVec2( 120, 60 ) );
	//timeStatusLayout->AddElement( this->statusInfo->getInfoPanel(), 0, 1, 1, 1, IW_UI_ALIGN_CENTRE, IW_UI_ALIGN_MIDDLE, CIwSVec2( 1, 1 ) );

	// Add clock infopanel to grid
	texture = (CIwTexture*)IwGetResManager()->GetResNamed( "clock24", IW_GX_RESTYPE_TEXTURE );
	this->clockInfo = new InfoPanel( "clockInfo", true );
	this->clockInfo->setUnit( "hh:mm" );
	this->clockInfo->setImage( texture );
	this->clockInfo->getInfoPanel()->SetSizeHint( CIwVec2( -1, -1 ) );
	//gridLayout->AddElement( this->clockInfo->getInfoPanel(), 0, 2, 2, 1, IW_UI_ALIGN_CENTRE, IW_UI_ALIGN_MIDDLE, CIwSVec2( 1, 1 ) );
	s3eTimerSetTimer( 100, &MainScreen::clockTimer, NULL ); // Start calling the timer to display the current time

	// Apply the layout S3E_SURFACE_BLIT_DIR_ROT90
	this->SurfaceChanged( (s3eSurfaceBlitDirection) s3eSurfaceGetInt( S3E_SURFACE_BLIT_DIRECTION ) );

	IwGetUIView()->AddElementToLayout( this->myScreen );

	// Reset the display to its default values
	this->Reset();

	// Make sure we are always rendered before all others
	this->myScreen->SetRenderSlot( -10 );

	//s3eOSExecExecute( "https://www.facebook.com/dialog/oauth?client_id=144229302291327&redirect_uri=www.gofg.at", false );
}

MainScreen::~MainScreen() {
	delete this->speedInfo;
	delete this->distanceInfo;
	delete this->altitudeInfo;
	delete this->timeInfo;
	delete this->clockInfo;
	delete this->statusInfo;
	delete this->pulseInfo;
}

void MainScreen::Reset() {
	// Reset the internal statistics variables
	this->bStopPending = false;
	this->totalDistance = 0.0;
	this->totalAltitudeDiff = 0.0;
	this->lastAltitude = -1000.0;
	this->fixCount = 0;

	// Reset the panels (statistic reset)
	this->speedInfo->Reset();
	this->distanceInfo->Reset();
	this->altitudeInfo->Reset();
	this->timeInfo->Reset();

	// Set our labels once, so that scaling can take place
	this->speedInfo->setValue( "0.00" );
	this->distanceInfo->setValue( "0.00" );
	this->altitudeInfo->setValue( "0.00" );
	this->timeInfo->setValue( "00:00:00" );

	// Pulse info needs some special handling (since it's optional)
	if( this->pulseInfo != NULL ) {
		this->pulseInfo->setValue( "0" );
		this->pulseInfo->Reset();
	}
}

/**
 * <summary>	Update the display timer for the passed time. </summary>
 *
 * <remarks>	Wkoller, 23.03.2011. </remarks>
 *
 * <param name="timeDiff">	The time difference. </param>
 */
void MainScreen::UpdateTimerDisplay( int timeDiff ) {
	// Calculate hours, mins and seconds
	int hours = timeDiff / 3600;
	int mins = (timeDiff % 3600) / 60;
	int secs = ((timeDiff % 3600) % 60);

	// Create formatted time-stamp & display it
	std::ostringstream formatBuffer;
	formatBuffer.fill( '0' );
	formatBuffer << right << setw(2) << hours << ":" << setw(2) << mins << ":" << setw(2) << secs;
	this->timeInfo->setValue( formatBuffer.str().c_str() );
}


/**
 * <summary>	Update accuracy image based on minimum location accuracy. </summary>
 *
 * <remarks>	Wkoller, 11.04.2011. </remarks>
 *
 * <param name="accuracy">	The current location accuracy. </param>
 */
void MainScreen::UpdateAccuracyDisplay( double accuracy ) {
	// Update accuracy image based on minimum location accuracy
	double minAccuracy = (double) SettingsHandler::Self()->GetInt( "MinLocationAccuracy" );
	if( accuracy > minAccuracy || accuracy <= 0.0 ) {
		MainScreen::Self()->statusInfo->setValue( (CIwTexture*)IwGetResManager()->GetResNamed( "wireless_none", IW_GX_RESTYPE_TEXTURE ) );
	}
	else if( accuracy > (minAccuracy / 3.0 * 2.0) ) {
		MainScreen::Self()->statusInfo->setValue( (CIwTexture*)IwGetResManager()->GetResNamed( "wireless_low", IW_GX_RESTYPE_TEXTURE ) );
	}
	else if( accuracy > (minAccuracy / 3.0 * 1.0) ) {
		MainScreen::Self()->statusInfo->setValue( (CIwTexture*)IwGetResManager()->GetResNamed( "wireless_medium", IW_GX_RESTYPE_TEXTURE ) );
	}
	else {
		MainScreen::Self()->statusInfo->setValue( (CIwTexture*)IwGetResManager()->GetResNamed( "wireless_full", IW_GX_RESTYPE_TEXTURE ) );
	}
}

/**
 * <summary>	Update all main-screen displays. </summary>
 *
 * <remarks>	Wkoller, 07.04.2011. </remarks>
 *
 * <param name="speed">		  	The current speed (in m/s) </param>
 * <param name="hr">		  	The current heartrate (in bpm) </param>
 * <param name="distance">	  	The total distance (in m) </param>
 * <param name="altitudeDiff">	The total altitude difference (in m) </param>
 * <param name="timeDiff">	  	The total time difference (in s) </param>
 * <param name="accuracy">	  	The accuracy (in m). </param>
 */
void MainScreen::UpdateDisplay( double speed, double hr, double distance, double altitudeDiff, int timeDiff, double accuracy ) {
	// Update speed information
	this->speedInfo->setValue( speed * 3.6 );
	// Update average value for speed
	this->speedInfo->setAverage( (distance / (double) timeDiff) * 3.6 );

	// Update HR display
	if( this->pulseInfo != NULL ) this->pulseInfo->setValue( hr );

	// Update total distance
	this->distanceInfo->setValue( distance / 1000.0 ); // /1000.0 to convert meters to km

	// Update altitude difference
	this->altitudeInfo->setValue( altitudeDiff );

	// Update timer display
	this->UpdateTimerDisplay( timeDiff );
	// Update accuracy display
	this->UpdateAccuracyDisplay( accuracy );
}


/**
 * <summary>	Called by the static Screen callback whenever the orientation changes. </summary>
 *
 * <remarks>	Wkoller, 08.04.2011. </remarks>
 *
 * <param name="direction">	New orientation of the screen. </param>
 */
void MainScreen::SurfaceChanged( s3eSurfaceBlitDirection direction ) {
	// Remove any elements from their original layout
	this->speedInfo->Detach();
	this->distanceInfo->Detach();
	this->altitudeInfo->Detach();
	this->clockInfo->Detach();
	this->timeInfo->Detach();
	this->statusInfo->Detach();
	if( this->pulseInfo != NULL ) this->pulseInfo->Detach();

	// Create basic grid layout
	CIwUILayoutGrid *gridLayout = new CIwUILayoutGrid();
	gridLayout->SetSizeToSpace( true );
	this->mainGrid->SetLayout( gridLayout );

	// Check new orientation
	switch( direction ) {
	// Landscape
	case S3E_SURFACE_BLIT_DIR_ROT90:
	case S3E_SURFACE_BLIT_DIR_ROT270:
		// We need two rows
		gridLayout->AddRow();
		gridLayout->AddRow();
		// ... and three columns
		gridLayout->AddColumn();
		gridLayout->AddColumn();
		gridLayout->AddColumn();

		// Now add the elements to the correct position
		gridLayout->AddElement( this->speedInfo->getInfoPanel(), 0, 0, 1, 1, IW_UI_ALIGN_CENTRE, IW_UI_ALIGN_MIDDLE, CIwSVec2( 1, 1 ) );
		gridLayout->AddElement( this->distanceInfo->getInfoPanel(), 1, 0, 1, 1, IW_UI_ALIGN_CENTRE, IW_UI_ALIGN_MIDDLE, CIwSVec2( 1, 1 ) );
		gridLayout->AddElement( this->altitudeInfo->getInfoPanel(), 0, 1, 1, 1, IW_UI_ALIGN_CENTRE, IW_UI_ALIGN_MIDDLE, CIwSVec2( 1, 1 ) );
		gridLayout->AddElement( this->clockInfo->getInfoPanel(), 2, 1, 1, 1, IW_UI_ALIGN_CENTRE, IW_UI_ALIGN_MIDDLE, CIwSVec2( 1, 1 ) );

		if( this->pulseInfo != NULL ) {
			gridLayout->AddElement( this->pulseInfo->getInfoPanel(), 2, 0, 1, 1, IW_UI_ALIGN_CENTRE, IW_UI_ALIGN_MIDDLE, CIwSVec2( 1, 1 ) );

			this->timeStatusElement = new CIwUIElement();
			CIwUILayoutGrid *timeStatusLayout = new CIwUILayoutGrid();
			timeStatusLayout->SetSizeToSpace( true );
			timeStatusLayout->AddRow();
			timeStatusLayout->AddRow();
			timeStatusLayout->AddColumn();

			timeStatusLayout->AddElement( this->timeInfo->getInfoPanel(), 0, 0, 1, 1, IW_UI_ALIGN_CENTRE, IW_UI_ALIGN_MIDDLE, CIwSVec2( 1, 1 ) );
			timeStatusLayout->AddElement( this->statusInfo->getInfoPanel(), 0, 1, 1, 1, IW_UI_ALIGN_CENTRE, IW_UI_ALIGN_MIDDLE, CIwSVec2( 1, 1 ) );
			this->timeStatusElement->SetLayout( timeStatusLayout );

			gridLayout->AddElement( this->timeStatusElement, 1, 1, 1, 1, IW_UI_ALIGN_CENTRE, IW_UI_ALIGN_MIDDLE );
		}
		else {
			gridLayout->AddElement( this->timeInfo->getInfoPanel(), 2, 0, 1, 1, IW_UI_ALIGN_CENTRE, IW_UI_ALIGN_MIDDLE, CIwSVec2( 1, 1 ) );
			gridLayout->AddElement( this->statusInfo->getInfoPanel(), 1, 1, 1, 1, IW_UI_ALIGN_CENTRE, IW_UI_ALIGN_MIDDLE, CIwSVec2( 1, 1 ) );
		}
		break;
	// Portrait
	default:
		// We need three rows
		gridLayout->AddRow();
		gridLayout->AddRow();
		gridLayout->AddRow();
		// ... and two columns
		gridLayout->AddColumn();
		gridLayout->AddColumn();

		// Now add the elements to the correct position
		gridLayout->AddElement( this->speedInfo->getInfoPanel(), 0, 0, 1, 1, IW_UI_ALIGN_CENTRE, IW_UI_ALIGN_MIDDLE, CIwSVec2( 1, 1 ) );
		gridLayout->AddElement( this->clockInfo->getInfoPanel(), 0, 2, 2, 1, IW_UI_ALIGN_CENTRE, IW_UI_ALIGN_MIDDLE, CIwSVec2( 1, 1 ) );

		// Check if we have a pulse info or not
		if( this->pulseInfo != NULL ) {
			// Add pulse info to layout
			gridLayout->AddElement( this->pulseInfo->getInfoPanel(), 1, 0, 1, 1, IW_UI_ALIGN_CENTRE, IW_UI_ALIGN_MIDDLE, CIwSVec2( 1, 1 ) );

			// Change size of distance / altitude info
			this->distanceInfo->getInfoPanel()->SetSizeHint( CIwVec2( 120, 60 ) );
			this->altitudeInfo->getInfoPanel()->SetSizeHint( CIwVec2( 120, 60 ) );

			// Prepare helper element for distance / altitude info
			CIwUIElement *distAltElement = new CIwUIElement();
			CIwUILayoutGrid *distAltElementLayout = new CIwUILayoutGrid();
			distAltElementLayout->SetSizeToSpace( true );
			distAltElementLayout->AddRow();
			distAltElementLayout->AddRow();
			distAltElementLayout->AddColumn();
			distAltElementLayout->AddElement( this->distanceInfo->getInfoPanel(), 0, 0, 1, 1, IW_UI_ALIGN_CENTRE, IW_UI_ALIGN_MIDDLE, CIwSVec2( 1, 1 ) );
			distAltElementLayout->AddElement( this->altitudeInfo->getInfoPanel(), 0, 1, 1, 1, IW_UI_ALIGN_CENTRE, IW_UI_ALIGN_MIDDLE, CIwSVec2( 1, 1 ) );
			distAltElement->SetLayout( distAltElementLayout );
			gridLayout->AddElement( distAltElement, 0, 1, 1, 1, IW_UI_ALIGN_CENTRE, IW_UI_ALIGN_MIDDLE );
		}
		// ... if not just add distance & altitude info
		else {
			gridLayout->AddElement( this->distanceInfo->getInfoPanel(), 1, 0, 1, 1, IW_UI_ALIGN_CENTRE, IW_UI_ALIGN_MIDDLE, CIwSVec2( 1, 1 ) );
			gridLayout->AddElement( this->altitudeInfo->getInfoPanel(), 0, 1, 1, 1, IW_UI_ALIGN_CENTRE, IW_UI_ALIGN_MIDDLE, CIwSVec2( 1, 1 ) );
		}

		// Insert timer / status panels (using a helper layout)
		this->timeStatusElement = new CIwUIElement();
		CIwUILayoutGrid *timeStatusLayout = new CIwUILayoutGrid();
		timeStatusLayout->SetSizeToSpace( true );
		timeStatusLayout->AddRow();
		timeStatusLayout->AddRow();
		timeStatusLayout->AddColumn();
		timeStatusLayout->AddElement( this->timeInfo->getInfoPanel(), 0, 0, 1, 1, IW_UI_ALIGN_CENTRE, IW_UI_ALIGN_MIDDLE, CIwSVec2( 1, 1 ) );
		timeStatusLayout->AddElement( this->statusInfo->getInfoPanel(), 0, 1, 1, 1, IW_UI_ALIGN_CENTRE, IW_UI_ALIGN_MIDDLE, CIwSVec2( 1, 1 ) );
		this->timeStatusElement->SetLayout( timeStatusLayout );
		gridLayout->AddElement( this->timeStatusElement, 1, 1, 1, 1, IW_UI_ALIGN_CENTRE, IW_UI_ALIGN_MIDDLE );
		break;
	}
}