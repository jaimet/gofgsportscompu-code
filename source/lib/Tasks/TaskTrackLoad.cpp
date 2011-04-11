/*
* Copyright (C) 2011 Wolfgang Koller
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

#include "TaskTrackLoad.h"

TaskTrackLoad::TaskTrackLoad( std::string p_fileName ) : Task(), TrackReader() {
	this->currentPoint = NULL;
	this->startTime = 0;
	this->lastAltitude = -1000.0;
	this->totalAltitudeDiff = 0.0;

	this->SetFile( p_fileName );
}

void TaskTrackLoad::Start() {
	this->currentPoint = this->ReadNextPoint();

	if( this->currentPoint != NULL ) {
		MainScreen::Self()->Reset();

		this->startTime = this->currentPoint->unixtime;
		this->lastAltitude = this->currentPoint->alt;
	}
}

int TaskTrackLoad::Next() {
	double altitudeDiff = 0.0;

	if( this->currentPoint == NULL ) return -1;

	altitudeDiff = this->currentPoint->alt - this->lastAltitude;
	if( altitudeDiff > 0.0 ) this->totalAltitudeDiff += altitudeDiff;

	// Update main display
	MainScreen::Self()->UpdateDisplay( this->currentPoint->speed, this->currentPoint->hr, this->currentPoint->dist, this->totalAltitudeDiff, this->currentPoint->unixtime - this->startTime, 0.0 );

	this->currentPoint = this->ReadNextPoint();

	return 1;
}

void TaskTrackLoad::Stop() {
	// We are done
	this->UpdateProgress( 100 );

	// Close file
	this->CloseFile();
}
