import ManagedObject from "sap/ui/base/ManagedObject";
import JSONModel from "sap/ui/model/json/JSONModel";
import Util from "./Util";
import { Florescence, LUnsavedPollination } from "pollination/ui/interfaces/entitiesLocal";
import { BActiveFlorescence, BPotentialPollenDonor } from "pollination/ui/interfaces/entities";
import MessageToast from "sap/m/MessageToast";
import UnsavedPollinationsHandler from "./UnsavedPollinationsHandler";

/**
 * @namespace pollination.ui.controller.custom
 */
export default class PreviewPollinationHandler extends ManagedObject {

    private _oNewTempPollination: LUnsavedPollination;
    private _oNewTempPollinationInputModel: JSONModel;
	private _oUnsavedPollinationsHandler: UnsavedPollinationsHandler;

    public constructor(oNewTempPollinationInputModel: JSONModel, oUnsavedPollinationsHandler: UnsavedPollinationsHandler) {
        super();
        this._oNewTempPollinationInputModel = oNewTempPollinationInputModel;
		this._oUnsavedPollinationsHandler = oUnsavedPollinationsHandler;
		
		this._oNewTempPollination = {
			pollinationTimestamp: Util.format_timestamp(new Date()),
			location: 'indoor_led',
			count: 1,
		}
		this._oNewTempPollinationInputModel.setData(this._oNewTempPollination);
		this.resetTempPollinationFlorescence();
		this.resetTempPollinationPollen();
    }

	public setFlorescencePlant(oFlorescence: Florescence){
		this._oNewTempPollination.florescencePlantName = oFlorescence.plant_name;
		this._oNewTempPollination.florescencePlantId = oFlorescence.plant_id;
		this._oNewTempPollination.florescenceId = oFlorescence.id;
		this._oNewTempPollination.florescenceStatus = oFlorescence.florescence_status;  // for enabling/disabling preview button
		this._oNewTempPollinationInputModel
		this._oNewTempPollinationInputModel.updateBindings(false);
	}

	public setPollenDonorPlant(oPollenDonor: BPotentialPollenDonor){
		this._oNewTempPollination.pollenDonorPlantName = oPollenDonor.plant_name;
		this._oNewTempPollination.pollenDonorPlantId = oPollenDonor.plant_id;
		this._oNewTempPollination.pollenType = oPollenDonor.pollen_type;
		this._oNewTempPollinationInputModel.updateBindings(false);
	}

	public setLabelColorRGB(sColor: string){
		this._oNewTempPollination.labelColorRgb = sColor;
		this._oNewTempPollinationInputModel.updateBindings(false);
	}

	public setAvailableColors(aColors: string[]){
		this._oNewTempPollination.availableColorsRgb = aColors;
		this._oNewTempPollinationInputModel.updateBindings(false);
	}

	public resetTempPollinationFlorescence() {
		this._oNewTempPollination.florescenceId = undefined;  // todo entity
		this._oNewTempPollination.florescencePlantName = undefined;
		this._oNewTempPollination.florescencePlantId = undefined;
		this._oNewTempPollination.florescenceStatus = undefined;
		this._oNewTempPollination.availableColorsRgb = ['transparent', 'black'];  // technically required placeholders
		this._oNewTempPollination.labelColorRgb = "transparent";
		// (<JSONModel>this.getView().getModel('newTempPollinationInput')).updateBindings(false);
		this._oNewTempPollinationInputModel.updateBindings(false);
	}

	public resetTempPollinationPollen() {
		this._oNewTempPollination.pollenDonorPlantName = undefined;
		this._oNewTempPollination.pollenDonorPlantId = undefined;
		this._oNewTempPollination.pollenType = undefined;
		// (<JSONModel>this.getView().getModel('newTempPollinationInput')).updateBindings(false);
		this._oNewTempPollinationInputModel.updateBindings(false);
	}

	public preview(oFlorescence: BActiveFlorescence, oPollenDonor: BPotentialPollenDonor) {
		if (this._oNewTempPollination.florescencePlantName !== oFlorescence.plant_name
			|| this._oNewTempPollination.pollenDonorPlantName !== oPollenDonor.plant_name) {
			MessageToast.show('Bad Plant Names.')
			return;
		}

		let locationText;
		switch (this._oNewTempPollination.location) {
			case 'indoor_led': locationText = 'indoor LED'; break;
			case 'indoor': locationText = 'indoor'; break;
			case 'outdoor': locationText = 'outdoor'; break;
			default:
				MessageToast.show('Bad Location.')
				return;
		}

		if (!this._oNewTempPollination.labelColorRgb || this._oNewTempPollination.labelColorRgb === '' || this._oNewTempPollination.labelColorRgb === 'transparent') {
			MessageToast.show('Choose Color first.')
			return;
		}

		// add new pollination to unsaved pollinations
		const oNewPollination = <LUnsavedPollination>{
			florescenceId: this._oNewTempPollination.florescenceId,
			seedCapsulePlantName: oFlorescence.plant_name,
			seedCapsulePlantId: oFlorescence.plant_id,
			pollenDonorPlantName: oPollenDonor.plant_name,
			pollenDonorPlantId: oPollenDonor.plant_id,
			pollenType: this._oNewTempPollination.pollenType,
			pollinationTimestamp: this._oNewTempPollination.pollinationTimestamp,  // '%Y-%m-%d %H:%M' without seconds
			location: this._oNewTempPollination.location,
			locationText: locationText,
			count: this._oNewTempPollination.count,
			labelColorRgb: this._oNewTempPollination.labelColorRgb
		}
		this._oUnsavedPollinationsHandler.addPollination(oNewPollination);
		// this._new_pollinations.push(oNewPollination);
		// (<JSONModel>this.getView().getModel("newPollinationsModel")).updateBindings(false);

		// remove label color from available colors for this florescence
		this._oNewTempPollination.labelColorRgb = 'transparent';
		this._oNewTempPollination.availableColorsRgb = this._oUnsavedPollinationsHandler.getAvailableColors(oFlorescence);
		this._oNewTempPollinationInputModel.updateBindings(false);



	}


}