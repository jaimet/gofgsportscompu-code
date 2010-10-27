#ifndef MAINSCREEN
#define MAINSCREEN

#include "Screen.h"
#include "../lib/Singleton.h"
#include "../lib/GPSHandler.h"
#include "../lib/TrackHandler.h"

#include "../uiLib/InfoPanel.h"

#include "MenuScreen.h"

class MainScreen : public Screen, public Singleton<MainScreen> {
	friend class Singleton<MainScreen>;
public:
	void MA_StartButtonClick(CIwUIElement*);
	void MA_StopButtonClick(CIwUIElement*);
	void MA_ExitButtonClick(CIwUIElement*);
	void MA_MenuButtonClick(CIwUIElement*);

	static int clockTimer( void *systemData, void *userData );
	static int mainTimer( void *systemData, void *userData );

protected:
	MainScreen();

	CIwUIButton* ExitButton;
	CIwUIButton* StartButton;
	CIwUIButton* StopButton;

	InfoPanel *speedInfo;
	InfoPanel *distanceInfo;
	InfoPanel *altitudeInfo;
	InfoPanel *timeInfo;
	InfoPanel *clockInfo;

	bool bStopPending;
	double totalDistance;
	time_t startTime;
};

#endif
