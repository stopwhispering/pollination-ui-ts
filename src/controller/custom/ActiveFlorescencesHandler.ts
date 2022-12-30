import { BActiveFlorescence, BResultsActiveFlorescences } from "pollination/ui/interfaces/entities";
import ManagedObject from "sap/ui/base/ManagedObject";
import JSONModel from "sap/ui/model/json/JSONModel";
import TemporaryPollinationsHandler from "./PreviewPollinationHandler";
import Util from "./Util";

/**
 * @namespace pollination.ui.controller.custom
 */
export default class ActiveFlorescencesHandler extends ManagedObject {

	private _oFlorescenceModel: JSONModel;
	private _oTemporaryPollinationsHandler: TemporaryPollinationsHandler;

	public constructor(oFlorescenceModel: JSONModel, oTemporaryPollinationsHandler: TemporaryPollinationsHandler) {
		super();
		this._oFlorescenceModel = oFlorescenceModel;
		this._oTemporaryPollinationsHandler = oTemporaryPollinationsHandler;
	}

	public loadFlorescences(): void {
		// load active florescences and reset the corresponding model
		$.ajax({
			url: Util.getServiceUrl('active_florescences'),
			data: {},
			context: this,
			async: true
		})
			.done(this._onDoneLoadActiveInflorescences)
			.fail(Util.onFail.bind(this, 'Load current florescences'))
	}

	private _onDoneLoadActiveInflorescences(results: BResultsActiveFlorescences): void {
		const aActiveFlorescences: BActiveFlorescence[] = results.activeFlorescenceCollection;
		this._oFlorescenceModel.setData(aActiveFlorescences);
		// var oModel = new JSONModel(aActiveFlorescences);
		// this.getView().setModel(oModel, "currentFlorescencesModel");

		// this._reset_temp_pollination_florescence();
		this._oTemporaryPollinationsHandler.resetTempPollinationFlorescence();
	}	
}