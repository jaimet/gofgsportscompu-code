/*
 * LocationHandler.h
 *
 *  Created on: 15.08.2010
 *      Author: wkoller
 */

#ifndef LOCATIONHANDLER_H_
#define LOCATIONHANDLER_H_

#include <maapi.h>

#include <MAUI/Widget.h>

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

class LocationHandler : public ISingleton<LocationHandler>, public WidgetListener {
	friend class ISingleton<LocationHandler>;
public:
	void newLocation( MALocation *location );

	void addLocationListener( ILocationListener *listener );
	void removeLocationListener( ILocationListener *listener );

	virtual void triggered( Widget *widget );

protected:
	LocationHandler();

private:
	double latLongToRad( double latLong );
	double haversineDistance( MALocation *start, MALocation *end );

	MALocation *currLocationRad;
	Vector<ILocationListener*> listeners;

	float speed;
	float distance;
	float totalDistance;

	bool bEnabled;
};

#endif /* LOCATIONHANDLER_H_ */
