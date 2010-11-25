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

#ifndef TRACKREADER_C
#define TRACKREADER_C

#define BUFFER_SIZE 64

#include "s3eFile.h"

#include <string.h>
#include <stdlib.h>
#include <time.h>

#include <string>

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


class TrackReader {
protected:
	TrackReader();

	DataPoint *ReadNextPoint();
	bool SetFile( char *p_fileName );
	void CloseFile();
	int GetFileSize();
	int GetBytesRead();
	int GetStartTime();
	std::string GetUUID();

	void Reset();

private:
	DataPoint *dataPoint;
	s3eFile *inFile;
	int bytesRead;
	int next_unixtime;
	int startTime;

	std::string trackUUID;
};

#endif
