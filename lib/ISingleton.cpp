/*
 * ISingleton.cpp
 *
 *  Created on: 17.08.2010
 *      Author: wkoller
 */

/*#include "ISingleton.h"

template <class S>
S *ISingleton<S>::mySelf = NULL;

template <class S>
S *ISingleton<S>::Self() {
	if( S::mySelf == NULL ) {
		S::mySelf = new S();
	}

	return S::mySelf;
}

/*template <class S>
ISingleton<S>::ISingleton() {
}
*/
