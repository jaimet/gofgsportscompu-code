/*
 * Singleton.h
 *
 *  Created on: 17.08.2010
 *      Author: wkoller
 */

#ifndef SINGLETON
#define SINGLETON

template <class S>
class Singleton {
public:
	static S* Self() {
		if( S::mySelf == NULL ) {
			S::mySelf = new S();
		}

		return S::mySelf;
	}

private:
	static S* mySelf;
};

template <class S>
S *Singleton<S>::mySelf = NULL;

#endif /* SINGLETON_H_ */
