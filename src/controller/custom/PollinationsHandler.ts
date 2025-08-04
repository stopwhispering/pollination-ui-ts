import ManagedObject from "sap/ui/base/ManagedObject";
import JSONModel from "sap/ui/model/json/JSONModel";
import Util from "./Util";
import { PollinationRead, GetPollinationsResponse, UniqueCapsulePlant } from "pollination/ui/interfaces/entities";

/**
 * @namespace pollination.ui.controller.custom
 */
export default class PollinationsHandler extends ManagedObject {

	private _oPollinationModel: JSONModel;
	private _oUniqueCapsulePlantsModel: JSONModel;
    private _oStateModel: JSONModel;

    public constructor(oPollinationModel: JSONModel, oUniqueCapsulePlantsModel: JSONModel, oStateModel: JSONModel) {
        super();
		
		this._oPollinationModel = oPollinationModel;
		this._oUniqueCapsulePlantsModel = oUniqueCapsulePlantsModel;
		this._oStateModel = oStateModel;
    }

	public async loadPollinations(): Promise<PollinationRead[]> {
		const include_ongoing_pollinations = this._oStateModel.getProperty('/include_ongoing_pollinations');
		const include_recently_finished_pollinations = this._oStateModel.getProperty('/include_recently_finished_pollinations');
		const include_finished_pollinations = this._oStateModel.getProperty('/include_finished_pollinations');
		const sQueryParams = 'include_ongoing_pollinations=' + include_ongoing_pollinations + 
							 '&include_recently_finished_pollinations=' + include_recently_finished_pollinations +
							 '&include_finished_pollinations=' + include_finished_pollinations;

		const oResult = <GetPollinationsResponse> await Util.get(Util.getServiceUrl('ongoing_pollinations?'+sQueryParams));
		const aOngoingPollinations = <PollinationRead[]>oResult.ongoing_pollination_collection;
		this._oPollinationModel.setData(aOngoingPollinations);

		// For filtering, we also need a list of unique capsule plant IDs and then add their respective name
		// const aUniqueCapsulePlantIds = Array.from(new Set(aOngoingPollinations.map(pollination => pollination.seed_capsule_plant_id)));
		const aOldUniqueCapsulePlants = this._oUniqueCapsulePlantsModel.getData() || [];
		const aCurrentlySelectedPlantIds = aOldUniqueCapsulePlants.filter((capsule: UniqueCapsulePlant) => capsule.selected).map((capsule: UniqueCapsulePlant) => capsule.plant_id);
		
		const aUniqueSeedCapsulePlants = Array.from(new Set(aOngoingPollinations.map(pollination => pollination.seed_capsule_plant_id)))
			.map(id => {
				const pollination = aOngoingPollinations.find(p => p.seed_capsule_plant_id === id);
				return {
					plant_id: id,
					plant_name: pollination ? pollination.seed_capsule_plant_name : '',
					selected: aCurrentlySelectedPlantIds.includes(id) // keep the selection state from the previous model; default to deselected (if all are deselected, the filter will not apply)
				};
			});
		// sort by plant id
		aUniqueSeedCapsulePlants.sort((a, b) => a.plant_id - b.plant_id);
		this._oUniqueCapsulePlantsModel.setData(aUniqueSeedCapsulePlants);

		return aOngoingPollinations;
	}
}