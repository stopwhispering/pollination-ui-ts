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
		this._aUnsavedPollinations.splice(index, 1);
		this._oUnsavedPollinationsModel.updateBindings(false);
	}

	public savePollination(oPollination: PollinationCreate) {
		$.ajax({
			url: Util.getServiceUrl('pollinations'),
			data: JSON.stringify(oPollination),
			context: this,
			async: true,
			type: 'POST',
			contentType: 'application/json'
		})
			.done(this._onDonePostNewPollination.bind(this, oPollination))
			.fail(Util.onFail.bind(this, 'Save new pollinations'))
	}

	public addPollination(oPollination: LUnsavedPollination) {
		this._aUnsavedPollinations.push(oPollination);
		this._oUnsavedPollinationsModel.updateBindings(false);
	}

	private _onDonePostNewPollination(oPollination: LUnsavedPollination) {
		// having posted a new pollination, re-read the ongoing pollinations list
		this._oPollinationsHandler.loadPollinations();

		// also re-read the active florescences list
		// this._oActiveFlorescencesHandler.loadFlorescences();

		// remove saved new pollination from new pollinations model 
		this.removePollination(oPollination);
	}
	
	public getAvailableColors(florescence: Florescence): string[] {
		// determine available colors based on the colors we received from backend for the currently selected
		// florescence and the colors we already used for unsaved pollinations 

		// clone available colors from those we received from backend so we don't modify the original below
		var availabeColorsRgb = JSON.parse(JSON.stringify(florescence.available_colors_rgb));

		// remove colors from unsaved pollinations
		for (var i = 0; i < this._aUnsavedPollinations.length; i++) {
			var pollination = this._aUnsavedPollinations[i];
			// if (this._new_temp_pollination.florescenceId === pollination.florescenceId) {
			if (florescence.id === pollination.florescenceId) {
				var iIndex = availabeColorsRgb.indexOf(pollination.label_color_rgb);
				if (iIndex >= 0) {
					availabeColorsRgb.splice(iIndex, 1);
				}
			}
		}
		return availabeColorsRgb;
	}

}