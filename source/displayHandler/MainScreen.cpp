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
#include "../uiLib/IwUIInfoPanel.h"

//#include "../uiLib/CIwUIComboBox.h"

template<>
MainScreen *Singleton<MainScreen>::mySelf = NULL;

void MainScreen::MA_StartButtonClick(CIwUIElement*) {
	// Reset the mainscreen display
	this->Reset();

	// Check if Location API is available at all
	if( !s3eLocationAvailable() ) {
		MsgBox::Show( "No location API (GPS) is available on your system." );
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

	// Register the unpause callback (enable GPS on device resume)
	s3eDeviceRegister( S3E_DEVICE_UNPAUSE, &MainScreen::CB_DeviceUnPause, NULL );

	// Keep device alive
	MainScreen::CB_AwakeTimer( NULL, NULL );

	// Start tracking by using the startup timer
	MainScreen::startupTimer( NULL, NULL );
}

void MainScreen::MA_StopButtonClick(CIwUIElement*) {
	// UnRegister the unpause callback
	s3eDeviceUnRegister( S3E_DEVICE_UNPAUSE, &MainScreen::CB_DeviceUnPause );

	// Stop GPS Tracking & File recording
	GPSHandler::Self()->stopGPS();
	TrackHandler::Self()->stopTracking();

	// Display correct buttons again
	this->StartButton->SetVisible( true );
	this->ExitButton->SetVisible( true );
	this->MenuButton->SetVisible( true );
	this->StopButton->SetVisible( false );
	this->PauseButton->SetVisible( false );
	this->ContinueButton->SetVisible( false );

	// Cancel all timers
	s3eTimerCancelTimer( &MainScreen::CB_AwakeTimer, NULL );
	s3eTimerCancelTimer( &MainScreen::startupTimer, NULL );
	s3eTimerCancelTimer( &MainScreen::mainTimer, NULL );

	// Notify timers that a stop is pending
	//this->bStopPending = true;
}

void MainScreen::MA_ExitButtonClick(CIwUIElement*) {
	s3eDeviceRequestQuit();
}

void MainScreen::MA_MenuButtonClick(CIwUIElement*) {
	MenuScreen::Self()->SetVisible( true );
}

void MainScreen::CB_MAPauseButtonClick(CIwUIElement*) {
	GPSHandler::Self()->stopGPS();
	//this->bStopPending = true;

	// Cancel all timers
	s3eTimerCancelTimer( &MainScreen::CB_AwakeTimer, NULL );
	s3eTimerCancelTimer( &MainScreen::startupTimer, NULL );
	s3eTimerCancelTimer( &MainScreen::mainTimer, NULL );

	this->PauseButton->SetVisible( false );
	this->ContinueButton->SetVisible( true );
}

void MainScreen::CB_MAContinueButtonClick(CIwUIElement*) {
	GPSHandler::Self()->startGPS();
	//this->bStopPending = false;

	this->ContinueButton->SetVisible( false );
	this->PauseButton->SetVisible( true );

	// Start running again
	MainScreen::CB_AwakeTimer( NULL, NULL );
	MainScreen::mainTimer( NULL, NULL );
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
	//if( MainScreen::Self()->bStopPending ) return 1;

	// Check if we have a fix
	bool bFixFound = GPSHandler::Self()->updateLocation();

	// Update display
	MainScreen::Self()->UpdateDisplay( 0.0, 0.0, 0.0, 0.0, (int) difftime( time(NULL), MainScreen::Self()->startTime ), GPSHandler::Self()->getAccuracy() );

	// Check if we have to wait for the GPS fix
	if( SettingsHandler::Self()->GetBool( "WaitForGPSFix" ) ) { // && !GPSHandler::Self()->updateLocation() ) {
		if( !bFixFound ) {
			s3eTimerSetTimer( 1000, &MainScreen::startupTimer, NULL );
			return 0;
		}
		// Wait at least LOCATION_STARTUP_DELAY fixes before starting with the track
		else if( MainScreen::Self()->fixCount < LOCATION_STARTUP_DELAY ) {
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

	// Enable the pause button
	MainScreen::Self()->PauseButton->SetVisible( true );

	// Finally start the GPS tracking
	MainScreen::mainTimer( NULL, NULL );

	return 0;
}

// Main timer, called once a second to update all infos
int MainScreen::mainTimer( void *systemData, void *userData ) {
	//if( MainScreen::Self()->bStopPending ) return 1;

	// Check if GPS is active, if not we need to start it (may be turned off due to power-saving functions)
	if( !GPSHandler::Self()->IsActive() ) GPSHandler::Self()->startGPS( false );

	// Calculate current time difference
	time_t timeNow = time( NULL );
	int timeDiff = (int) difftime( timeNow, MainScreen::Self()->startTime );

	// As long as the main timer is running, keep the device awake
	//s3eDeviceBacklightOn();

	// Check if we have a valid location info
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

		// Call main-timer again (regular interval)
		uint32 updateInterval = (uint32) SettingsHandler::Self()->GetInt( "UpdateInterval" );
		s3eTimerSetTimer( updateInterval * 1000, &MainScreen::mainTimer, NULL );

		// If the update interval is equal or greater than POWER_SAVE_INTERVAL seconds, we disable GPS in the meantime
		if( updateInterval >= POWER_SAVE_INTERVAL ) {
			GPSHandler::Self()->stopGPS();
		}
	}
	else {
		// Update display
		MainScreen::Self()->UpdateDisplay( 0.0, 0.0, MainScreen::Self()->totalDistance, MainScreen::Self()->totalAltitudeDiff, timeDiff, GPSHandler::Self()->getAccuracy() );

		// Call main-timer again (fast polling, since we want a valid location)
		s3eTimerSetTimer( 1000, &MainScreen::mainTimer, NULL );
	}

	return 0;
}

// Timer which is called once a second to keep the device awake (only during active recording of tracks)
int32 MainScreen::CB_AwakeTimer( void *systemData, void *userData ) {
	// Check if we have to exit
	//if( MainScreen::Self()->bStopPending ) return 1;

	// Keep device awake
	s3eDeviceBacklightOn();

	// Call timer again
	s3eTimerSetTimer( 1000, &MainScreen::CB_AwakeTimer, NULL );

	return 0;
}

/**
 * <summary>	Callback for the device pause event. </summary>
 *
 * <remarks>	Wkoller, 28.04.2011. </remarks>
 *
 * <param name="systemData">	[in,out] system data. </param>
 * <param name="userData">  	[in,out] user data. </param>
 *
 * <returns>	always 0 </returns>
 */
int32 MainScreen::CB_DevicePause(void *systemData, void *userData) {
	GPSHandler::Self()->stopGPS();

	return 0;
}

/**
 * <summary>	Callback for the device unpause event. </summary>
 *
 * <remarks>	Wkoller, 28.04.2011. </remarks>
 *
 * <param name="systemData">	[in,out] system data. </param>
 * <param name="userData">  	[in,out] user data. </param>
 *
 * <returns>	always 0 </returns>
 */
int32 MainScreen::CB_DeviceUnPause(void *systemData, void *userData) {
	GPSHandler::Self()->startGPS();

	return 0;
}

// Create the mainscreen-handler and intialize all panels
MainScreen::MainScreen() : Screen( "MainScreen" ) {
	IW_UI_CREATE_VIEW_SLOT1(this, "MainScreen", MainScreen, MA_StartButtonClick, CIwUIElement*)
	IW_UI_CREATE_VIEW_SLOT1(this, "MainScreen", MainScreen, MA_StopButtonClick, CIwUIElement*)
	IW_UI_CREATE_VIEW_SLOT1(this, "MainScreen", MainScreen, MA_ExitButtonClick, CIwUIElement*)
	IW_UI_CREATE_VIEW_SLOT1(this, "MainScreen", MainScreen, MA_MenuButtonClick, CIwUIElement*)
	IW_UI_CREATE_VIEW_SLOT1(this, "MainScreen", MainScreen, CB_MAPauseButtonClick, CIwUIElement*)
	IW_UI_CREATE_VIEW_SLOT1(this, "MainScreen", MainScreen, CB_MAContinueButtonClick, CIwUIElement*)

	// Find our buttons and save references to them
	this->StartButton = (CIwUIButton*) this->myScreen->GetChildNamed("StartButton");
	this->StopButton = (CIwUIButton*) this->myScreen->GetChildNamed("StopButton");
	this->ExitButton = (CIwUIButton*) this->myScreen->GetChildNamed("ExitButton");
	this->MenuButton = (CIwUIButton*) this->myScreen->GetChildNamed("MenuButton");
	this->PauseButton = (CIwUIButton*) this->myScreen->GetChildNamed("PauseButton");
	this->ContinueButton = (CIwUIButton*) this->myScreen->GetChildNamed("ContinueButton");

	// Find our main grid element
	this->mainGrid = this->myScreen->GetChildNamed( "MainGrid" );

	// Create speed infopanel
	CIwTexture *texture = (CIwTexture*)IwGetResManager()->GetResNamed( "gowebsite24", IW_GX_RESTYPE_TEXTURE );
	this->speedInfo = new InfoPanel( "speedInfo" );
	this->speedInfo->setUnit( "km/h" );
	this->speedInfo->setImage( texture );

	// Create distance infopanel
	texture = (CIwTexture*)IwGetResManager()->GetResNamed( "web24", IW_GX_RESTYPE_TEXTURE );
	this->distanceInfo = new InfoPanel( "distanceInfo", true );
	this->distanceInfo->setUnit ( "km" );
	this->distanceInfo->setImage( texture );

	// Create altitude infopanel
	texture = (CIwTexture*)IwGetResManager()->GetResNamed( "mountain24", IW_GX_RESTYPE_TEXTURE );
	this->altitudeInfo = new InfoPanel( "altitudeInfo", true );
	this->altitudeInfo->setUnit( "m" );
	this->altitudeInfo->setImage( texture );

	// Check if we use the zephyr hxm, if yes we need to create the pulse infopanel
	if( HxMHandler::Self()->IsAvailable() && SettingsHandler::Self()->GetBool( "UseZephyrHxM" ) ) {
		// Add pulse infopanel to grid
		texture = (CIwTexture*)IwGetResManager()->GetResNamed( "fav24", IW_GX_RESTYPE_TEXTURE );
		this->pulseInfo = new InfoPanel( "pulseInfo" );
		this->pulseInfo->setUnit ( "b/min" );
		this->pulseInfo->setImage( texture );
	}
	else {
		this->pulseInfo = NULL;
	}

	// Create time infopanel
	texture = (CIwTexture*)IwGetResManager()->GetResNamed( "timer24", IW_GX_RESTYPE_TEXTURE );
	this->timeInfo = new InfoPanel( "timeInfo", true );
	this->timeInfo->setUnit( "hh:mm:ss" );
	this->timeInfo->setImage( texture );
	this->timeInfo->getInfoPanel()->SetSizeHint( CIwVec2( 120, 60 ) );

	// Create time infopanel
	texture = (CIwTexture*)IwGetResManager()->GetResNamed( "Satellite", IW_GX_RESTYPE_TEXTURE );
	this->statusInfo = new InfoPanel( "statusInfo", true );
	this->statusInfo->setUnit( "Status" );
	this->statusInfo->setImage( texture );
	this->statusInfo->getInfoPanel()->SetSizeHint( CIwVec2( 120, 60 ) );

	// Create clock infopanel
	texture = (CIwTexture*)IwGetResManager()->GetResNamed( "clock24", IW_GX_RESTYPE_TEXTURE );
	this->clockInfo = new InfoPanel( "clockInfo", true );
	this->clockInfo->setUnit( "hh:mm" );
	this->clockInfo->setImage( texture );
	this->clockInfo->getInfoPanel()->SetSizeHint( CIwVec2( -1, -1 ) );
	// Start calling the timer to display the current time (100ms on first call to do it right now)
	s3eTimerSetTimer( 100, &MainScreen::clockTimer, NULL );

	// Apply the layout to the current screen (create artificial surfaceOrientation info)
	s3eSurfaceOrientation *surfaceOrientation = new s3eSurfaceOrientation();
	surfaceOrientation->m_DeviceBlitDirection = (s3eSurfaceBlitDirection) s3eSurfaceGetInt( S3E_SURFACE_BLIT_DIRECTION );
	surfaceOrientation->m_Height = s3eSurfaceGetInt( S3E_SURFACE_HEIGHT );
	//this->SurfaceChanged( surfaceOrientation );

	// Finally add the main-screen to the ui-view
	IwGetUIView()->AddElementToLayout( this->myScreen );

	// Reset the display to its default values
	this->Reset();

	// Make sure we are always rendered before all others
	this->myScreen->SetRenderSlot( -10 );

	// Register the pause callback (disables GPS on device pause)
	s3eDeviceRegister( S3E_DEVICE_PAUSE, &MainScreen::CB_DevicePause, NULL );

	// TESTING AREA
	//s3eOSExecExecute( "https://www.facebook.com/dialog/oauth?client_id=144229302291327&redirect_uri=www.gofg.at", false );
	/*CIw2DSurface *surface = Iw2DCreateSurface( 16, 16 );
	CIw2DSurface *orig = Iw2DGetSurface();
	Iw2DSetSurface( surface );
	Iw2DSetColour(0xff0000ff);
	Iw2DDrawLine( CIwSVec2( 0, 0 ), CIwSVec2( 10, 10 ) );
	CIw2DImage *s_image = Iw2DCreateImage( surface );
	this->clockInfo->setImage( s_image->GetMaterial()->GetTexture() );
	Iw2DSetSurface( orig );*/

	//CIwUIComboBox *combobox = new CIwUIComboBox();
	//this->myScreen->AddChild( combobox );
	// 
	CIwUIInfoPanel *testPanel = new CIwUIInfoPanel();

	this->mainGrid->SetLayout( new CIwUILayout() );
	this->mainGrid->GetLayout()->SetSizeToSpace( true );
	this->mainGrid->GetLayout()->AddElement( testPanel );
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
	//this->bStopPending = false;
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
	this->statusInfo->setValue( "" );

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
	if( timeDiff == 0.0 ) return;

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
void MainScreen::SurfaceChanged( s3eSurfaceOrientation *surfaceOrientation ) {
	int rowHeight = 0;

	// Remove any elements from their original layout (this also resets the layout-size)
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
	//this->mainGrid->ReplaceLayout( gridLayout );
	this->mainGrid->SetLayout( gridLayout );

	// Check new orientation
	switch( surfaceOrientation->m_DeviceBlitDirection ) {
	// Landscape
	case S3E_SURFACE_BLIT_DIR_ROT90:
	case S3E_SURFACE_BLIT_DIR_ROT270:
		rowHeight = ( surfaceOrientation->m_Width - 48 ) / 2;

		// We need two rows
		gridLayout->AddRow( rowHeight, rowHeight );
		//gridLayout->AddRow();
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

			// Add timer & status as tiny panels in one grid field
			this->timeInfo->SetLayout( INFOPANEL_LAYOUT_TINY );
			this->statusInfo->SetLayout( INFOPANEL_LAYOUT_TINY );
			// Create grid for tiny panels
			this->timeStatusElement = new CIwUIElement();
			CIwUILayoutGrid *timeStatusLayout = new CIwUILayoutGrid();
			timeStatusLayout->SetSizeToSpace( true );
			timeStatusLayout->AddRow();
			timeStatusLayout->AddRow();
			timeStatusLayout->AddColumn();
			// Add info panels to grid for tiny panels
			timeStatusLayout->AddElement( this->timeInfo->getInfoPanel(), 0, 0, 1, 1, IW_UI_ALIGN_CENTRE, IW_UI_ALIGN_MIDDLE, CIwSVec2( 1, 1 ) );
			timeStatusLayout->AddElement( this->statusInfo->getInfoPanel(), 0, 1, 1, 1, IW_UI_ALIGN_CENTRE, IW_UI_ALIGN_MIDDLE, CIwSVec2( 1, 1 ) );
			this->timeStatusElement->SetLayout( timeStatusLayout );
			// Finally add the sub-grid to the global grid-layout
			gridLayout->AddElement( this->timeStatusElement, 1, 1, 1, 1, IW_UI_ALIGN_CENTRE, IW_UI_ALIGN_MIDDLE );
		}
		else {
			gridLayout->AddElement( this->timeInfo->getInfoPanel(), 2, 0, 1, 1, IW_UI_ALIGN_CENTRE, IW_UI_ALIGN_MIDDLE, CIwSVec2( 1, 1 ) );
			gridLayout->AddElement( this->statusInfo->getInfoPanel(), 1, 1, 1, 1, IW_UI_ALIGN_CENTRE, IW_UI_ALIGN_MIDDLE, CIwSVec2( 1, 1 ) );
		}
		break;
	// Portrait
	default:
		rowHeight = (double)( surfaceOrientation->m_Height - 48 ) / 2.5;

		// We need three rows
		gridLayout->AddRow( rowHeight, rowHeight );
		gridLayout->AddRow( rowHeight, rowHeight );
//		gridLayout->AddRow();
//		gridLayout->AddRow();
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

			// Distance and altitude info are now tiny ones
			this->distanceInfo->SetLayout( INFOPANEL_LAYOUT_TINY );
			this->altitudeInfo->SetLayout( INFOPANEL_LAYOUT_TINY );

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

		// Timer and status info are tiny panels in portrait mode
		this->timeInfo->SetLayout( INFOPANEL_LAYOUT_TINY );
		this->statusInfo->SetLayout( INFOPANEL_LAYOUT_TINY );
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
