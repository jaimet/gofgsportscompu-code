#include "MainScreen.h"

template<>
MainScreen *Singleton<MainScreen>::mySelf = NULL;

// TODO: Continue here with creating MainScreen Class

void MainScreen::StartButtonClick(CIwUIElement*)
{
	/*this->bStopPending = false;
	this->totalDistance = 0.0;

	this->m_StartButton->SetVisible( false );
	this->m_ExitButton->SetVisible( false );
	this->m_StopButton->SetVisible( true );

	char fileName[20];

	// Generate file name for tracking
	this->startTime = time( NULL );
	sprintf( fileName, "%d.gsc", this->startTime );
	TrackHandler::Self()->startTracking( fileName );
	GPSHandler::Self()->startGPS();

	s3eTimerSetTimer( 1000, &DisplayHandler::mainTimer, NULL );*/
}

void MainScreen::StopButtonClick(CIwUIElement*)
{
	/*GPSHandler::Self()->stopGPS();
	TrackHandler::Self()->stopTracking();

	this->m_StartButton->SetVisible( true );
	this->m_ExitButton->SetVisible( true );
	this->m_StopButton->SetVisible( false );

	this->bStopPending = true;*/
}

void MainScreen::ExitButtonClick(CIwUIElement*)
{
	s3eDeviceRequestQuit();
}

void MainScreen::MenuButtonClick(CIwUIElement*)
{
	MenuScreen::Self()->SetVisible( true );
	//MenuScreen::Self()->GetScreen()->SetVisible(true);
	//ExportScreen::Self()->GetScreen()->SetVisible( true );
}

MainScreen::MainScreen() : Screen( "MainScreen" ) {
	IW_UI_CREATE_VIEW_SLOT1(this, "MainScreen", MainScreen, StartButtonClick, CIwUIElement*)
	IW_UI_CREATE_VIEW_SLOT1(this, "MainScreen", MainScreen, StopButtonClick, CIwUIElement*)
	IW_UI_CREATE_VIEW_SLOT1(this, "MainScreen", MainScreen, ExitButtonClick, CIwUIElement*)
	IW_UI_CREATE_VIEW_SLOT1(this, "MainScreen", MainScreen, MenuButtonClick, CIwUIElement*)

	//this->myScreen = CIwUIElement::CreateFromResource( "MenuScreen" );

	//this->tracksButton = this->myScreen->GetChildNamed( "TracksButton" );

	IwGetUIView()->AddElementToLayout( this->myScreen );
}
