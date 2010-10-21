#ifndef TRACKEXPORTHANDLER
#define TRACKEXPORTHANDLER

#define BUFFER_SIZE 64

#include "tinyxml.h"
#include "s3eFile.h"

#include <string.h>
#include <time.h>

#include "../lib/Singleton.h"

// Simple helper struct for managing the data-point for an export
struct DataPoint {
	DataPoint() {
		this->reset();
	}

	void reset() {
		this->lon = 0.0;
		this->lat = 0.0;
		this->alt = 0.0;
		this->dist = 0.0;
		this->speed = 0.0;
		this->hr = 0;
		this->unixtime = 0;
	}

	double lon;		// Longitude
	double lat;		// Latitude
	double alt;		// Altitude
	double dist;	// Distance
	double speed;	// Current speed
	int hr;			// Heart rate
	int unixtime;	// Unix Timestamp
};

class TrackExportHandler : public Singleton<TrackExportHandler> {
	friend class Singleton<TrackExportHandler>;
public:
	void exportToTCX( char *fileName, char *tcxName );
	void exportToFitlog( char *fileName, char *fitlogName );

private:
	TiXmlElement *createFitlogPoint();
	TiXmlElement *createTCXPoint( int startTime );

	TrackExportHandler();

	DataPoint dataPoint;
};

#endif
