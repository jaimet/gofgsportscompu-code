#include "GOFGSCMoblet.h"

extern "C" int MAMain() {
	Moblet::run(GOFGSCMoblet::Self() );
	return 0;
};
