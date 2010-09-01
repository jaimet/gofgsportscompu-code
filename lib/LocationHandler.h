/*
 * LocationHandler.h
 *
 *  Created on: 15.08.2010
 *      Author: wkoller
 */

#ifndef LOCATIONHANDLER_H_
#define LOCATIONHANDLER_H_

#include <maapi.h>
#include <madmath.h>

#include <MAUI/Widget.h>

#include <MAUtil/Environment.h>
#include <MAUtil/Vector.h>

#include <MAP/LonLat.h>

#include "../lib/ISingleton.h"

using namespace MAUI;

/**
 * Taken from the "Determining Location" tutorial at mosync.com
 * ( http://www.mosync.com/documentation/tutorials/determining-location )
 */
class ILocationListener {
  public:
    virtual void locationReceived(MALocation *location) = 0;
};

class LocationHandler : public ISingleton<LocationHandler>, public WidgetListener, public TimerListener {
	friend class ISingleton<LocationHandler>;
public:
	void newLocation( MALocation *location );

	float getSpeed();
	float getTotalDistance();
	float getAltitudeDiff();
	float getTotalAltitudeDiff();

	void addLocationListener( ILocationListener *listener );
	void removeLocationListener( ILocationListener *listener );

	virtual void triggered( Widget *widget );

	void runTimerEvent();

protected:
	LocationHandler();

private:
	double latLongToRad( double latLong );
	double degreeToRad( double degree );
	double haversineDistance( MALocation *start, MALocation *end );

	MALocation *currLocationRad;
	Vector<ILocationListener*> listeners;

	float speed;
	float distance;
	float totalDistance;

	float altitudeDiff;
	float totalAltitudeDiff;

	int sampleTime;

	bool bEnabled;
};

#endif /* LOCATIONHANDLER_H_ */
