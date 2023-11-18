import ManagedObject from "sap/ui/base/ManagedObject";
import JSONModel from "sap/ui/model/json/JSONModel";
import Util from "./Util";
import { LUnsavedPollination } from "pollination/ui/interfaces/entitiesLocal";
import { BActiveFlorescence, BPotentialPollenDonor, PollinationCreate } from "pollination/ui/interfaces/entities";
import PollinationsHandler from "./PollinationsHandler";
import { PollenQuality } from "pollination/ui/interfaces/enums";


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

	public async savePollination(oUnsavedPollination: LUnsavedPollination) {
		// map all attributes from LUnsavedPollination to PollinationCreate
		const oPollination: PollinationCreate = {
			florescence_id: oUnsavedPollination.florescence_id,
			pollen_quality: oUnsavedPollination.goodPollenQuality ? PollenQuality.GOOD : PollenQuality.BAD,
			seed_capsule_plant_id: oUnsavedPollination.seed_capsule_plant_id,
			pollen_donor_plant_id: oUnsavedPollination.pollen_donor_plant_id,
			pollen_type: oUnsavedPollination.pollen_type!,
			pollinated_at: oUnsavedPollination.pollinated_at,
			label_color_rgb: oUnsavedPollination.label_color_rgb!,
			location: oUnsavedPollination.location,
			count_attempted: oUnsavedPollination.count_attempted,
		}

		await Util.post(Util.getServiceUrl('pollinations'), oPollination);

		// having posted a new pollination, re-read the ongoing pollinations list
		this._oPollinationsHandler.loadPollinations();

		// remove saved new pollination from new pollinations model 
		this.removePollination(oUnsavedPollination);
	}

	private addPollination(oPollination: LUnsavedPollination) {
		this._aUnsavedPollinations.push(oPollination);
		this._oUnsavedPollinationsModel.updateBindings(false);
	}

	public preview(oFlorescence: BActiveFlorescence, oPollenDonor: BPotentialPollenDonor) {

		// create unsaved pollination using mainly default values
		const oNewPollination: LUnsavedPollination = {
			florescence_id: oFlorescence.id,
			florescence_comment: oFlorescence.comment,
			seedCapsulePlantName: oFlorescence.plant_name,
			seed_capsule_plant_id: oFlorescence.plant_id,
			seed_capsule_plant_preview_image_id: oFlorescence.plant_preview_image_id,

			pollenDonorPlantName: oPollenDonor.plant_name,
			pollen_donor_plant_id: oPollenDonor.plant_id,
			pollen_donor_plant_preview_image_id: oPollenDonor.plant_preview_image_id,

			pollen_type: oPollenDonor.pollen_type,
			
			// defaults
			pollinated_at: Util.format_timestamp(new Date()),
			location: 'indoor',  // todo enum
			count_attempted: 1,
			label_color_rgb: "transparent",
			// pollen_quality: PollenQuality.GOOD,
			goodPollenQuality: true,  // not saved to backend but used to determine pollen_quality
		}
		this.addPollination(oNewPollination);
	}

}