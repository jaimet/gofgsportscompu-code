/*
 * MainScreen.h
 *
 *  Created on: 10.08.2010
 *      Author: wkoller
 */
#ifndef MAINSCREEN_H_
#define MAINSCREEN_H_

#include <MAUI/Screen.h>
#include <MAUI/Label.h>
#include <MAUI/Layout.h>

#include <matime.h>

#include "../lib/ISingleton.h"

#include "../lib/LocationHandler.h"
#include "../lib/TrackHandler.h"
#include "../widgetLib/InfoPanel.h"
#include "../widgetLib/MenuBar.h"

#include "MainScreenClock.h"
#include "TrackScreen.h"

using namespace MAUI;

class MainScreen : public ISingleton<MainScreen>, public Screen, ILocationListener, TimerListener, IMenuBarListener {
	friend class ISingleton<MainScreen>;
public:
	void locationReceived(MALocation *location);
	void runTimerEvent();
	void triggered( Widget *widget );

	void leftButtonTriggered();
	void middleButtonTriggered();
	void rightButtonTriggered();

//	void pointerPressEvent(MAPoint2d point);

	void setClock( char *timeString );
protected:
	MainScreen();
	~MainScreen();

private:
	Layout *mainLayout;
	MenuBar *menuBar;
	MenuBar *trackingMenuBar;

	InfoPanel *status;
	InfoPanel *time;
	InfoPanel *speed;
	InfoPanel *distance;
	InfoPanel *altitude;
	InfoPanel *clock;

	int startTime;
};

#endif /* MAINSCREEN_H_ */
