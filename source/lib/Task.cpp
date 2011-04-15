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

#include "Task.h"

Task::Task() {
	this->processID = 0;
	this->progressCallback = NULL;
	this->lastProgress = -1;
}

Task::~Task() {
}

void Task::SetProgressCallback( s3eCallback p_progressCallback ) {
	this->progressCallback = p_progressCallback;
}

void Task::SetProcessID( int p_processID ) {
	this->processID = p_processID;
}

int Task::GetProcessID() {
	return this->processID;
}

void Task::UpdateProgress( int p_percent, char *message ) {
	// Check if this is a new percent, if not ignore (for performance reasons)
	if( this->lastProgress == p_percent ) return;

	int *percent = &p_percent;

	if( this->progressCallback != NULL ) {
		(*progressCallback)( percent, message );
	}

	// Store new progress
	this->lastProgress = p_percent;
}
