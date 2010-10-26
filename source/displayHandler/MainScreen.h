#ifndef MAINSCREEN
#define MAINSCREEN

#include "Screen.h"
#include "../lib/Singleton.h"

#include "MenuScreen.h"

class MainScreen : public Screen, public Singleton<MainScreen> {
	friend class Singleton<MainScreen>;
public:
	void StartButtonClick(CIwUIElement*);
	void StopButtonClick(CIwUIElement*);
	void ExitButtonClick(CIwUIElement*);
	void MenuButtonClick(CIwUIElement*);

protected:
	MainScreen();

	//CIwUIElement *tracksButton;
};

#endif
