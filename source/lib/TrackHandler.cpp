/*
* Copyright (C) 2010 Wolfgang Koller
* 
* This file is part of GOFG Sports Computer.
* 
* GOFG Sports Computer is free software: you can redistribute it and/or modify
* it under the terms of the GNU General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
* 
* GOFG Sports Computer is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU General Public License for more details.
* 
* You should have received a copy of the GNU General Public License
* along with GOFG Sports Computer.  If not, see <http://www.gnu.org/licenses/>.
*/

#include "TrackHandler.h"

TrackHandler *TrackHandler::mySelf = NULL;

TrackHandler *TrackHandler::Self() {
	if( TrackHandler::mySelf == NULL ) {
		TrackHandler::mySelf = new TrackHandler();
	}

	return TrackHandler::mySelf;
}

bool TrackHandler::startTracking( char *fileName ) {
	this->fileHandler = s3eFileOpen( fileName, "w" );

	if( this->fileHandler != NULL ) {
		// Reset track handler
		this->dataFlags->Reset();

		return true;
	}

	return false;
}

void TrackHandler::stopTracking() {
	if( this->fileHandler != NULL ) {
		s3eFileClose( this->fileHandler );
		this->fileHandler = NULL;
	}
}

void TrackHandler::addGPSData( double lon, double lat, double alt ) {
	// Check for new data point first
	this->checkData( 2 );

	// Add a new data entry with code 02 (GPS data)
	s3eFileWrite( "02;", 3, 1, this->fileHandler );

	// Format & write position info
	char myBuf[15];
	sprintf( myBuf, "%.9f:", lon );
	s3eFileWrite( myBuf, strlen( myBuf ), 1, this->fileHandler );

	sprintf( myBuf, "%.9f:", lat );
	s3eFileWrite( myBuf, strlen( myBuf ), 1, this->fileHandler );

	sprintf( myBuf, "%.2f\n", alt );
	s3eFileWrite( myBuf, strlen( myBuf ), 1, this->fileHandler );
}

void TrackHandler::addDistanceData( double distance ) {
	// Check for new data point first
	this->checkData( 4 );

	// Format distance & write to file
	char myBuf[15];
	sprintf( myBuf, "04;%.2f\n", distance );
	s3eFileWrite( myBuf, strlen( myBuf ), 1, this->fileHandler );
}

TrackHandler::TrackHandler() {
	this->fileHandler = NULL;
	this->dataFlags = new DataFlags();
	this->dataFlags->Reset( true );
}

void TrackHandler::addTimeData() {
	char timeBuf[15];

	// Write current time to file
	sprintf( timeBuf, "01;%d\n", time(NULL) );
	s3eFileWrite( timeBuf, strlen(timeBuf), 1, this->fileHandler );
}

// Called to check if a data information already exists in the current data record
void TrackHandler::checkData( int type ) {
	switch( type ) {
		case 2:
			if( this->dataFlags->bGPS ) {
				this->addTimeData();
				this->dataFlags->Reset();
			}
			this->dataFlags->bGPS = true;
			break;
		case 4:
			if( this->dataFlags->bDistance ) {
				this->addTimeData();
				this->dataFlags->Reset();
			}
			this->dataFlags->bDistance = true;
			break;
		default:
			break;
	}
}
