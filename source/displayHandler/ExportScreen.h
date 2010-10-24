#ifndef EXPORTSCREEN
#define EXPORTSCREEN

#include "IwUI.h"

#include "../displayHandler/Screen.h"
#include "../lib/Singleton.h"
#include "../lib/TrackExportHandler.h"

enum ExportFormat {
	FITLOG,
	TCX
};

class ExportScreen : public Screen, public Singleton<ExportScreen>
{
	friend class Singleton<ExportScreen>;
public:
	void ES_ExitButtonClick(CIwUIElement*);
	void ES_ExportButtonClick(CIwUIElement*);
	void ES_HandleTrackSelection(CIwUIElement *pTrackEntry, bool bIsSelected);
	void ES_ExportFormatChanged(CIwUIElement*, int16 selection);

private:
	ExportScreen();

	char es_currentFile[20];
	ExportFormat exportFormat;
};

#endif
