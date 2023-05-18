import DynamicPage from "sap/f/DynamicPage";
import App from "sap/m/App";
import Avatar from "sap/m/Avatar";
import CustomListItem from "sap/m/CustomListItem";
import HBox from "sap/m/HBox";
import List from "sap/m/List";
import ScrollContainer from "sap/m/ScrollContainer";
import Table from "sap/m/Table";
import VBox from "sap/m/VBox";
import ListItem from "sap/ui/core/ListItem";
import View from "sap/ui/core/mvc/View";
import XMLView from "sap/ui/core/mvc/XMLView";
import Master from "../controller/App.controller";

/**
 * @namespace plants.ui.model
 */
export default function addMouseOverDelegatePollenDonor(_: string) {
        // with javascript ui5, one can get the control itself as <<this>> by simply doing "...formatter=myFunction..." in XML
        // instead of "...formatter=.formatter.myFunction..."
        // with typescript, it does not work like this as that "special" formatter function seems not to be recognized

        // we therefore have to do this workaround, which is not very elegant

		// this still is a disgusting piece of code; todo find some elegang solution
        // @ts-ignore
        let oAvatar = this as Avatar;

        let oControl: any = oAvatar;
        while (oControl.getMetadata()._sClassName != 'sap.ui.core.mvc.XMLView' ) {
            oControl = oControl.getParent();
        }
        const oXMLView = <XMLView> oControl;

        let oMasterController = oXMLView.getController() as Master;
		var fn_open = oMasterController.onHoverImagePollenDonor;
		var fn_close = oMasterController.onHoverAwayFromImage;
		oAvatar.addEventDelegate({
			onmouseover: fn_open.bind(oMasterController, oAvatar),
			onmouseout: fn_close.bind(oMasterController, oAvatar)
		});
}