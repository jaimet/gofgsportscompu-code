/*
 * BluetoothScreen.h
 *
 *  Created on: 23.08.2010
 *      Author: wkoller
 */

#ifndef BLUETOOTHSCREEN_H_
#define BLUETOOTHSCREEN_H_

#include <MAUI/Screen.h>
#include <MAUI/Label.h>

#include <MAUtil/BluetoothDiscovery.h>

#include "MAHeaders.h"

using namespace MAUI;

class BluetoothScreen : public Screen, public BluetoothDeviceDiscoveryListener {
public:
	BluetoothScreen();

	virtual void btNewDevice( const BtDevice &dev );
	virtual void btDeviceDiscoveryFinished( int state );

private:
	BluetoothDiscoverer* bluetoothDiscoverer;

	Label *deviceList;
};


#endif /* BLUETOOTHSCREEN_H_ */
