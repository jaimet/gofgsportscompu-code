/*
 * MainScreenClock.cpp
 *
 *  Created on: 27.08.2010
 *      Author: wkoller
 */

#include "MainScreenClock.h"

#include "MainScreen.h"
#include "../GOFGSCMoblet.h"

template<>
MainScreenClock *ISingleton<MainScreenClock>::mySelf = NULL;

void MainScreenClock::runTimerEvent() {
	MainScreen::Self()->setClock( this->formattedClock() );
}

char *MainScreenClock::formattedClock() {
	int currTime = maLocalTime();
	split_time( currTime, this->tmStruct );

	sprintf( this->timeString, "%02d:%02d", this->tmStruct->tm_hour, this->tmStruct->tm_min );

	return this->timeString;
}

MainScreenClock::MainScreenClock() {
	this->tmStruct = new tm();

	GOFGSCMoblet::getEnvironment().addTimer( this, 60000, 0 );
}
