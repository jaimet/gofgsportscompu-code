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

#ifndef TASK_C
#define TASK_C

#include "s3eTypes.h"

/**
* Implements a basic iterative task
* Call Sequence is:
* - Start
* - Next, Next, Next, .... (until Next returns <= 0)
* - Stop
*/
class Task {
public:
	Task();
	virtual ~Task();

	virtual void Start() = 0;
	virtual int Next() = 0;
	virtual void Stop() = 0;

	void SetProgressCallback( s3eCallback p_progressCallback );

	void SetProcessID( int p_processID );
	int GetProcessID();

protected:
	void UpdateProgress( int p_percent, const char *message = NULL );

private:
	int processID;
	s3eCallback progressCallback;
	int lastProgress;	// Percent value the progress was last updated
};

#endif
