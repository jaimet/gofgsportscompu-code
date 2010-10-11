/*
 * This file is part of the Airplay SDK Code Samples.
 *
 * Copyright (C) 2001-2010 Ideaworks3D Ltd.
 * All Rights Reserved.
 *
 * This source code is intended only as a supplement to Ideaworks Labs
 * Development Tools and/or on-line documentation.
 *
 * THIS CODE AND INFORMATION ARE PROVIDED "AS IS" WITHOUT WARRANTY OF ANY
 * KIND, EITHER EXPRESSED OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND/OR FITNESS FOR A
 * PARTICULAR PURPOSE.
 */
#include <memory.h>

#include "s3e.h"
#include "s3eTimer.h"
// Includes
#include "IwGx.h"
#include "IwUI.h"

#include "lib/GPSHandler.h"
#include "lib/TrackHandler.h"

#include "uiLib/InfoPanel.h"
#include "uiLib/TrackTVItemSource.h"

class DisplayHandler
{
public:
	static DisplayHandler *Self() {
		if( DisplayHandler::mySelf == NULL ) {
			DisplayHandler::mySelf = new DisplayHandler();
		}

		return DisplayHandler::mySelf;
	}

	DisplayHandler()
	{
		IW_UI_CREATE_VIEW_SLOT1(this, "DisplayHandler", DisplayHandler, StartButtonClick, CIwUIElement*)
		IW_UI_CREATE_VIEW_SLOT1(this, "DisplayHandler", DisplayHandler, StopButtonClick, CIwUIElement*)
		IW_UI_CREATE_VIEW_SLOT1(this, "DisplayHandler", DisplayHandler, ExitButtonClick, CIwUIElement*)
		IW_UI_CREATE_VIEW_SLOT1(this, "DisplayHandler", DisplayHandler, ExportButtonClick, CIwUIElement*)
	}

	void StartButtonClick(CIwUIElement*)
	{
		this->bStopPending = false;
		this->totalDistance = 0.0;

		this->m_StartButton->SetVisible( false );
		this->m_ExitButton->SetVisible( false );
		this->m_StopButton->SetVisible( true );

		char fileName[20];
		time_t *myTime = new time_t;
		time( myTime );
		strftime( fileName, strlen(fileName), "%Y%m%d_%H%M%S.gsc", localtime( myTime ) );
		this->startTime = time( NULL );

		TrackHandler::Self()->startTracking( fileName );
		GPSHandler::Self()->startGPS();

		s3eTimerSetTimer( 1000, &DisplayHandler::mainTimer, NULL );
	}

	void StopButtonClick(CIwUIElement*)
	{
		GPSHandler::Self()->stopGPS();
		TrackHandler::Self()->stopTracking();

		this->m_StartButton->SetVisible( true );
		this->m_ExitButton->SetVisible( true );
		this->m_StopButton->SetVisible( false );

		this->bStopPending = true;
	}

	void ExitButtonClick(CIwUIElement*)
	{
		s3eDeviceRequestQuit();
	}

	void ExportButtonClick(CIwUIElement*)
	{
		this->exportScreen->SetVisible( true );
	}


	void setLongitude( double value ) {
		char buf[20];

		sprintf( buf, "%.6f", value );
		this->m_LongitudeLabel->SetCaption( buf );
	}

	void setLatitude( double value ) {
		char buf[20];

		sprintf( buf, "%.6f", value );
		this->m_LatitudeLabel->SetCaption( buf );
	}

	void setAltitude( double value ) {
		char buf[20];

		sprintf( buf, "%.6f", value );
		this->m_AltitudeLabel->SetCaption( buf );
	}

