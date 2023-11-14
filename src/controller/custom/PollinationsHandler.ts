import ManagedObject from "sap/ui/base/ManagedObject";
import JSONModel from "sap/ui/model/json/JSONModel";
import Util from "./Util";
import { PollinationRead, BResultsOngoingPollinations } from "pollination/ui/interfaces/entities";

/**
 * @namespace pollination.ui.controller.custom
 */
export default class PollinationsHandler extends ManagedObject {

	private _oPollinationModel: JSONModel;
    private _oStateModel: JSONModel;

    public constructor(oPollinationModel: JSONModel, oStateModel: JSONModel) {
        super();
		
		this._oPollinationModel = oPollinationModel;
		this._oStateModel = oStateModel;
    }

	public async loadPollinations(): Promise<PollinationRead[]> {
		const include_ongoing_pollinations = this._oStateModel.getProperty('/include_ongoing_pollinations');
		const include_finished_pollinations = this._oStateModel.getProperty('/include_finished_pollinations');
		const sQueryParams = 'include_ongoing_pollinations=' + include_ongoing_pollinations + 
							 '&include_finished_pollinations=' + include_finished_pollinations;

		const oResult = <BResultsOngoingPollinations> await Util.get(Util.getServiceUrl('ongoing_pollinations?'+sQueryParams));
		const aOngoingPollinations = <PollinationRead[]>oResult.ongoing_pollination_collection;
		this._oPollinationModel.setData(aOngoingPollinations);
		return aOngoingPollinations;
	}
}