/*
 * Singleton.h
 *
 *  Created on: 17.08.2010
 *      Author: wkoller
 */

#ifndef SINGLETON_H_
#define SINGLETON_H_

#include <MAUtil/Moblet.h>	// Required for NULL pointer declaration

template <class S>
class ISingleton {
public:
	static S* Self() {
		if( S::mySelf == NULL ) {
			S::mySelf = new S();
		}

		return S::mySelf;
	}

/*protected:
	ISingleton();*/

private:
	static S* mySelf;
};

template <class S>
S *ISingleton<S>::mySelf = NULL;

#endif /* SINGLETON_H_ */
