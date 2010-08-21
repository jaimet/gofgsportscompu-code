/*
 * MainScreen.cpp
 *
 *  Created on: 10.08.2010
 *      Author: wkoller
 */

#include "MainScreen.h"

#include "../GOFGSCMoblet.h"

MainScreen::MainScreen() {
	this->startTime = 0;

	mainLayout = new Layout( 0, 0, GOFGSCMoblet::Self()->getScreenWidth(), GOFGSCMoblet::Self()->getScreenHeight(), NULL, 1, 3 );
	setMain( mainLayout );

	int unitSizeY = ( mainLayout->getHeight() - 10 - 48 ) / 5;

	Layout *topMainLayout = new Layout( 0, 0, mainLayout->getWidth(), unitSizeY * 4, mainLayout, 2, 3 );

	InfoPanel *heartRate = new InfoPanel( "bpm", 0, 0, topMainLayout->getWidth() / 2, unitSizeY * 2, topMainLayout, true );
	heartRate->setImage( IMAGE_HR24 );

	InfoPanel *speed = new InfoPanel( "km/h", 0, 0, topMainLayout->getWidth() / 2, unitSizeY * 2, topMainLayout, true );
	speed->setImage( IMAGE_SPEED24 );

	InfoPanel *distance = new InfoPanel( "km", 0, 0, topMainLayout->getWidth() / 2, unitSizeY, topMainLayout, false );
	distance->setImage( IMAGE_DISTANCE24 );

	this->time = new InfoPanel( "hh:mm:ss", 0, 0, topMainLayout->getWidth() / 2, unitSizeY, topMainLayout, false );
	this->time->setImage( IMAGE_TIME24 );

	InfoPanel *altitude = new InfoPanel( "m", 0, 0, topMainLayout->getWidth() / 2, unitSizeY, topMainLayout, false );
	altitude->setImage( IMAGE_ALTITUDE24 );

	this->status = new InfoPanel( "Status", 0, 0, topMainLayout->getWidth() / 2, unitSizeY, topMainLayout, false );
	this->status->setImage( IMAGE_STATUS24 );

	InfoPanel *clock = new InfoPanel( "hh:mm", 0, 0, mainLayout->getWidth(), unitSizeY, mainLayout, false );
	clock->setImage( IMAGE_CLOCK24 );

	int currTime = maLocalTime();
	tm *tmStruct = new tm();
	split_time( currTime, tmStruct );

	char *timeString = new char[10];
	sprintf( timeString, "%02d:%02d", tmStruct->tm_hour, tmStruct->tm_min );

	clock->setValue( timeString );

	// Add the menu-bar at the bottom
	this->menuBar = new MenuBar( 0, 0, mainLayout->getWidth(), 48, mainLayout );
	this->menuBar->setRightButton( IMAGE_PLAY48 );
	this->menuBar->setLeftButton( IMAGE_DELETE48 );
	this->menuBar->addMenuBarListener(this);
	/*this->menuBar->addRBWidgetListener(LocationHandler::Self());
	this->menuBar->addRBWidgetListener(this);*/

	// Add ourself as location listener
	LocationHandler::Self()->addLocationListener(this);
}

MainScreen::~MainScreen() {
	delete mainLayout;
}

void MainScreen::locationReceived(MALocation *location) {
	this->status->setValue( "1" );

	TrackHandler::Self()->addGPSData( location->lon, location->lat, location->alt );
}

/*void MainScreen::pointerPressEvent(MAPoint2d point) {
	Point myPoint(point.x, point.y);

	if( this->menuBar->contains(myPoint) ) {
		this->menuBar->triggerMenu(myPoint);
	}
}*/

void MainScreen::runTimerEvent() {
	this->time->setValue( maLocalTime() - this->startTime );
}

void MainScreen::triggered( Widget *widget ) {

}

void MainScreen::leftButtonTriggered() {
	TrackHandler::Self()->stopTracking();

	GOFGSCMoblet::Self()->close();
}

void MainScreen::rightButtonTriggered() {
	TrackHandler::Self()->startTracking();

	this->startTime = maLocalTime();

	LocationHandler::Self()->triggered( NULL );
	GOFGSCMoblet::getEnvironment().addTimer( this, 1000, 0 );
}

