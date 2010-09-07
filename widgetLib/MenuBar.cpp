/*
 * MenuBar.cpp
 *
 *  Created on: 18.08.2010
 *      Author: wkoller
 */

#include "MenuBar.h"

#include "../GOFGSCMoblet.h"

MenuBar::MenuBar( int x, int y, int width, int height, Widget *parent ) : Layout( x, y, width, height, parent ) {
	this->setPaddingTop( 1 );
	this->setPaddingRight( 1 );
	this->setPaddingBottom( 1 );
	this->setPaddingLeft( 1 );
	this->setNumRows( 1 );
	this->setNumColumns( 5 );

	// Calculate size for spacers (button images are heightxheight)
	int spacerWidth = (width - 3 * height) / 2;

	// Now start adding the buttons (images)
	// Left Button
	this->leftButton = new Image( 0, 0, height, height, this );
	this->leftButton->setDrawBackground(true);
	this->leftButton->setBackgroundColor(0xFFFFFF);
	this->leftButton->addWidgetListener(this);
	//this->leftButton->addWidgetListener(this);
	// First padding
	this->lmPadding = new Image( 0, 0, spacerWidth, height, this );
	this->lmPadding->setDrawBackground(true);
	this->lmPadding->setBackgroundColor(0xFFFFFF);
	// Middle Button
	this->middleButton = new Image( 0, 0, height, height, this );
	this->middleButton->setDrawBackground(true);
	this->middleButton->setBackgroundColor(0xFFFFFF);
	this->middleButton->addWidgetListener(this);

//	this->middleLabel = new Label( 0, 0, height * 3, height, this, "-", 0xFFFFFF, new Font(FONT_VERA18) );
	//this->middleLabel->setDrawBackground( true );
	//this->middleLabel->setBackgroundColor(0xFFFFFF);
	//this->middleButton->addWidgetListener(this);
	// Second padding
	this->mrPadding = new Image( 0, 0, spacerWidth, height, this );
	this->mrPadding->setDrawBackground(true);
	this->mrPadding->setBackgroundColor(0xFFFFFF);
	// Right Button
	this->rightButton = new Image( 0, 0, height, height, this );
	this->rightButton->setDrawBackground(true);
	this->rightButton->setBackgroundColor(0xFFFFFF);
	this->rightButton->addWidgetListener(this);
	//this->rightButton->addWidgetListener(this);

	// Add ourselves as pointer-listener
//	Environment::getEnvironment().addPointerListener(this);
//	Environment::getEnvironment().addFocusListener( this );
	this->bEnabled = false;

	this->show();
}

MenuBar::~MenuBar() {
	//Environment::getEnvironment().removePointerListener(this);
}

void MenuBar::setLeftButton( MAHandle image ) {
	this->leftButton->setResource( image );
}

void MenuBar::setMiddleButton( MAHandle image ) {
	this->middleButton->setResource( image );
}

void MenuBar::setRightButton( MAHandle image ) {
	this->rightButton->setResource( image );
}

/*void MenuBar::addLBWidgetListener( WidgetListener *wl ) {
	this->leftButton->addWidgetListener(wl);
}

void MenuBar::addMBWidgetListener( WidgetListener *wl ) {
	this->middleButton->addWidgetListener(wl);
}

void MenuBar::addRBWidgetListener( WidgetListener *wl ) {
	this->rightButton->addWidgetListener(wl);
}*/

// Add a new location listener
void MenuBar::addMenuBarListener(IMenuBarListener *listener) {
	//this->listeners.insert( listener );
	Vector_each(IMenuBarListener*, i, this->listeners) {
		if((*i) == listener) return;
	}
	this->listeners.add(listener);
}

// Remove a location listener
void MenuBar::removeMenuBarListener(IMenuBarListener *listener) {
	//this->listeners.erase( listener );
	Vector_each(IMenuBarListener*, i, this->listeners) {
		if((*i) == listener) {
			this->listeners.remove(i);
	        return;
	    }
	}
}

