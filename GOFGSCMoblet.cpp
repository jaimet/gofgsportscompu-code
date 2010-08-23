/*
 * GOFGSCMoblet.cpp
 *
 *  Created on: 10.08.2010
 *      Author: wkoller
 */

#include "GOFGSCMoblet.h"

GOFGSCMoblet *GOFGSCMoblet::mySelf = NULL;

GOFGSCMoblet *GOFGSCMoblet::Self() {
	if (GOFGSCMoblet::mySelf == NULL) {
		GOFGSCMoblet::mySelf = new GOFGSCMoblet();
		GOFGSCMoblet::mySelf->initGOFGSC();
	}

	return GOFGSCMoblet::mySelf;
}

void GOFGSCMoblet::customEvent( const MAEvent& event ) {
	if( event.type == EVENT_TYPE_LOCATION ) {
		MALocation *loc = (MALocation *) event.data;
		//MALocation loc = *(MALocation *) event.data;

		LocationHandler::Self()->newLocation(loc);
	}
}

int GOFGSCMoblet::getScreenWidth() {
	return this->screenWidth;
}

int GOFGSCMoblet::getScreenHeight() {
	return this->screenHeight;
}

GOFGSCMoblet::~GOFGSCMoblet() {
	delete screen;
}

GOFGSCMoblet::GOFGSCMoblet() {
	MAExtent screenSize = maGetScrSize();
	this->screenWidth = EXTENT_X(screenSize);
	this->screenHeight = EXTENT_Y(screenSize);
}

void GOFGSCMoblet::initGOFGSC() {
	// initialize
	screen = new MainScreen();
	//screen->show();

	this->bluetoothScreen = new BluetoothScreen();
	this->bluetoothScreen->show();
}
