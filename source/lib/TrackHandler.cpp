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
		return true;
	}

	return false;
}

void TrackHandler::stopTracking() {
	if( this->fileHandler != NULL ) {
		s3eFileClose( this->fileHandler );
		this->fileHandler = NULL;

		// Reset track handler
		this->dataFlags->Reset();
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