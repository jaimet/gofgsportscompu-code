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

#include "GPSHandler.h"

GPSHandler *GPSHandler::mySelf = NULL;

// Singleton function
GPSHandler *GPSHandler::Self() {
	if( GPSHandler::mySelf == NULL ) {
		GPSHandler::mySelf = new GPSHandler();
	}

	return GPSHandler::mySelf;
}

// Get a new location statement and update all values
bool GPSHandler::updateLocation() {
	if( !this->bGPSActive ) return false;

	s3eResult g_Error = S3E_RESULT_ERROR;
	s3eLocation *newLocation = new s3eLocation();

	g_Error = s3eLocationGet(newLocation);
	int64 currTime = s3eTimerGetUTC();

	if( g_Error == S3E_RESULT_SUCCESS ) {
		bool bLocationUpdated = false;	// This is set to true, if the new location is outside the last accuracy (which means data is updated)

		// Check if we have an old location
		if( this->currLocation != NULL ) {
			// Calculate distance between last and new location
			double newDistance = this->haversineDistance( this->currLocation, newLocation );

			// Check if the distance is outside the last accuracy (using average horiz & verti accuracy => avoid too complicated calculations)
			if( newDistance >= ( this->currLocation->m_HorizontalAccuracy + this->currLocation->m_VerticalAccuracy ) / 2.0 ) {
				// Calculate distance and speed based on gps location
				//this->distance = this->haversineDistance( this->currLocation, newLocation );
				this->distance = newDistance;
				this->currSpeed = this->distance / ((double)( currTime - this->lastTime ) / 1000.0);

				// Update tracking history
				this->distanceHistory[this->historyCount % AVERAGE_LENGTH] = this->distance;
				this->timeHistory[this->historyCount % AVERAGE_LENGTH] = (currTime - this->lastTime / 1000.0);
				this->historyCount++;

				// Calculate the speed (as average out of the last AVERAGE_LENGTH points)
				double totalDistance = 0.0;
				double totalTime = 0.0;
				for( int i = 0; i < AVERAGE_LENGTH; i++ ) {
					totalDistance += this->distanceHistory[i];
					totalTime += this->timeHistory[i];
				}
				this->speed = totalDistance / totalTime;

				// Save altitude
				this->altitude = newLocation->m_Altitude;

				// Set status to true (we have an update)
				bLocationUpdated = true;
			}
		
			// Free up some memory
			delete this->currLocation;
		}

		// Save new location
		this->currLocation = newLocation;
		// Save current time
		this->lastTime = currTime;

		return bLocationUpdated;
	}

	return false;
}

// Get the current altitude (in m)
double GPSHandler::getAltitude() {
	return this->currLocation->m_Altitude;
}

// Get the current latitude (in rad)
double GPSHandler::getLatitude() {
	return this->degreeToRad(this->currLocation->m_Latitude);
}

// Get the current longitude (in rad)
double GPSHandler::getLongitude() {
	return this->degreeToRad(this->currLocation->m_Longitude);
}

// Get the current speed (in m/s)
double GPSHandler::getSpeed() {
	return this->speed;
}

// Get the current distance (in m)
double GPSHandler::getDistance() {
	return this->distance;
}

// Start GPS tracking
void GPSHandler::startGPS() {
	if( !this->bGPSActive ) {
		this->reset();

		s3eLocationStart();
		this->bGPSActive = true;
	}
}

// TODO: Reset GPS handler on new track
// Stop GPS tracking
void GPSHandler::stopGPS() {
	if( this->bGPSActive ) {
		s3eLocationStop();
		this->bGPSActive = false;
	}
}

// Initialize the gps handler
GPSHandler::GPSHandler() {
	this->reset();
}

// Reset the GPS Handler, automatically called on startGPS()
void GPSHandler::reset() {
	this->currLocation = NULL;
	this->bGPSActive = false;
	this->distance = 0.0;
	this->speed = 0.0;
	this->currSpeed = 0.0;
	this->altitude = 0.0;

	this->historyCount = 0;
	for( int i = 0; i < AVERAGE_LENGTH; i++ ) {
		this->distanceHistory[i] = 0.0;
		this->timeHistory[i] = 0.0;
	}
}

// Convert an angle in degree to rad
double GPSHandler::degreeToRad( double degree ) {
	return (degree / 180.0 * M_PI );
}

// Calculate the distance between two points using the haversine formula (in km)
double GPSHandler::haversineDistance( s3eLocation *start, s3eLocation *end ) {
	double latitudeDiff = start->m_Latitude - end->m_Latitude;
	double longitudeDiff = start->m_Longitude - end->m_Longitude;

	double h = pow( sin( this->degreeToRad(latitudeDiff) / 2.0 ), 2 ) + cos( this->degreeToRad(start->m_Latitude) ) * cos( this->degreeToRad(end->m_Latitude) ) * pow( sin( this->degreeToRad(longitudeDiff) / 2.0 ), 2 );
	double distance = 2.0 * 6371.009 * 1000.0 * asin(sqrt(h));	// Earth Radius in km * 1000.0 for meters

	return distance;
}
