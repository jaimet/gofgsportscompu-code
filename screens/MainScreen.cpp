/*
 * MainScreen.cpp
 *
 *  Created on: 10.08.2010
 *      Author: wkoller
 */

#include "MainScreen.h"

#include "../GOFGSCMoblet.h"

template<>
MainScreen *ISingleton<MainScreen>::mySelf = NULL;

MainScreen::MainScreen() {
	this->startTime = 0;

	mainLayout = new Layout( 0, 0, GOFGSCMoblet::Self()->getScreenWidth(), GOFGSCMoblet::Self()->getScreenHeight(), NULL, 1, 4 );
	setMain( mainLayout );
	this->mainLayout->setDrawBackground(true);
	this->mainLayout->setBackgroundColor(0x000000);

	int unitSizeY = ( mainLayout->getHeight() - 48 ) / 5;

	Layout *topMainLayout = new Layout( 0, 0, mainLayout->getWidth(), unitSizeY * 4, mainLayout, 2, 3 );

	InfoPanel *heartRate = new InfoPanel( "bpm", 0, 0, topMainLayout->getWidth() / 2, unitSizeY * 2, topMainLayout, true );
	heartRate->setImage( IMAGE_HR24 );

	this->speed = new InfoPanel( "km/h", 0, 0, topMainLayout->getWidth() / 2, unitSizeY * 2, topMainLayout, true );
	this->speed->setImage( IMAGE_SPEED24 );

	this->distance = new InfoPanel( "km", 0, 0, topMainLayout->getWidth() / 2, unitSizeY, topMainLayout, false );
	this->distance->setImage( IMAGE_DISTANCE24 );

	this->time = new InfoPanel( "hh:mm:ss", 0, 0, topMainLayout->getWidth() / 2, unitSizeY, topMainLayout, false );
	this->time->setImage( IMAGE_TIME24 );

	this->altitude = new InfoPanel( "m", 0, 0, topMainLayout->getWidth() / 2, unitSizeY, topMainLayout, false );
	this->altitude->setImage( IMAGE_ALTITUDE24 );

	this->status = new InfoPanel( "Status", 0, 0, topMainLayout->getWidth() / 2, unitSizeY, topMainLayout, false );
	this->status->setImage( IMAGE_STATUS24 );

	this->clock = new InfoPanel( "hh:mm", 0, 0, mainLayout->getWidth(), mainLayout->getHeight() - 4 * unitSizeY - 48, mainLayout, false );
	this->clock->setImage( IMAGE_CLOCK24 );

	// Add the menu-bar at the bottom
	this->menuBar = new MenuBar( 0, 0, mainLayout->getWidth(), 48, mainLayout );
	this->menuBar->setLeftButton( IMAGE_DELETE48 );
	this->menuBar->setMiddleButton( IMAGE_APP48 );
	this->menuBar->setRightButton( IMAGE_PLAY48 );
	this->menuBar->addMenuBarListener( this );
	/*this->menuBar->addRBWidgetListener(LocationHandler::Self());
	this->menuBar->addRBWidgetListener(this);*/

	this->trackingMenuBar = new MenuBar( 0, 0, mainLayout->getWidth(), 48, mainLayout );
	this->trackingMenuBar->setLeftButton( IMAGE_STOP48 );
	this->trackingMenuBar->addMenuBarListener( this );
	this->trackingMenuBar->hide();
//	this->trackingMenuBar;

	// Add ourself as location listener
	LocationHandler::Self()->addLocationListener( this );

	// Create clock timer & call it once
	MainScreenClock::Self();
	this->clock->setValue( MainScreenClock::Self()->formattedClock() );
}

MainScreen::~MainScreen() {
	delete mainLayout;
}

void MainScreen::locationReceived(MALocation *location) {
	char statusText[30];
	sprintf( statusText, "%.2f %.2f %.2f", location->lon, location->lat, location->alt );
	this->status->setValue( statusText );

	TrackHandler::Self()->addGPSData( location->lon, location->lat, location->alt );

	//this->status->setValue( "1" );
	this->speed->setValue( LocationHandler::Self()->getSpeed() * 3.6 );
	this->distance->setValue( LocationHandler::Self()->getTotalDistance() / 1000.0 );
	this->altitude->setValue( LocationHandler::Self()->getTotalAltitudeDiff() );
}

//void MainScreen::pointerPressEvent(MAPoint2d point) {
//	Point myPoint(point.x, point.y);
//
//	if( this->menuBar->contains(myPoint) ) {
//		this->menuBar->triggerMenu(myPoint);
//	}
//
//	this->menuBar->pointerPressEvent(point);
//	this->trackingMenuBar->pointerPressEvent(point);
//
//	this->status->setValue( point.y );
//}

void MainScreen::runTimerEvent() {
	char timeString[10];

	tm *tmStruct = new tm();

	split_time( maLocalTime() - this->startTime, tmStruct );

//	sprintf( timeString, "%02d:%02d:%02d", tmStruct->tm_hour, tmStruct->tm_min, tmStruct->tm_sec );
	sprintf( timeString, "%02d:%02d", tmStruct->tm_min, tmStruct->tm_sec );
	this->time->setValue( timeString );

	delete tmStruct;
}

void MainScreen::triggered( Widget *widget ) {

}

void MainScreen::leftButtonTriggered() {
	if( !this->menuBar->isHidden() ) {
		GOFGSCMoblet::Self()->close();
	}
	else {
		GOFGSCMoblet::getEnvironment().removeTimer( this );
		LocationHandler::Self()->triggered( NULL );

		TrackHandler::Self()->stopTracking();

		this->trackingMenuBar->hide();
		this->menuBar->show();

		//this->trackingMenuBar->setHeight( 0 );
		//this->menuBar->setHeight( 48 );
	}
}

void MainScreen::middleButtonTriggered() {
	TrackScreen::Self()->show();
	TrackScreen::Self()->refreshTrackList();
	this->hide();
}

void MainScreen::rightButtonTriggered() {
	if( !this->menuBar->isHidden() ) {
		TrackHandler::Self()->startTracking();

		this->startTime = maLocalTime();

		LocationHandler::Self()->triggered( NULL );
		GOFGSCMoblet::getEnvironment().addTimer( this, 1000, 0 );

		this->menuBar->hide();
		this->trackingMenuBar->show();
	}

	//this->menuBar->setHeight( 0 );
	//this->trackingMenuBar->setHeight( 48 );
}

void MainScreen::setClock( char *timeString ) {
	this->clock->setValue( timeString );
}
