/*
 * BluetoothScreen.cpp
 *
 *  Created on: 23.08.2010
 *      Author: wkoller
 */

#include "BluetoothScreen.h"

#include "../GOFGSCMoblet.h"

BluetoothScreen::BluetoothScreen() {
	this->deviceList = new Label( 0, 0, GOFGSCMoblet::Self()->getScreenWidth(), GOFGSCMoblet::Self()->getScreenHeight(), NULL, "", 0xFFFFFF, new Font(FONT_VERA18) );
	this->deviceList->setDrawBackground(true);
	this->deviceList->setBackgroundColor( 0xFFFFFF );

	this->setMain(this->deviceList);

	this->bluetoothDiscoverer = new BluetoothDiscoverer();

	int returnVal = this->bluetoothDiscoverer->startDeviceDiscovery( this, true );

	;
}

void BluetoothScreen::btNewDevice( const BtDevice &dev ) {
	this->deviceList->setCaption( dev.name );
}

void BluetoothScreen::btDeviceDiscoveryFinished( int state ) {
	this->deviceList->setCaption( "Finished" );
}
