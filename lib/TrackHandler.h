/*
 * TrackHandler.h
 *
 *  Created on: 21.08.2010
 *      Author: wkoller
 */

#ifndef TRACKHANDLER_H_
#define TRACKHANDLER_H_

#include <maapi.h>
#include <IX_FILE.h>
//#include <mastring.h>
#include <mavsprintf.h>

#include "ISingleton.h"

struct DataFlags {
	bool gps;
	bool distance;

	DataFlags() {
		this->reset();
	}

	void reset() {
		this->gps = false;
		this->distance = false;
	}
};

class TrackHandler : public ISingleton<TrackHandler> {
	friend class ISingleton<TrackHandler>;

public:
	void startTracking();
	void stopTracking();

	void addGPSData( double lon, double lat, double alt );
	void addDistanceData( double distance );

protected:
	TrackHandler();

private:
	void checkData( int type );

	void addTimeData();

	DataFlags dataFlags;
	MAHandle trackHandle;
};

#endif /* TRACKHANDLER_H_ */
