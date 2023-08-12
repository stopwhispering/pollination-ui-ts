import IconPool from "sap/ui/core/IconPool";
import UIComponent from "sap/ui/core/UIComponent";


/**
 * @namespace pollination.ui
 */
export default class Component extends UIComponent {

	public static metadata = {
		manifest: "json"
	};

	public onInit() {
	}

	public init() {
		UIComponent.prototype.init.apply(this, arguments);
		
		IconPool.addIcon("flower", "custom", "icomoon", "e900");
		IconPool.addIcon("pollen", "custom", "icomoon", "e901");
	 }
}
