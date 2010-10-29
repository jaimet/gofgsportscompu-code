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

#ifndef TRACKEXPORTHANDLER
#define TRACKEXPORTHANDLER

#define BUFFER_SIZE 64

#include "tinyxml.h"
#include "s3eFile.h"
#include "IwGeomCore.h"

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

	void SetProgressCallback( s3eCallback p_progressCallback );
private:
	TiXmlElement *createFitlogPoint();
	TiXmlElement *createTCXPoint( int startTime );

	void announceProgress( int percent, char *message = NULL );

	TrackExportHandler();

	DataPoint dataPoint;
	s3eCallback progressCallback;
};

#endif