void MenuBar::pointerPressEvent( MAPoint2d p ) {
//	if( this->isHidden() ) return;

	//this->hide();

//	char tmpString[40];
//
//	Rect rect = this->leftButton->getBounds();
//
//	sprintf( tmpString, "%d/%d/%d/%d %d/%d", rect.x, rect.y, rect.width, rect.height, p.x, p.y );
//
//	this->middleLabel->setMultiLine(true);
//	this->middleLabel->setCaption( tmpString );

//	Point point(p.x,p.y);
//	Point pb = this->leftButton->getPosition();

//	if( this->leftButton->contains( point ) ) {
	if( this->leftButton->getBounds().contains( p.x, p.y ) ) {
//	if( p.x >= pb.x && p.x <= (pb.x + this->leftButton->getWidth()) && p.y >= pb.y && p.y <= (pb.y + this->leftButton->getHeight()) ) {
//		this->middleLabel->setCaption( "Left" );
		this->leftButton->trigger();
	}
//	else if( this->middleButton->contains( point ) ) {
	else if( this->middleButton->getBounds().contains( p.x, p.y ) ) {
//	else if( p.x >= pb.x && p.x <= (pb.x + this->middleButton->getWidth()) && p.y >= pb.y && p.y <= (pb.y + this->middleButton->getHeight()) ) {
		this->middleButton->trigger();
	}
//	else if( this->rightButton->contains( point ) ) {
	else if( this->rightButton->getBounds().contains( p.x, p.y ) ) {
//	else if( p.x >= pb.x && p.x <= (pb.x + this->rightButton->getWidth()) && p.y >= pb.y && p.y <= (pb.y + this->rightButton->getHeight()) ) {
//		this->middleLabel->setCaption( "Right" );
		this->rightButton->trigger();
	}
}

void MenuBar::pointerMoveEvent( MAPoint2d p ) {}

void MenuBar::pointerReleaseEvent( MAPoint2d p ) {}

void MenuBar::setEnabled( bool bE ) {
	if( bE && !this->bEnabled ) {
		GOFGSCMoblet::Self()->addPointerListener( this );
	}
	else if( !bE && this->bEnabled ) {
		GOFGSCMoblet::Self()->removePointerListener( this );
	}

	this->bEnabled = bE;
}

/*void MenuBar::triggered( Widget *widget ) {
	Image *buttonTriggered = (Image *)widget;

	//buttonTriggered->setBackgroundColor(0xFF0000);
}*/

/*void MenuBar::focusLost() {
	if( !this->isHidden() ) {
		Environment::getEnvironment().removePointerListener(this);
	}
}

void MenuBar::focusGained() {
	if( !this->isHidden() ) {
		Environment::getEnvironment().addPointerListener(this);
	}
}*/


void MenuBar::triggered( Widget *widget ) {
	if( widget == this->leftButton ) {
		Vector_each(IMenuBarListener*, i, this->listeners) {
			(*i)->leftButtonTriggered();
		}
	}
	else if( widget == this->middleButton ) {
		Vector_each(IMenuBarListener*, i, this->listeners) {
			(*i)->middleButtonTriggered();
		}
	}
	else if( widget == this->rightButton ) {
		Vector_each(IMenuBarListener*, i, this->listeners) {
			(*i)->rightButtonTriggered();
		}
	}
}

void MenuBar::show() {
	this->setHeight( 48 );
//	Environment::getEnvironment().addPointerListener(this);
//	GOFGSCMoblet::Self()->addPointerListener( this );

}

void MenuBar::hide() {
	this->setHeight( 0 );
//	Environment::getEnvironment().removePointerListener(this);
//	GOFGSCMoblet::Self()->removePointerListener( this );
}

bool MenuBar::isHidden() {
	return ( this->getHeight() <= 0 );
}
