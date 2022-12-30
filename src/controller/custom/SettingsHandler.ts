import { BResultsSettings } from "pollination/ui/interfaces/entities";
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
		const oSettings = <BResultsSettings>{};
		this._oSettingsModel.setData(oSettings);
    }

	public loadSettings(): void {
		$.ajax({
			url: Util.getServiceUrl('pollinations/settings'),
			data: {},
			context: this,
			async: true
		})
			.done(this._onDoneLoadSettings)
			.fail(Util.onFail.bind(this, 'Load settings'))
	}

	private _onDoneLoadSettings(result: BResultsSettings): void {
        this._oSettingsModel.setData(result);
		// var oModel = new JSONModel(result);
		// this.getView().setModel(oModel, "settingsModel");
	}



}