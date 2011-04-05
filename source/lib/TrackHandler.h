/*
* Copyright (C) 2010-2011 Wolfgang Koller
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

#ifndef TRACKHANDLER
#define TRACKHANDLER

#include "Singleton.h"

#include "IwRandom.h"

#include "time.h"

#include <string>
#include <fstream>
#include <iomanip>

struct DataFlags {
	bool bGPS;
	bool bDistance;
	bool bHR;

	DataFlags() {
		this->Reset();
	}

	void Reset( bool bValue = false ) {
		this->bGPS = bValue;
		this->bDistance = bValue;
		this->bHR = bValue;
	}
};

class TrackHandler : public Singleton<TrackHandler> {
	friend class Singleton<TrackHandler>;
public:
	bool startTracking( std::string fileName );
	void stopTracking();

	void addGPSData( double lon, double lat, double alt );
	void addDistanceData( double distance );
	void addHRData( int bpm );

private:
	TrackHandler();

	void addTimeData();
	void checkData( int type );

	DataFlags *dataFlags;
	std::ofstream trackFile;
};

#endif
