import ManagedObject from "sap/ui/base/ManagedObject";
import JSONModel from "sap/ui/model/json/JSONModel";
import Util from "./Util";
import { PollinationRead, BResultsOngoingPollinations } from "pollination/ui/interfaces/entities";

/**
 * @namespace pollination.ui.controller.custom
 */
export default class PollinationsHandler extends ManagedObject {

	private _oPollinationModel: JSONModel;

    public constructor(oPollinationModel: JSONModel) {
        super();
		
		this._oPollinationModel = oPollinationModel;
    }

	public async loadPollinations() {
		const oResult = <BResultsOngoingPollinations> await Util.get(Util.getServiceUrl('ongoing_pollinations'));
		const aOngoingPollinations = <PollinationRead[]>oResult.ongoing_pollination_collection;
		this._oPollinationModel.setData(aOngoingPollinations);
	}
}