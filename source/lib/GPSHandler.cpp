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

template<>
GPSHandler *Singleton<GPSHandler>::mySelf = NULL;

// Get a new location statement and update all values
bool GPSHandler::updateLocation() {
	if( !this->bGPSActive ) return false;

	s3eResult g_Error = S3E_RESULT_ERROR;

	g_Error = s3eLocationGet(this->newLocation);
	int64 currTime = s3eTimerGetUTC();

	if( g_Error == S3E_RESULT_SUCCESS ) {
		// Calculate new accuracy
		double newAccuracy = (this->newLocation->m_HorizontalAccuracy + this->newLocation->m_VerticalAccuracy) / 2.0;

		// Use extended functionality to check if the location is fixed, else use our own "detector"
		// Note: This is a hybdrid check to work on devices which do not support s3eLocationGetInt too
		if( s3eLocationGetInt( S3E_LOCATION_HAS_POSITION ) <= 0 ) {
			// Check if this is a real error, or if unsupported make a "dummy" check on the accuracy
			if( s3eLocationGetError() !=  S3E_LOCATION_ERR_UNSUPPORTED || newAccuracy <= 0.0 ) {
				return false;
			}
		}

		// Check if accuracy is high enough, if not just update the current accuracy and return an invalid point
		if( (this->minAccuracy > 0.0 && newAccuracy > this->minAccuracy) ) {
			this->currAccuracy = newAccuracy;

			return false;
		}

		// Check if we have an old location
		if( this->currLocation != NULL ) {
			// Calculate distance between last and new location
			double newDistance = this->haversineDistance( this->currLocation, this->newLocation );

			// Check if the distance is outside the last accuracy (using average horiz & verti accuracy => avoid too complicated calculations)
			if( newDistance >= this->currAccuracy ) {
				// Calculate distance and speed based on gps location
				//this->distance = this->haversineDistance( this->currLocation, newLocation );
				this->distance = newDistance;
				this->currSpeed = this->distance / ((double)( currTime - this->lastTime ) / 1000.0);
				// Save altitude
				this->altitude = this->newLocation->m_Altitude;

				// Set status to true (we have an update)
				//bLocationUpdated = true;
				// Free up some memory
				delete this->currLocation;
			}
			// New location is within old accuracy
			else {
				//return false;

				this->distance = 0.0;
				this->currSpeed = 0.0;

				// We keep the old data point
				delete this->newLocation;
				this->newLocation = this->currLocation;
			}
		
			// Update tracking history
			this->distanceHistory.push_back( this->distance );
			this->distanceHistory.pop_front();
			this->timeDiffHistory.push_back( (currTime - this->lastTime) / 1000.0 );
			this->timeDiffHistory.pop_front();

			//this->distanceHistory[this->historyCount % AVERAGE_DURATION] = this->distance;
			//this->timeHistory[this->historyCount % AVERAGE_DURATION] = (currTime - this->lastTime) / 1000.0;
			this->historyCount++;

			// Calculate average speed for the last AVERAGE_DURATION seconds
			double totalDistance = 0.0;
			double totalTime = 0.0;
			std::list<double>::reverse_iterator time_it = this->timeDiffHistory.rbegin();
			for( std::list<double>::reverse_iterator distance_it = this->distanceHistory.rbegin(); distance_it != this->distanceHistory.rend(); ++distance_it ) {
				totalDistance += *distance_it;
				totalTime += *time_it;

				if( totalTime >= AVERAGE_DURATION ) break;
			}
			this->speed = totalDistance / totalTime;

			// Calculate the speed (as average out of the last AVERAGE_LENGTH points)
			/*double totalDistance = 0.0;
			double totalTime = 0.0;
			for( int i = 0; i < AVERAGE_DURATION; i++ ) {
				totalDistance += this->distanceHistory[i];
				totalTime += this->timeHistory[i];
			}
			this->speed = totalDistance / totalTime;*/
		}

		// Check if advanced location info is available (will use that for speed info then)
		if( s3eLocationGetCourse(this->courseData) == S3E_RESULT_SUCCESS ) {
			this->currSpeed = this->courseData->m_Speed;
		}

		// Save new location & create new space for new location
		this->currLocation = this->newLocation;
		this->newLocation = new s3eLocation();
		// Set accuracy based on average value
		this->currAccuracy = newAccuracy;
		// Save current time
		this->lastTime = currTime;

		//return bLocationUpdated;
		return true;
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

// Get the current accuracy of the fix (in m)
double GPSHandler::getAccuracy() {
	return this->currAccuracy;
}

// Set the minimum accuracy a fix must have to be used by the GPSHandler
void GPSHandler::SetMinAccuracy( double p_minAccuracy ) {
	this->minAccuracy = p_minAccuracy;
}

// Start GPS tracking
void GPSHandler::startGPS( bool p_bReset ) {
	if( !this->bGPSActive ) {
		if( p_bReset ) this->reset();

		s3eLocationStart();
		this->bGPSActive = true;
	}
}

// Stop GPS tracking
void GPSHandler::stopGPS() {
	if( this->bGPSActive ) {
		s3eLocationStop();
		this->bGPSActive = false;
	}
}

// Returns true if GPS is currently active
bool GPSHandler::IsActive() {
	return this->bGPSActive;
}

// Initialize the gps handler
GPSHandler::GPSHandler() {
	this->reset();
}

// Reset the GPS Handler, automatically called on startGPS()
void GPSHandler::reset() {
	this->currLocation = NULL;
	this->newLocation = new s3eLocation();
	this->courseData = new s3eLocationCourseData();
	this->bGPSActive = false;
	this->distance = 0.0;
	this->speed = 0.0;
	this->currSpeed = 0.0;
	this->altitude = 0.0;
	this->currAccuracy = -1.0;
	this->minAccuracy = -1.0;

	this->historyCount = 0;
	this->distanceHistory.clear();
	this->timeDiffHistory.clear();

	// Fill lists with empty nodes
	for( int i = 0; i < AVERAGE_DURATION; i++ ) {
		this->distanceHistory.push_front( 0.0 );
		this->timeDiffHistory.push_front( 0.0 );
	}

	/*for( int i = 0; i < AVERAGE_LENGTH; i++ ) {
		this->distanceHistory[i] = 0.0;
		this->timeHistory[i] = 0.0;
	}*/
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
	double distance = 2.0 * EARTH_RADIUS * asin(sqrt(h));	// Earth Radius in km * 1000.0 for meters

	return distance;
}
