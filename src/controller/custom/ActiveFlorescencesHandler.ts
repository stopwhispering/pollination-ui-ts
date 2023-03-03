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

	public async loadFlorescences() {
		const oResult = <BResultsActiveFlorescences> await Util.get(Util.getServiceUrl('active_florescences'));
		const aActiveFlorescences: BActiveFlorescence[] = oResult.active_florescence_collection;
		this._oFlorescenceModel.setData(aActiveFlorescences);
		this._oTemporaryPollinationsHandler.resetTempPollinationFlorescence();
	}
}