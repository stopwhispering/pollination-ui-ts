import ManagedObject from "sap/ui/base/ManagedObject";
import JSONModel from "sap/ui/model/json/JSONModel";
import Util from "./Util";
import { Florescence, LUnsavedPollination } from "pollination/ui/interfaces/entitiesLocal";
import { PollinationCreate } from "pollination/ui/interfaces/entities";
import PollinationsHandler from "./PollinationsHandler";


/**
 * @namespace pollination.ui.controller.custom
 */
export default class UnsavedPollinationsHandler extends ManagedObject {

	private _aUnsavedPollinations: LUnsavedPollination[]

    private _oUnsavedPollinationsModel: JSONModel;  // "newPollinationsModel"
	private _oPollinationsHandler: PollinationsHandler;
	// private _oActiveFlorescencesHandler: ActiveFlorescencesHandler;

    public constructor(oUnsavedPollinationsModel: JSONModel, 
		oPollinationsHandler: PollinationsHandler, 
		// oActiveFlorescencesHandler: ActiveFlorescencesHandler
		) {
        super();

        this._oUnsavedPollinationsModel = oUnsavedPollinationsModel;
		this._oPollinationsHandler = oPollinationsHandler;
		// this._oActiveFlorescencesHandler = oActiveFlorescencesHandler;

		this._aUnsavedPollinations = <LUnsavedPollination[]>[];
		this._oUnsavedPollinationsModel.setData(this._aUnsavedPollinations);
    }

	public removePollination(oPollination: LUnsavedPollination) {
		var index = this._aUnsavedPollinations.indexOf(oPollination);
		if (index < 0) {
			throw new Error('Pollination not found in unsaved pollinations');
		}
		this._aUnsavedPollinations.splice(index, 1);
		this._oUnsavedPollinationsModel.updateBindings(false);
	}

	public async savePollination(oPollination: PollinationCreate) {
		// const oSavedPollination = <LUnsavedPollination> await Util.post(Util.getServiceUrl('pollinations'), oPollination);
		Util.post(Util.getServiceUrl('pollinations'), oPollination);

		// having posted a new pollination, re-read the ongoing pollinations list
		this._oPollinationsHandler.loadPollinations();

		// remove saved new pollination from new pollinations model 
		this.removePollination(oPollination);
	}

	public addPollination(oPollination: LUnsavedPollination) {
		this._aUnsavedPollinations.push(oPollination);
		this._oUnsavedPollinationsModel.updateBindings(false);
	}

	public getAvailableColors(florescence: Florescence): string[] {
		// determine available colors based on the colors we received from backend for the currently selected
		// florescence and the colors we already used for unsaved pollinations 

		// clone available colors from those we received from backend so we don't modify the original below
		var availabeColorsRgb = JSON.parse(JSON.stringify(florescence.available_colors_rgb));

		// remove colors from unsaved pollinations
		for (var i = 0; i < this._aUnsavedPollinations.length; i++) {
			var pollination = this._aUnsavedPollinations[i];
			if (florescence.id === pollination.florescence_id) {
				var iIndex = availabeColorsRgb.indexOf(pollination.label_color_rgb);
				if (iIndex >= 0) {
					availabeColorsRgb.splice(iIndex, 1);
				}
			}
		}
		return availabeColorsRgb;
	}

}