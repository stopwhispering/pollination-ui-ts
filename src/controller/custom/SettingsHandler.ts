import { SettingsRead } from "pollination/ui/interfaces/entities";
import ManagedObject from "sap/ui/base/ManagedObject";
import JSONModel from "sap/ui/model/json/JSONModel";
import Util from "./Util";

/**
 * @namespace pollination.ui.controller.custom
 */
export default class SettingsHandler extends ManagedObject {

    private _oSettingsModel: JSONModel;

    public constructor(oSettingsModel: JSONModel) {  
        super();
        this._oSettingsModel = oSettingsModel;
		const oSettings = <SettingsRead>{};
		this._oSettingsModel.setData(oSettings);
    }

	public async loadSettings() {
		const oSettings = <SettingsRead> await Util.get(Util.getServiceUrl('pollinations/settings'));
        this._oSettingsModel.setData(oSettings);
	}
	

}