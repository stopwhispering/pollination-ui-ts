import Device from "sap/ui/Device";
import IconPool from "sap/ui/core/IconPool";
import UIComponent from "sap/ui/core/UIComponent";
import JSONModel from "sap/ui/model/json/JSONModel";


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
		// @ts-ignore
		UIComponent.prototype.init.apply(this, arguments);
		
		const oDeviceModel = new JSONModel(Device);
		oDeviceModel.setDefaultBindingMode("OneWay");
		this.setModel(oDeviceModel, "device");
		
		IconPool.addIcon("flower", "custom", "icomoon", "e900");
		IconPool.addIcon("pollen", "custom", "icomoon", "e901");
	 }
}
