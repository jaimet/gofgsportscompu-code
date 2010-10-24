#include "Screen.h"

Screen::Screen( char *screenName ) {
	this->myScreen = CIwUIElement::CreateFromResource( screenName );
}

void Screen::SetVisible( bool p_bVisible ) {
	this->myScreen->SetVisible( p_bVisible );

	if( p_bVisible ) {
		IwGetUIAnimManager()->StopAnim( this->myScreen );
		IwGetUIAnimManager()->PlayAnim("ScreenSlideIn", this->myScreen);
	}
}
