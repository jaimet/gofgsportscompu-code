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

#include "TrackHandler.h"

template<>
TrackHandler *Singleton<TrackHandler>::mySelf = NULL;

bool TrackHandler::startTracking( std::string fileName ) {
	// Open the given file for writing
	this->trackFile.open( fileName.c_str() );

	if( this->trackFile.is_open() ) {
		// Reset track handler
		this->dataFlags->Reset( true );

		// Setup fixed number-format for output file
		this->trackFile << std::fixed;

		// Initialize the random number generator
		IwRandSeed( (int32) time(NULL) );

		// Generate header information (which means a Type-4 UUID and start-timestamp)
		this->trackFile << "00;" << std::hex << IwRandMinMax( 0, 0xFFFF ) << IwRandMinMax( 0, 0xFFFF ) << "-" << IwRandMinMax( 0, 0xFFFF );
		this->trackFile << "-4" << IwRandMinMax( 0, 0xFFF ) << "-" << IwRandMinMax( 0x8, 0xB ) << IwRandMinMax( 0, 0xFFF );
		this->trackFile << "-" << IwRandMinMax( 0, 0xFFFF ) << IwRandMinMax( 0, 0xFFFF ) << IwRandMinMax( 0, 0xFFFF );
		this->trackFile << ":" << std::dec << time(NULL) << "\n";

		return true;
	}

	return false;
}

void TrackHandler::stopTracking() {
	if( this->trackFile.is_open() ) this->trackFile.close();
}

void TrackHandler::addGPSData( double lon, double lat, double alt ) {
	// Check for new data point first
	this->checkData( 2 );
	this->trackFile << "02;" << std::setprecision( 9 ) << lon << ":" << lat << ":" << std::setprecision( 2 ) << alt << "\n";
}

void TrackHandler::addDistanceData( double distance ) {
	// Check for new data point first
	this->checkData( 4 );
	this->trackFile << "04;" << std::setprecision( 2 ) << distance << "\n";
}

/**
 * <summary>	Adds heartrate (pulse) data.  </summary>
 *
 * <remarks>	Wkoller, 05.04.2011. </remarks>
 *
 * <param name="bpm">	Current bpm (beats per minutes). </param>
 */
void TrackHandler::addHRData( int bpm ) {
	this->checkData( 3 );
	this->trackFile << "03;" << bpm << "\n";
}

TrackHandler::TrackHandler() {
	this->dataFlags = new DataFlags();
	this->dataFlags->Reset( true );
}

void TrackHandler::addTimeData() {
	this->trackFile << "01;" << time(NULL) << "\n";
}

// Called to check if a data information already exists in the current data record
void TrackHandler::checkData( int type ) {
	switch( type ) {
		case 2:
			if( this->dataFlags->bGPS ) {
				this->addTimeData();
				this->dataFlags->Reset();
			}
			this->dataFlags->bGPS = true;
			break;
		case 3:
			if( this->dataFlags->bHR ) {
				this->addTimeData();
				this->dataFlags->Reset();
			}
			this->dataFlags->bHR = true;
			break;
		case 4:
			if( this->dataFlags->bDistance ) {
				this->addTimeData();
				this->dataFlags->Reset();
			}
			this->dataFlags->bDistance = true;
			break;
		default:
			break;
	}
}
