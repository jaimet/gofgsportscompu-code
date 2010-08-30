/*
 * LocationHandler.cpp
 *
 *  Created on: 17.08.2010
 *      Author: wkoller
 */

#include "LocationHandler.h"

//#include "../GOFGSCMoblet.h"

template<>
LocationHandler *ISingleton<LocationHandler>::mySelf = NULL;

// Called by the Moblet class when a new location event is received
void LocationHandler::newLocation(MALocation *location) {
	// Check if we have a correct location statement
//	if( location->state == MA_LOC_QUALIFIED ) {
	location->lat = this->latLongToRad( location->lat );
	location->lon = this->latLongToRad( location->lon );

	this->distance = this->haversineDistance( this->currLocationRad, location );
	this->totalDistance += this->distance;

	this->altitudeDiff = location->alt - this->currLocationRad->alt;
	if( this->altitudeDiff < 0.0 ) this->altitudeDiff = 0.0;

	this->currLocationRad = location;

		//this->currLocation = location;

		/*this->currLocationRad->alt = this->currLocation->alt;
		this->currLocationRad->horzAcc = this->currLocation->horzAcc;
		this->currLocationRad->lat = this->latLongToRad( this->currLocation->lat );
		this->currLocationRad->lon = this->latLongToRad( this->currLocation->lon );
		this->currLocationRad->state = this->currLocation->state;
		this->currLocationRad->vertAcc = this->currLocation->vertAcc;*/

		Vector_each(ILocationListener*, i, this->listeners) {
			(*i)->locationReceived(this->currLocationRad);
		}
//	}

	// Notify all listeners of the new location
	/*for(Set<ILocationListener*>::Iterator itr = this->listeners.begin(); itr != this->listeners.end(); itr++) {
		(*itr)->locationReceived(this->currLocation);
	}*/
}

float LocationHandler::getSpeed() {
	return this->speed;
}

float LocationHandler::getTotalDistance() {
	return this->totalDistance;
}

float LocationHandler::getAltitudeDiff() {
	return this->altitudeDiff;
}

// Add a new location listener
void LocationHandler::addLocationListener(ILocationListener *listener) {
	//this->listeners.insert( listener );
	Vector_each(ILocationListener*, i, this->listeners) {
		if((*i) == listener) return;
	}
	this->listeners.add(listener);
}

// Remove a location listener
void LocationHandler::removeLocationListener(ILocationListener *listener) {
	//this->listeners.erase( listener );
	Vector_each(ILocationListener*, i, this->listeners) {
		if((*i) == listener) {
			this->listeners.remove(i);
	        return;
	    }
	}
}

// Triggering the location-handler toggles between enable and disable
void LocationHandler::triggered( Widget *widget ) {
	if( this->bEnabled ) {
		maLocationStop();
		this->bEnabled = false;
	}
	else {
		if( maLocationStart() == MA_LPS_AVAILABLE ) {
			this->bEnabled = true;
		}

		/*MAEvent event;
		event.type = EVENT_TYPE_LOCATION;
		event.data = new MALocation();

		GOFGSCMoblet::Self()->customEvent(event);*/
	}
}

// Constructor
LocationHandler::LocationHandler() {
	// By default location handing is disabled
	this->bEnabled = false;

	this->currLocationRad = new MALocation();

	this->speed = 0.0;
	this->distance = 0.0;
	this->totalDistance = 0.0;
	this->altitudeDiff = 0.0;
}

double LocationHandler::latLongToRad( double latLong ) {
	int degree = (int) latLong;
	double minutes = latLong - ((double) degree) * 100.0;
	double rad = ( degree + minutes / 60.0 ) / 180.0 * MAP::PI;

	return rad;
}

double LocationHandler::haversineDistance( MALocation *start, MALocation *end ) {
	double latitudeDiff = start->lat - end->lat;
	double longitudeDiff = start->lon - end->lon;

	double h = pow( sin( latitudeDiff / 2.0 ), 2 ) + cos( start->lat ) * cos( end->lat ) * pow( sin( longitudeDiff / 2.0 ), 2 );
	double distance = 2.0 * 6371.009 * asin(sqrt(h));

	return distance;
}

/*
                    double latitudeDiff = 0;
                    double longitudeDiff = 0;
                    double h = 0;
                    double distance = 0;

                    latitudeDiff = lastLatitude - latitudeRad;
                    longitudeDiff = lastLongitude - longitudeRad;

                    h = Math.Pow(Math.Sin(latitudeDiff / 2), 2) + Math.Cos(lastLatitude) * Math.Cos(latitudeRad) * Math.Pow(Math.Sin(longitudeDiff / 2), 2);
                    distance = 2 * 6371.009 * Math.Asin(Math.Sqrt(h));
*/
