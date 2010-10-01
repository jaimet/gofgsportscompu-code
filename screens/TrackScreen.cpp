/*
 * TrackScreen.cpp
 *
 *  Created on: 02.09.2010
 *      Author: wkoller
 */

#include "TrackScreen.h"

#include "../GOFGSCMoblet.h"

template<>
TrackScreen *ISingleton<TrackScreen>::mySelf = NULL;

void TrackScreen::refreshTrackList() {
//	String fileEntry;
	char fileEntry[50];

//	this->trackList->clear();

	MAHandle dirHandler = maFileListStart( "", "" );

//	this->fileLister->start( "", "" );
//	while( this->fileLister->next(fileEntry) > 0 ) {
	while( maFileListNext( dirHandler, fileEntry, 50 ) > 0 ) {
		Label *entry = new Label( 0, 0, this->trackList->getWidth(), 24, this->trackList, fileEntry, 0xFFFFFF, new Font(FONT_VERA18) );
	}

	maFileListClose( dirHandler );
}

void TrackScreen::leftButtonTriggered() {
	MainScreen::Self()->show();
	this->hide();
}

TrackScreen::TrackScreen() {
//	this->fileLister = new FileLister();

	this->mainLayout = new Layout( 0, 0, GOFGSCMoblet::Self()->getScreenWidth(), GOFGSCMoblet::Self()->getScreenHeight(), NULL, 1, 4 );
	this->setMain(this->mainLayout);
	this->mainLayout->setDrawBackground(true);
	this->mainLayout->setBackgroundColor(0x000000);

	Label *title = new Label( 0, 0, this->mainLayout->getWidth(), 24, this->mainLayout, "Export Track", 0xFFFFFF, new Font(FONT_VERA18) );
	title->setHorizontalAlignment( Label::HA_CENTER );

	this->trackList = new ListBox( 0, 0, this->mainLayout->getWidth(), 24, this->mainLayout, ListBox::LBO_VERTICAL );
//	this->trackList->setDrawBackground( true );
	this->trackList->setBackgroundColor(0xFFFFFF);

	Label *type = new Label( 0, 0, this->mainLayout->getWidth(), 24, this->mainLayout, "Type", 0xFFFFFF, new Font(FONT_VERA18) );

	this->menuBar = new MenuBar( 0, 0, this->mainLayout->getWidth(), 48, this->mainLayout );
	this->menuBar->setLeftButton( IMAGE_DELETE48 );

	// Now resize the tracklist to fill empty space
	this->trackList->setHeight( this->mainLayout->getHeight() - title->getHeight() - type->getHeight() - this->menuBar->getHeight() );

	this->refreshTrackList();

	this->menuBar->addMenuBarListener(this);
}
