import { ActiveSeedPlantingsResult, BActiveFlorescence, BResultsActiveFlorescences, PollinationRead, SeedPlantingCreate, SeedPlantingPlantNameProposal, SeedPlantingRead, SeedPlantingUpdate } from "pollination/ui/interfaces/entities";
import ManagedObject from "sap/ui/base/ManagedObject";
import JSONModel from "sap/ui/model/json/JSONModel";
import TemporaryPollinationsHandler from "./PreviewPollinationHandler";
import Util from "./Util";
import PollinationsHandler from "./PollinationsHandler";

/**
 * @namespace pollination.ui.controller.custom
 */
export default class ActiveSeedPlantingsHandler extends ManagedObject {

	// private _oSeedPlantingsModel: JSONModel;
	private _oPollinationsHandler: PollinationsHandler;

	public constructor(oSeedPlantingsModel: JSONModel, oPollinationsHandler: PollinationsHandler) {
		super();
		// this._oSeedPlantingsModel = oSeedPlantingsModel;
		this._oPollinationsHandler = oPollinationsHandler;
	}

	// public async loadActiveSeedPlantings() {
	// 	const oResult = <ActiveSeedPlantingsResult> await Util.get(Util.getServiceUrl('active_seed_plantings'));
	// 	const aActiveSeedPlantings: SeedPlantingRead[] = oResult.active_seed_planting_collection;
	// 	this._oSeedPlantingsModel.setData(aActiveSeedPlantings);
	// 	this._oSeedPlantingsModel.updateBindings(false);
	// }

	public async createNewPlantForSeedPlanting(oSeedPlanting: SeedPlantingRead, sPlantName: string): Promise<PollinationRead[]>{
		await Util.post(Util.getServiceUrl('seed_plantings' + '/' + oSeedPlanting.id + '/plants'), {plant_name: sPlantName});
		// we return the reloaded pollinations here, because the caller needs it to display updates
		const aOngoingPollinations: PollinationRead[] = await this._oPollinationsHandler.loadPollinations();
		return aOngoingPollinations
	}

	public async proposePlantName(oSeedPlanting: SeedPlantingRead): Promise<string> {
		const oResult = <SeedPlantingPlantNameProposal> await Util.get(Util.getServiceUrl('seed_plantings' + '/' + oSeedPlanting.id + '/plant_name_proposal'));
		return oResult.plant_name_proposal;
	}

	public async saveNewSeedPlanting(oNewSeedPlanting: SeedPlantingCreate){
		await Util.post(Util.getServiceUrl('seed_plantings'), oNewSeedPlanting);
		this._oPollinationsHandler.loadPollinations();
		
	}

	public async updateSeedPlanting(oSeedPlanting: SeedPlantingUpdate) {
		await Util.put(Util.getServiceUrl('seed_plantings' + '/' + oSeedPlanting.id), oSeedPlanting);
		// await this.loadActiveSeedPlantings();
		this._oPollinationsHandler.loadPollinations();
	}

	public async deleteSeedPlanting(oSeedPlanting: SeedPlantingRead){
		await Util.del(Util.getServiceUrl('seed_plantings' + '/' + oSeedPlanting.id));
		// await this.loadActiveSeedPlantings();
		this._oPollinationsHandler.loadPollinations();
	}
}