	// TODO: CONTINUE WITH MAIN TIMER <=============
	static int mainTimer( void *systemData, void *userData ) {
		if( DisplayHandler::Self()->bStopPending ) return 1;

		if( GPSHandler::Self()->updateLocation() ) {
			DisplayHandler::Self()->setAltitude( GPSHandler::Self()->getAltitude() );
			DisplayHandler::Self()->setLongitude( GPSHandler::Self()->getLongitude() );
			DisplayHandler::Self()->setLatitude( GPSHandler::Self()->getLatitude() );
			DisplayHandler::Self()->totalDistance += GPSHandler::Self()->getDistance();

			TrackHandler::Self()->addGPSData( GPSHandler::Self()->getLongitude(), GPSHandler::Self()->getLatitude(), GPSHandler::Self()->getAltitude() );
			TrackHandler::Self()->addDistanceData( DisplayHandler::Self()->totalDistance );
			
			DisplayHandler::Self()->speedInfo->setValue( GPSHandler::Self()->getSpeed() * 3.6 );
			DisplayHandler::Self()->distanceInfo->setValue( DisplayHandler::Self()->totalDistance / 1000.0 ); // /1000.0 to convert meters to km
		}

		// Update timer (run-time)
		char myBuf[10];
		time_t timeDiff = (time_t)difftime( time( NULL ), DisplayHandler::Self()->startTime );
		tm *timeStruct = localtime( &timeDiff );
		strftime( myBuf, strlen(myBuf), "%H:%M:%S", timeStruct );
		DisplayHandler::Self()->timeInfo->setValue( myBuf );

		s3eTimerSetTimer( 1000, &DisplayHandler::mainTimer, NULL );

		return 0;
	}

	// Called once a minute to update the clock
	static int clockTimer( void *systemData, void *userData ) {
		char myBuf[6];
		time_t currTime = time( NULL );
		tm *timeStruct = localtime( &currTime );
		strftime( myBuf, strlen(myBuf), "%H:%M", timeStruct );

		DisplayHandler::Self()->clockInfo->setValue( myBuf );

		// Continue calling the clock timer
		s3eTimerSetTimer( 60000, &DisplayHandler::clockTimer, NULL );

		return 0;
	}

public:
	CIwUILabel* m_LongitudeLabel;
	CIwUILabel* m_LatitudeLabel;
	CIwUILabel* m_AltitudeLabel;

	CIwUIButton* m_ExitButton;
	CIwUIButton* m_StartButton;
	CIwUIButton* m_StopButton;

	InfoPanel *speedInfo;
	InfoPanel *distanceInfo;
	InfoPanel *altitudeInfo;
	InfoPanel *timeInfo;
	InfoPanel *clockInfo;

	CIwUIElement *exportScreen;
private:
	static DisplayHandler *mySelf;
	bool bStopPending;

	double totalDistance;
	time_t startTime;
};

DisplayHandler *DisplayHandler::mySelf = NULL;

/*int32 MainTimer(void *systemData, void *userData)
{
	if( GPSHandler::Self()->updateLocation() ) {
		DisplayHandler::Self()->setAltitude( GPSHandler::Self()->getAltitude() );
		DisplayHandler::Self()->setLongitude( GPSHandler::Self()->getLongitude() );
		DisplayHandler::Self()->setLatitude( GPSHandler::Self()->getLatitude() );

		TrackHandler::Self()->addGPSData( GPSHandler::Self()->getLongitude(), GPSHandler::Self()->getLatitude(), GPSHandler::Self()->getAltitude() );
	}
}*/

