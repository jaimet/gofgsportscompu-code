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
	char fileName[17];

	tm *tmStruct = new tm();
	split_time( maLocalTime(), tmStruct );

	sprintf( fileName, "%04d%02d%02d-%02d%02d.gsc", tmStruct->tm_year + 1900, tmStruct->tm_mon + 1, tmStruct->tm_mday, tmStruct->tm_hour, tmStruct->tm_min );

	this->trackHandle = maFileOpen( fileName, MA_ACCESS_READ_WRITE );
	if( maFileExists( this->trackHandle ) <= 0 ) {
		maFileCreate( this->trackHandle );
	}
}

void TrackHandler::stopTracking() {
	if( this->trackHandle > 0 ) {
		maFileClose( this->trackHandle );
		this->trackHandle = 0;
	}
}

void TrackHandler::addGPSData( double lon, double lat, double alt ) {
	char dataBuf[10];

	if( this->trackHandle <= 0 ) return;

	// Check flags & write time-data if necessary
	this->checkData( 2 );

	// Write GPS Data
	maFileWrite( this->trackHandle, "02;", 3 );
	// Convert & write lon data
	sprintf( dataBuf, "%.4f:", lon );
	maFileWrite( this->trackHandle, dataBuf, strlen(dataBuf) );
	// Convert & write lat data
	sprintf( dataBuf, "%.4f:", lat );
	maFileWrite( this->trackHandle, dataBuf, strlen(dataBuf) );
	// Convert & write alt data
	sprintf( dataBuf, "%.4f", alt );
	maFileWrite( this->trackHandle, dataBuf, strlen(dataBuf) );
	// Terminate line
	maFileWrite( this->trackHandle, "\n", 1 );
}

void TrackHandler::addDistanceData( double distance ) {
	char dataBuf[10];

	if( this->trackHandle <= 0 ) return;

	// Check flags & write time-data if necessary
	this->checkData( 4 );

	// Write distance data
	maFileWrite( this->trackHandle, "04;", 3 );
	// Convert & write distance
	sprintf( dataBuf, "%.2f", distance );
	maFileWrite( this->trackHandle, dataBuf, strlen(dataBuf) );
	// Terminate line
	maFileWrite( this->trackHandle, "\n", 1 );
}

TrackHandler::TrackHandler() {
	// By default all flags are set to true (the first datapoint must create a time entry)
	this->dataFlags.gps = true;
	this->dataFlags.distance = true;

	this->trackHandle = 0;
}

void TrackHandler::checkData( int type ) {
	switch( type ) {
	case 2:
		if( this->dataFlags.gps ) {
			this->addTimeData();
			this->dataFlags.reset();
		}
		this->dataFlags.gps = true;
		break;
	case 4:
		if( this->dataFlags.distance ) {
			this->addTimeData();
			this->dataFlags.reset();
		}
		this->dataFlags.distance = true;
	}
}

void TrackHandler::addTimeData() {
	char dataBuf[10];

	if( this->trackHandle <= 0 ) return;

	sprintf( dataBuf, "%d", maLocalTime() );

	// Write time data
	maFileWrite( this->trackHandle, "01;", 3 );
	// Write timestamp
	maFileWrite( this->trackHandle, dataBuf, strlen(dataBuf) );
	// Terminate line
	maFileWrite( this->trackHandle, "\n", 1 );
}
