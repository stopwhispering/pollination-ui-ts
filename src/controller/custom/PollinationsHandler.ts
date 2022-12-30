import ManagedObject from "sap/ui/base/ManagedObject";
import JSONModel from "sap/ui/model/json/JSONModel";
import Util from "./Util";
import { BOngoingPollination, BResultsOngoingPollinations } from "pollination/ui/interfaces/entities";

/**
 * @namespace pollination.ui.controller.custom
 */
export default class PollinationsHandler extends ManagedObject {

	private _oPollinationModel: JSONModel;

    public constructor(oPollinationModel: JSONModel) {
        super();
		
		this._oPollinationModel = oPollinationModel;
    }

	public loadPollinations(): void {

		$.ajax({
			url: Util.getServiceUrl('ongoing_pollinations'),
			data: {},
			context: this,
			async: true
		})
			.done(this._onDoneLoadOngoingPollinations)
			.fail(Util.onFail.bind(this, 'Load ongoing pollinations'))
	}

	private _onDoneLoadOngoingPollinations(result: BResultsOngoingPollinations) {
		const aOngoingPollinations = <BOngoingPollination[]>result.ongoingPollinationCollection;
		this._oPollinationModel.setData(aOngoingPollinations);

		// var oModelOngoingPollinations = <JSONModel>this.getView().getModel("ongoingPollinationsModel");
		// if (!oModelOngoingPollinations) {
		// 	var oModelOngoingPollinations = new JSONModel(result.ongoingPollinationCollection);
		// 	this.getView().setModel(oModelOngoingPollinations, "ongoingPollinationsModel");
		// } else {
		// 	(<JSONModel>oModelOngoingPollinations).setData(result.ongoingPollinationCollection);
		// }
	}
}