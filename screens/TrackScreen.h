/*
 * TrackScreen.h
 *
 *  Created on: 02.09.2010
 *      Author: wkoller
 */

#ifndef TRACKSCREEN_H_
#define TRACKSCREEN_H_

#include <MAUI/Screen.h>
#include <MAUI/Layout.h>
#include <MAUI/Label.h>
#include <MAUI/ListBox.h>

//#include <MAUtil/FileLister.h>
#include <MAUtil/String.h>

#include "../screens/MainScreen.h"
#include "../lib/ISingleton.h"
#include "../widgetLib/MenuBar.h"

using namespace MAUI;

class TrackScreen : public ISingleton<TrackScreen>, public Screen, IMenuBarListener {
	friend class ISingleton<TrackScreen>;
public:
	void refreshTrackList();

	void leftButtonTriggered();

protected:
	TrackScreen();

private:
	Layout *mainLayout;
	ListBox *trackList;

//	FileLister *fileLister;

	MenuBar *menuBar;
};

#endif /* TRACKSCREEN_H_ */
