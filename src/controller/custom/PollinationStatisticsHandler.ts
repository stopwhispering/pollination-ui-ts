// import { SettingsRead } from "pollination/ui/interfaces/entities";
import ManagedObject from "sap/ui/base/ManagedObject";
import JSONModel from "sap/ui/model/json/JSONModel";
import Util from "./Util";

/**
 * @namespace pollination.ui.controller.custom
 */
export default class PollinationStatisticsHandler extends ManagedObject {

    private _oPollinationStatisticsModel: JSONModel;

    public constructor(oPollinationStatisticsModel: JSONModel) {  
        super();
        this._oPollinationStatisticsModel = oPollinationStatisticsModel;
		const oPollinationStatistics = {};  //<SettingsRead>{};  //todo type
		this._oPollinationStatisticsModel.setData(oPollinationStatistics);
    }

	public async loadPollinationStatistics() {
		const oPollinationStatistics = await Util.get(Util.getServiceUrl('statistics/pollination_statistics'));
        this._oPollinationStatisticsModel.setData(oPollinationStatistics.statistics);
	}

    public async refreshPollinationStatistics() {
        await this.loadPollinationStatistics();
        this._oPollinationStatisticsModel.refresh();
    }
	
    public getModel(): JSONModel {
        return this._oPollinationStatisticsModel;
    }

}