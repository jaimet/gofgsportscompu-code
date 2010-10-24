#ifndef MENUSCREEN
#define MENUSCREEN

#include "Screen.h"
#include "../lib/Singleton.h"

class MenuScreen : public Screen, public Singleton<MenuScreen> {
	friend class Singleton<MenuScreen>;
};

#endif
