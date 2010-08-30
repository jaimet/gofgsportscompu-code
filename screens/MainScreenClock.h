/*
 * MainScreenClock.h
 *
 *  Created on: 27.08.2010
 *      Author: wkoller
 */

#ifndef MAINSCREENCLOCK_H_
#define MAINSCREENCLOCK_H_

#include <MAUtil/Environment.h>

#include "MainScreen.h"

class MainScreenClock : public ISingleton<MainScreenClock>, TimerListener {
	friend class ISingleton<MainScreenClock>;
public:
	void runTimerEvent();

	char *formattedClock();

protected:
	MainScreenClock();

private:
	tm *tmStruct;
	char timeString[10];
};


#endif /* MAINSCREENCLOCK_H_ */
