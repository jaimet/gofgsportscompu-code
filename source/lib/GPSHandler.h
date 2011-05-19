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

#ifndef GPSHANDLER
#define GPSHANDLER

#define AVERAGE_DURATION 5		// Duration (in seconds) for average calculation
#define EARTH_RADIUS 6371009	// Earth radius in meters

#include "Singleton.h"

#include "s3eLocation.h"
#include "s3eTimer.h"

#include <list>
#include <math.h>

class GPSHandler : public Singleton<GPSHandler> {
	friend class Singleton<GPSHandler>;
public:
	bool updateLocation();

	double getAltitude();		// Get the current altitude (in m)
	double getLatitude();		// Get the current latitude (in rad)
	double getLongitude();		// Get the current longitude (in rad)

	double getSpeed();			// Get the current speed (in m/s)
	double getDistance();		// Get the current distance (in m)

	double getAccuracy();		// Get the current accuracy of the fix (in m)

	double GetBearing();		// Returns the current bearing (in rad)

	void SetMinAccuracy( double p_minAccuracy );	// Set the minimum accuracy a fix must have to be used by the GPSHandler

	void startGPS( bool p_bReset = true );
	void stopGPS();
	bool IsActive();

protected:
	GPSHandler();

private:
	void reset();	// Reset the GPS Handler, automatically called on startGPS()

	double degreeToRad( double degree );
	double haversineDistance( s3eLocation *start, s3eLocation *end );
	double bearing( s3eLocation *start, s3eLocation *end );

	s3eLocation *currLocation;
	s3eLocation *newLocation;
	s3eLocationCourseData *courseData;
	bool bGPSActive;
	double distance;		// Last distance in meters
	double speed;			// Speed in meters / second (average of last 3 points)
	double altitude;		// Current altitude in meters
	double currSpeed;		// Current speed in meters / second
	double currAccuracy;	// Current accuracy of the position
	double minAccuracy;		// Minimum accuracy for the GPSHandler
	double currBearing;		// Current bearing
	int64 lastTime;

	//double distanceHistory[AVERAGE_DURATION];
	//double timeHistory[AVERAGE_DURATION];
	int historyCount;

	std::list<double> distanceHistory;
	std::list<double> timeDiffHistory;
};

#endif
