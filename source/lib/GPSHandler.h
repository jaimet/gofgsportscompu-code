#ifndef GPSHANDLER
#define GPSHANDLER

#define AVERAGE_LENGTH 3

#include "s3eLocation.h"
#include "s3eTimer.h"

#include <math.h>

class GPSHandler {
public:
	static GPSHandler *Self();

	bool updateLocation();

	double getAltitude();		// Get the current altitude (in m)
	double getLatitude();		// Get the current latitude (in rad)
	double getLongitude();		// Get the current longitude (in rad)

	double getSpeed();			// Get the current speed (in m/s)
	double getDistance();		// Get the current distance (in m)

	void startGPS();
	void stopGPS();

private:
	GPSHandler();

	void reset();	// Reset the GPS Handler, automatically called on startGPS()

	double degreeToRad( double degree );
	double haversineDistance( s3eLocation *start, s3eLocation *end );

	static GPSHandler *mySelf;

	s3eLocation *currLocation;
	bool bGPSActive;
	double distance;	// Last distance in meters
	double speed;		// Speed in meters / second (average of last 3 points)
	double altitude;	// Current altitude in meters
	double currSpeed;	// Current speed in meters / second
	int64 lastTime;

	double distanceHistory[AVERAGE_LENGTH];
	double timeHistory[AVERAGE_LENGTH];
	int historyCount;
};

#endif
