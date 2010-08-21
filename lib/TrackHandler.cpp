/*
 * TrackHandler.cpp
 *
 *  Created on: 21.08.2010
 *      Author: wkoller
 */

#include "TrackHandler.h"

template<>
TrackHandler *ISingleton<TrackHandler>::mySelf = NULL;

void TrackHandler::startTracking() {
	this->trackHandle = maFileOpen( "test.gsc", MA_ACCESS_READ_WRITE );
	if( maFileExists( this->trackHandle ) == 0 ) {
		maFileCreate( this->trackHandle );
	}
}

void TrackHandler::stopTracking() {
	maFileClose( this->trackHandle );
}

void TrackHandler::addGPSData( double lon, double lat, double alt ) {
	char dataBuf[10];

	// Check flags & write time-data if necessary
	this->checkData( 2 );

	// Write GPS Data
	maFileWrite( this->trackHandle, "02;", 3 );
	// Convert & write lon data
	sprintf( dataBuf, "%.4f;", lon );
	maFileWrite( this->trackHandle, dataBuf, strlen(dataBuf) );
	// Convert & write lat data
	sprintf( dataBuf, "%.4f;", lat );
	maFileWrite( this->trackHandle, dataBuf, strlen(dataBuf) );
	// Convert & write alt data
	sprintf( dataBuf, "%.4f", alt );
	maFileWrite( this->trackHandle, dataBuf, strlen(dataBuf) );
	// Terminate line
	maFileWrite( this->trackHandle, "\n", 1 );
}

void TrackHandler::addDistanceData( double distance ) {
	char dataBuf[10];

	// Check flags & write time-data if necessary
	this->checkData( 4 );

	// Write distance data
	maFileWrite( this->trackHandle, "04;", 3 );
	// Convert & write distance
	sprintf( dataBuf, "%.2f;", distance );
	maFileWrite( this->trackHandle, dataBuf, strlen(dataBuf) );
	// Terminate line
	maFileWrite( this->trackHandle, "\n", 1 );
}

TrackHandler::TrackHandler() {
	// By default all flags are set to true (the first datapoint must create a time entry)
	this->dataFlags.gps = true;
	this->dataFlags.distance = true;
}

void TrackHandler::checkData( int type ) {
	switch( type ) {
	case 2:
		if( this->dataFlags.gps ) {
			this->addTimeData();
			this->dataFlags.reset();
		}
		break;
	case 4:
		if( this->dataFlags.distance ) {
			this->addTimeData();
			this->dataFlags.reset();
		}
	}
}

void TrackHandler::addTimeData() {
	char dataBuf[10];

	sprintf( dataBuf, "%d", maLocalTime() );

	// Write time data
	maFileWrite( this->trackHandle, "01;", 3 );
	// Write timestamp
	maFileWrite( this->trackHandle, dataBuf, strlen(dataBuf) );
	// Terminate line
	maFileWrite( this->trackHandle, "\n", 1 );
}
