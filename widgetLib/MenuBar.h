/*
 * MenuBar.h
 *
 *  Created on: 18.08.2010
 *      Author: wkoller
 */

#ifndef MENUBAR_H_
#define MENUBAR_H_

#include <MAUI/Layout.h>
#include <MAUI/Image.h>
#include <MAUI/Label.h>

#include <MAUtil/Environment.h>

using namespace MAUI;

class IMenuBarListener {
public:
	virtual void leftButtonTriggered() {};
	virtual void middleButtonTriggered() {};
	virtual void rightButtonTriggered() {};
};

//class MenuBar : public Layout, PointerListener, FocusListener {
class MenuBar : public Layout, PointerListener {
//class MenuBar : public Layout {
public:
	MenuBar( int x, int y, int width, int height, Widget *parent = 0 );
	~MenuBar();

	void setLeftButton( MAHandle image );
	void setMiddleButton( MAHandle image );
	void setRightButton( MAHandle image );

	/*void addLBWidgetListener( WidgetListener *wl );
	void addMBWidgetListener( WidgetListener *wl );
	void addRBWidgetListener( WidgetListener *wl );*/
	void addMenuBarListener( IMenuBarListener *mbl );
	void removeMenuBarListener( IMenuBarListener *mbl );

	void pointerPressEvent( MAPoint2d p );
	void pointerMoveEvent( MAPoint2d p );
	void pointerReleaseEvent( MAPoint2d p );

	void setEnabled( bool bEnabled );

/*	void focusLost();
	void focusGained();*/

	void triggered( Widget *widget );

	void show();
	void hide();

	bool isHidden();

	//virtual void triggered( Widget *widget );

private:
	Vector<IMenuBarListener*> listeners;

	Image *leftButton;
	Image *rightButton;
	Image *middleButton;
	Image *lmPadding;
	Image *mrPadding;
//	Label *middleLabel;

	bool bEnabled;
};

#endif /* MENUBAR_H_ */
