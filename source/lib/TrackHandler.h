#ifndef TRACKHANDLER
#define TRACKHANDLER

#include "s3eFile.h"
#include "IwGx.h"

#include "time.h"

struct DataFlags {
	bool bGPS;
	bool bDistance;

	DataFlags() {
		this->Reset();
	}

	void Reset( bool bValue = false ) {
		this->bGPS = bValue;
		this->bDistance = bValue;
	}
};

class TrackHandler {
public:
	static TrackHandler *Self();

	bool startTracking( char *fileName );
	void stopTracking();

	void addGPSData( double lon, double lat, double alt );
	void addDistanceData( double distance );

private:
	TrackHandler();

	void addTimeData();
	void checkData( int type );

	s3eFile *fileHandler;
	DataFlags *dataFlags;

	static TrackHandler *mySelf;
};

#endif
