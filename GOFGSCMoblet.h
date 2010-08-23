/*
 * GOFGSCMoblet.h
 *
 *  Created on: 10.08.2010
 *      Author: wkoller
 */

#ifndef GOFGSCMOBLET_H_
#define GOFGSCMOBLET_H_

#include <MAUtil/Moblet.h>

#include "screens/MainScreen.h"
#include "screens/BluetoothScreen.h"
#include "lib/LocationHandler.h"

using namespace MAUtil;

class GOFGSCMoblet : public Moblet {
public:
	static GOFGSCMoblet *Self();

	virtual void customEvent( const MAEvent& event );

	int getScreenWidth();
	int getScreenHeight();

	~GOFGSCMoblet();

private:
	GOFGSCMoblet();
	void initGOFGSC();

	static GOFGSCMoblet *mySelf;

	MainScreen *screen;
	BluetoothScreen *bluetoothScreen;
	int screenWidth;
	int screenHeight;
};

#endif /* GOFGSCMOBLET_H_ */
