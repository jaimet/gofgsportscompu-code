#ifndef MENUSCREEN
#define MENUSCREEN

#include "Screen.h"
#include "../lib/Singleton.h"

#include "ExportScreen.h"

class MenuScreen : public Screen, public Singleton<MenuScreen> {
	friend class Singleton<MenuScreen>;
public:
	void MS_TracksButtonClick(CIwUIElement*);
	void MS_CloseButtonClick(CIwUIElement*);
protected:
	MenuScreen();

	//CIwUIElement *tracksButton;
};

#endif
