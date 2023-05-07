import { PollinationRead, SeedPlantingCreate, SeedPlantingPlantNameProposal, SeedPlantingRead, SeedPlantingUpdate } from "pollination/ui/interfaces/entities";
import ManagedObject from "sap/ui/base/ManagedObject";
import JSONModel from "sap/ui/model/json/JSONModel";
import Util from "./Util";
import PollinationsHandler from "./PollinationsHandler";

/**
 * @namespace pollination.ui.controller.custom
 */
export default class ActiveSeedPlantingsHandler extends ManagedObject {

	private _oPollinationsHandler: PollinationsHandler;

	public constructor(oSeedPlantingsModel: JSONModel, oPollinationsHandler: PollinationsHandler) {
		super();
		this._oPollinationsHandler = oPollinationsHandler;
	}

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