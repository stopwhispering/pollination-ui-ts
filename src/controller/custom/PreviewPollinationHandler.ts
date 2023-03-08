import ManagedObject from "sap/ui/base/ManagedObject";
import JSONModel from "sap/ui/model/json/JSONModel";
import Util from "./Util";
import { Florescence, LUnsavedPollination } from "pollination/ui/interfaces/entitiesLocal";
import { BActiveFlorescence, BPotentialPollenDonor } from "pollination/ui/interfaces/entities";
import MessageToast from "sap/m/MessageToast";
import UnsavedPollinationsHandler from "./UnsavedPollinationsHandler";
import { PollenQuality } from "pollination/ui/interfaces/enums";

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
			pollinated_at: Util.format_timestamp(new Date()),
			location: 'indoor_led',
			count: 1,
			goodPollenQuality: true,
			pollen_quality: PollenQuality.GOOD,
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
		this._oNewTempPollination.pollen_donor_plant_id = oPollenDonor.plant_id;
		this._oNewTempPollination.pollen_type = oPollenDonor.pollen_type;
		this._oNewTempPollinationInputModel.updateBindings(false);
	}

	public setLabelColorRGB(sColor: string){
		this._oNewTempPollination.label_color_rgb = sColor;
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
		this._oNewTempPollination.label_color_rgb = "transparent";
		this._oNewTempPollination.pollen_quality = PollenQuality.GOOD;
		this._oNewTempPollination.goodPollenQuality = true;
		// (<JSONModel>this.getView().getModel('newTempPollinationInput')).updateBindings(false);
		this._oNewTempPollinationInputModel.updateBindings(false);
	}

	public resetTempPollinationPollen() {
		this._oNewTempPollination.pollenDonorPlantName = undefined;
		this._oNewTempPollination.pollen_donor_plant_id = undefined;
		this._oNewTempPollination.pollen_type = undefined;
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

		if (!this._oNewTempPollination.label_color_rgb || this._oNewTempPollination.label_color_rgb === '' || this._oNewTempPollination.label_color_rgb === 'transparent') {
			MessageToast.show('Choose Color first.')
			return;
		}

		// add new pollination to unsaved pollinations
		const oNewPollination = <LUnsavedPollination>{
			florescenceId: this._oNewTempPollination.florescenceId,
			seedCapsulePlantName: oFlorescence.plant_name,
			seed_capsule_plant_id: oFlorescence.plant_id,
			pollenDonorPlantName: oPollenDonor.plant_name,
			pollen_donor_plant_id: oPollenDonor.plant_id,
			pollen_type: this._oNewTempPollination.pollen_type,
			pollinated_at: this._oNewTempPollination.pollinated_at,  // '%Y-%m-%d %H:%M' without seconds
			location: this._oNewTempPollination.location,
			locationText: locationText,
			count: this._oNewTempPollination.count,
			label_color_rgb: this._oNewTempPollination.label_color_rgb,
			pollen_quality: this._oNewTempPollination.goodPollenQuality ? PollenQuality.GOOD : PollenQuality.BAD,
		}
		this._oUnsavedPollinationsHandler.addPollination(oNewPollination);
		// this._new_pollinations.push(oNewPollination);
		// (<JSONModel>this.getView().getModel("newPollinationsModel")).updateBindings(false);

		// remove label color from available colors for this florescence
		this._oNewTempPollination.label_color_rgb = 'transparent';
		this._oNewTempPollination.availableColorsRgb = this._oUnsavedPollinationsHandler.getAvailableColors(oFlorescence);
		this._oNewTempPollinationInputModel.updateBindings(false);



	}


}