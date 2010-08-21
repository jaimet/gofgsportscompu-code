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
		this->currLocation = location;

		this->currLocationRad->alt = this->currLocation->alt;
		this->currLocationRad->horzAcc = this->currLocation->horzAcc;
		this->currLocationRad->lat = this->latLongToRad( this->currLocation->lat );
		this->currLocationRad->lon = this->latLongToRad( this->currLocation->lon );
		this->currLocationRad->state = this->currLocation->state;
		this->currLocationRad->vertAcc = this->currLocation->vertAcc;

		Vector_each(ILocationListener*, i, this->listeners) {
			(*i)->locationReceived(this->currLocationRad);
		}
//	}

	// Notify all listeners of the new location
	/*for(Set<ILocationListener*>::Iterator itr = this->listeners.begin(); itr != this->listeners.end(); itr++) {
		(*itr)->locationReceived(this->currLocation);
	}*/
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
}

double LocationHandler::latLongToRad( double latLong ) {
	int degree = (int) latLong;
	double minutes = latLong - ((double) degree) * 100.0;
	double rad = ( degree + minutes / 60.0 ) / 180.0 * MAP::PI;

	return rad;
}

/*
        private double LatLongToRad(double latLong, char direction)
        {
            int degree = Convert.ToInt32( latLong / 100.0 );
            double minutes = latLong - degree * 100.0;
            double rad = (degree + minutes / 60.0) / 180.0 * Math.PI;

            if (direction.CompareTo('W') == 0 || direction.CompareTo('S') == 0) rad *= (-1.0);

            return rad;

            /*try
            {
                String minutes = latLong.Substring(latLong.IndexOf('.') - 2);
                String degree = latLong.Substring(0, latLong.IndexOf('.') - 2);

                if (degree.Length == 0) degree = "0";

                return (Convert.ToDouble(degree) + Convert.ToDouble(minutes) / 60.0);
            }
            catch(System.Exception e )
            {
                LogHandler.Self().writeLog(e.Message, latLong + "\n" + e.StackTrace);
            }

            return -1.0;
        }
*/
