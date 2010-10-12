#ifndef TRACKEXPORTHANDLER
#define TRACKEXPORTHANDLER

#define BUFFER_SIZE 64

#include "tinyxml.h"
#include "s3eFile.h"

#include <string.h>

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

class TrackExportHandler {
public:
	static TrackExportHandler *Self();

	void exportToTCX( char *fileName );
	void exportToFitlog( char *fileName, char *fitlogName );

private:
	TiXmlElement *createFitlogPoint();

	TrackExportHandler();

	DataPoint dataPoint;

	static TrackExportHandler *mySelf;
};

#endif
