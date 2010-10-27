#include "MenuScreen.h"

template<>
MenuScreen *Singleton<MenuScreen>::mySelf = NULL;

void MenuScreen::MS_TracksButtonClick(CIwUIElement*) {
	//ExportScreen::Self()->GetScreen()->SetVisible(true);
	ExportScreen::Self()->SetVisible( true );

	//this->SetVisible( false );
}

void MenuScreen::MS_CloseButtonClick(CIwUIElement*) {
	//this->myScreen->SetVisible(false);
	//MainScreen::Self()->SetVisible( true );

	this->SetVisible( false );
}

/*void MenuScreen::SetVisible( bool p_bVisible ) {
	Screen::SetVisible( p_bVisible );

	if( p_bVisible ) {

		//IwGetUIAnimManager()->PlayAnim("MenuSlideIn", this->tracksButton);
		IwGetUIAnimManager()->StopAnim( this->myScreen );
		IwGetUIAnimManager()->PlayAnim("MenuSlideIn", this->myScreen);
	}
	else {
		IwGetUIAnimManager()->StopAnim( this->myScreen );
		IwGetUIAnimManager()->PlayAnim("MenuSlideOut", this->myScreen);
	}
}*/


MenuScreen::MenuScreen() : Screen( "MenuScreen" ) {
	IW_UI_CREATE_VIEW_SLOT1(this, "MenuScreen", MenuScreen, MS_TracksButtonClick, CIwUIElement*)
	IW_UI_CREATE_VIEW_SLOT1(this, "MenuScreen", MenuScreen, MS_CloseButtonClick, CIwUIElement*)

	//this->myScreen = CIwUIElement::CreateFromResource( "MenuScreen" );

	//this->tracksButton = this->myScreen->GetChildNamed( "TracksButton" );

	IwGetUIView()->AddElementToLayout( this->myScreen );
}
