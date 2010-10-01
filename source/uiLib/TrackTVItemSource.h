#ifndef TRACKTVITEMSOURCE
#define TRACKTVITEMSOURCE

#include "IwUI.h"

#include <IwUIElement.h>
#include <IwUILabel.h>
#include <IwUILayoutGrid.h>

class TrackTVItemSource : public CIwUITableViewItemSource {
public:
	TrackTVItemSource();

	CIwUIElement *CreateItem(int32 row);
	int32 GetRowHeight(int32 row, int32 columnWidth) const;
	bool IsRowAvailable(int32 row) const;
	void ReleaseItem(CIwUIElement *pItem, int32 row);

private:
};

#endif
