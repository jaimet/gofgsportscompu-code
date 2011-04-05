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

#ifndef SINGLETON
#define SINGLETON

#include <cstring>	// Required for NULL reference

template <class S>
class Singleton {
public:
	static S* Self() {
		if( S::mySelf == NULL ) {
			S::mySelf = new S();
		}

		return S::mySelf;
	}

	static void Delete() {
		if( S::mySelf != NULL ) {
			delete S::mySelf;
			S::mySelf = NULL;
		}
	}

private:
	static S* mySelf;
};

template <class S>
S *Singleton<S>::mySelf = NULL;

#endif /* SINGLETON_H_ */
