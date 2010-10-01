#include "TrackTVItemSource.h"

TrackTVItemSource::TrackTVItemSource() {
}

CIwUIElement *TrackTVItemSource::CreateItem(int32 row) {
	//CIwUIElement *n_element = CIwUIElement::CreateFromResource("ExportTrackItem");
	CIwUILabel *n_element = new CIwUILabel();
	n_element->SetCaption( "LabelText" );
	n_element->SetSizeMax( CIwVec2( -1, 24 ) );

	return n_element;
}

int32 TrackTVItemSource::GetRowHeight(int32 row, int32 columnWidth) const {
	return 24;
}

bool TrackTVItemSource::IsRowAvailable(int32 row) const {
	return (row < 10 );
}

void TrackTVItemSource::ReleaseItem(CIwUIElement *pItem, int32 row) {
	delete pItem;
}