//-------------------------------------------------------------------------- 
void ExampleInit() 
{
	IwGxInit();
	IwUIInit();
	IW_CLASS_REGISTER(TrackTVItemSource);
	
	//Instantiate the view and controller singletons.
	new CIwUIController;
	new CIwUIView;

	// Instantiate class to deal with events
	//g_Counter = new CCounter;
	DisplayHandler::Self();

	// Load the UITutorial UI
	IwGetResManager()->LoadGroup("GOFGUI.group");

    //Set the default style sheet
    CIwResource* pResource = IwGetResManager()->GetResNamed("iwui", IW_UI_RESTYPE_STYLESHEET);
    IwGetUIStyleManager()->SetStylesheet(IwSafeCast<CIwUIStylesheet*>(pResource));

	// Add the built page to the view
	//CIwUIElement* pPage = CIwUIElement::CreateFromResource("ExportScreen");
	CIwUIElement* pPage = CIwUIElement::CreateFromResource("main");
	IwGetUIView()->AddElement(pPage);
	IwGetUIView()->AddElementToLayout(pPage);

	DisplayHandler::Self()->exportScreen = CIwUIElement::CreateFromResource( "ExportScreen" );
	IwGetUIView()->AddElementToLayout( DisplayHandler::Self()->exportScreen );
	DisplayHandler::Self()->exportScreen->SetVisible( false );
	/*CIwUITableView *exportView = (CIwUITableView*)pPage->GetChildNamed( "TrackList" );
	exportView->SetItemSource( new TrackTVItemSource() );
	//exportView->RecreateItemsFromSource();
	exportView->InsertRow( 0 );
	exportView->InsertRow( 1 );
	exportView->InsertRow( 2 );
	exportView->InsertRow( 3 );*/

	//return;

	// TODO: Image laden und buttons anzeigen
	//CIwTexture* texture = (CIwTexture*)IwGetResManager()->GetResNamed( "play", IW_GX_RESTYPE_TEXTURE );
	//gowebsite24

	DisplayHandler::Self()->m_LatitudeLabel = (CIwUILabel*)pPage->GetChildNamed("LatitudeLabel");
	DisplayHandler::Self()->m_LongitudeLabel = (CIwUILabel*)pPage->GetChildNamed("LongitudeLabel");
	DisplayHandler::Self()->m_AltitudeLabel = (CIwUILabel*)pPage->GetChildNamed("AltitudeLabel");

	DisplayHandler::Self()->m_StartButton = (CIwUIButton*)pPage->GetChildNamed("StartButton");
	DisplayHandler::Self()->m_StopButton = (CIwUIButton*)pPage->GetChildNamed("StopButton");
	DisplayHandler::Self()->m_ExitButton = (CIwUIButton*)pPage->GetChildNamed("ExitButton");

	// Find our main grid and fill it
	CIwUIElement* gridElement = pPage->GetChildNamed( "Grid_0" );
	CIwUILayoutGrid* gridLayout =(CIwUILayoutGrid *)gridElement->GetLayout();

	// Add speed infopanel to grid
	CIwTexture *texture = (CIwTexture*)IwGetResManager()->GetResNamed( "gowebsite24", IW_GX_RESTYPE_TEXTURE );
	InfoPanel* speedInfo = new InfoPanel( "speedInfo" );
	speedInfo->setUnit( "km/h" );
	speedInfo->setImage( texture );
	DisplayHandler::Self()->speedInfo = speedInfo;
	gridLayout->AddElement( speedInfo->getInfoPanel(), 0, 0, 1, 1, IW_UI_ALIGN_CENTRE, IW_UI_ALIGN_MIDDLE, CIwSVec2( 1, 1 ) );

	// Add distance infopanel to grid
	texture = (CIwTexture*)IwGetResManager()->GetResNamed( "web24", IW_GX_RESTYPE_TEXTURE );
	InfoPanel *distanceInfo = new InfoPanel( "distanceInfo", true );
	distanceInfo->setUnit ( "km" );
	distanceInfo->setImage( texture );
	DisplayHandler::Self()->distanceInfo = distanceInfo;
	gridLayout->AddElement( distanceInfo->getInfoPanel(), 1, 0, 1, 1, IW_UI_ALIGN_CENTRE, IW_UI_ALIGN_MIDDLE, CIwSVec2( 1, 1 ) );

	// Add altitude infopanel to grid
	texture = (CIwTexture*)IwGetResManager()->GetResNamed( "mountain24", IW_GX_RESTYPE_TEXTURE );
	InfoPanel *altitudeInfo = new InfoPanel( "altitudeInfo", true );
	altitudeInfo->setUnit( "m" );
	altitudeInfo->setImage( texture );
	DisplayHandler::Self()->altitudeInfo = altitudeInfo;
	gridLayout->AddElement( altitudeInfo->getInfoPanel(), 0, 1, 1, 1, IW_UI_ALIGN_CENTRE, IW_UI_ALIGN_MIDDLE, CIwSVec2( 1, 1 ) );

	// Add time infopanel to grid
	texture = (CIwTexture*)IwGetResManager()->GetResNamed( "timer24", IW_GX_RESTYPE_TEXTURE );
	InfoPanel *timeInfo = new InfoPanel( "timeInfo", true );
	timeInfo->setUnit( "hh:mm:ss" );
	timeInfo->setImage( texture );
	DisplayHandler::Self()->timeInfo = timeInfo;
	gridLayout->AddElement( timeInfo->getInfoPanel(), 1, 1, 1, 1, IW_UI_ALIGN_CENTRE, IW_UI_ALIGN_MIDDLE, CIwSVec2( 1, 1 ) );

	// Add clock infopanel to grid
	texture = (CIwTexture*)IwGetResManager()->GetResNamed( "clock24", IW_GX_RESTYPE_TEXTURE );
	InfoPanel *clockInfo = new InfoPanel( "clockInfo", true );
	clockInfo->setUnit( "hh:mm" );
	clockInfo->setImage( texture );
	DisplayHandler::Self()->clockInfo = clockInfo;
	DisplayHandler::clockTimer( NULL, NULL );	// Call clock timer once to start displaying the current time
	gridLayout->AddElement( clockInfo->getInfoPanel(), 0, 2, 2, 1, IW_UI_ALIGN_CENTRE, IW_UI_ALIGN_MIDDLE, CIwSVec2( 1, 1 ) );

	//texture = (CIwTexture*)IwGetResManager()->GetResNamed( "clock24", IW_GX_RESTYPE_TEXTURE );
	/*InfoPanel *clockInfo = new InfoPanel( true );
	clockInfo->setUnit( "hh:mm" );
	clockInfo->setImage( texture );*/
	//CIwUIElement *clockInfo = CIwUIElement::CreateFromResource("InfoPanel");
	//CIwUIElement *speedInfo = CIwUIElement::CreateFromResource("InfoPanel");
	//CIwUIElement *distanceInfo = CIwUIElement::CreateFromResource("InfoPanel_Small");
	//CIwUIElement *altitudeInfo = CIwUIElement::CreateFromResource("InfoPanel_Small");
	//CIwUIElement *timeInfo = CIwUIElement::CreateFromResource("InfoPanel_Small");

	//gridLayout->AddRow();
/*	gridLayout->AddElement( speedInfo, 0, gridLayout->GetNumRows() - 1 );
	gridLayout->AddElement( distanceInfo, 1, gridLayout->GetNumRows() - 1 );*/


	//gridLayout->SetLayoutInvalid(

	// Let the DisplayHandler know about the speedInfo

	//Find the counter label
	//g_Counter->m_Label = (CIwUILabel*)pPage->GetChildNamed("LatitudeLabel");
} 
//-------------------------------------------------------------------------- 
void ExampleShutDown() 
{
	delete IwGetUIController();
	delete IwGetUIView();

	IwUITerminate();
	IwGxTerminate();
} 
//-------------------------------------------------------------------------- 
bool ExampleUpdate() 
{ 
	IwGetUIController()->Update();
	IwGetUIView()->Update(25);

/*	if( g_Counter->b_GpsActive ) {
		s3eLocation g_Location;
		s3eResult g_Error = S3E_RESULT_ERROR;

		g_Error = s3eLocationGet(&g_Location);

		if( g_Error != S3E_RESULT_SUCCESS ) {
			g_Location.m_Latitude = -1.0;
			g_Location.m_Longitude = -1.0;
		}

		char buf[64];
		sprintf(buf,"%.6f",g_Location.m_Latitude);

		g_Counter->m_Label->SetCaption(buf);
	}*/

	return true; 
} 
//-------------------------------------------------------------------------- 
// The following function clears the screen and outputs the 
// phrase "Hello World". It uses The s3eDebugPrint() function 
// to print the phrase. 
//-------------------------------------------------------------------------- 
void ExampleRender() 
{ 
	// Get pointer to the screen surface 
	// (pixel depth is 2 bytes by default) 
	/*uint16* screen = (uint16*)s3eSurfacePtr(); 
	int height = s3eSurfaceGetInt(S3E_SURFACE_HEIGHT); 
	int width = s3eSurfaceGetInt(S3E_SURFACE_WIDTH); 
	int pitch = s3eSurfaceGetInt(S3E_SURFACE_PITCH); 
 
	// Clear screen to white 
	for (int i=0; i < height; i++) 
	{ 
		memset((char*)screen + pitch * i, 255, (width * 2)); 
	} 
	// Print Hello World 
	s3eDebugPrint(10, 20, "`x000000Hello World", 0); */

	IwGxClear(IW_GX_COLOUR_BUFFER_F | IW_GX_DEPTH_BUFFER_F);

	IwGetUIView()->Render();

	IwGxFlush();
	IwGxSwapBuffers();
} 
