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

#include "../lib/LocationHandler.h"
#include "../lib/TrackHandler.h"
#include "../widgetLib/InfoPanel.h"
#include "../widgetLib/MenuBar.h"

using namespace MAUI;

class MainScreen : public Screen, ILocationListener, TimerListener, IMenuBarListener {
public:
	MainScreen();
	~MainScreen();

	virtual void locationReceived(MALocation *location);
	virtual void runTimerEvent();
	virtual void triggered( Widget *widget );

	virtual void leftButtonTriggered();
	virtual void rightButtonTriggered();

	//virtual void pointerPressEvent(MAPoint2d point);
private:
	Layout *mainLayout;
	MenuBar *menuBar;
	InfoPanel *status;
	InfoPanel *time;

	int startTime;
};

#endif /* MAINSCREEN_H_ */
