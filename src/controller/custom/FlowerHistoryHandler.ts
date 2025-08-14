import { FlowerHistory } from "pollination/ui/interfaces/entities";
import Dialog, { Dialog$AfterCloseEvent } from "sap/m/Dialog";
import ManagedObject from "sap/ui/base/ManagedObject";
import Fragment from "sap/ui/core/Fragment";
import View from "sap/ui/core/mvc/View";
import Util from "./Util";
import Table from "sap/m/Table";
import Control from "sap/ui/core/Control";
import JSONModel from "sap/ui/model/json/JSONModel";
import { Button$PressEvent } from "sap/m/Button";
import { Switch$ChangeEvent } from "sap/m/Switch";

/**
 * @namespace pollination.ui.controller.custom
 */
export default class FlowerHistoryHandler extends ManagedObject {

	private _oFlowerHistoryDialog: Dialog;
	private _oFlowerHistoryList: Table;
	private _oStateModel: JSONModel;

	public constructor(oStateModel: JSONModel) {
		super();
		this._oStateModel = oStateModel;
	}

	public async openDialog(oViewToAddTo: View) {
		Fragment.load({
			name: "pollination.ui.view.fragments.FlowerHistory",
			id: oViewToAddTo.getId(),
			controller: this,
		}).then( async (oControl: Control | Control[]) => {
			this._oFlowerHistoryDialog = <Dialog>oControl;
			oViewToAddTo.addDependent(this._oFlowerHistoryDialog);
			this._oFlowerHistoryList = <Table>oViewToAddTo.byId("flowerHistoryList");
			this._oFlowerHistoryDialog.open();

			const flower_history_include_inactive = this._oStateModel.getProperty('/flower_history_include_inactive');
			const sUrl = Util.getServiceUrl('flower_history?include_inactive_plants=' + flower_history_include_inactive);
			const oFlowerHistory = <FlowerHistory> await Util.get(sUrl);
			const oFlowerHistoryModel = new JSONModel(oFlowerHistory);
			oFlowerHistoryModel.setSizeLimit(2000);
			this._oFlowerHistoryDialog.setModel(oFlowerHistoryModel, "flower_history");

			// highlight current month column
			const sCurrentMonth = new Date().toISOString().substring(5, 7);
			const iCurrentMonth = parseInt(sCurrentMonth);
			const iCurrentMonthColumnIndex = iCurrentMonth + 1;
			const oCurrentMonthColumn = this._oFlowerHistoryList.getColumns()[iCurrentMonthColumnIndex];
			oCurrentMonthColumn.setStyleClass("flowerHistoryCurrentMonth");

		});
	}

	onPressCloseFlowerHistory(oEvent: Button$PressEvent) {
		this._oFlowerHistoryDialog.close();
	}

	onAfterCloseFlowerHistory(oEvent: Dialog$AfterCloseEvent) {
		this._oFlowerHistoryDialog.destroy();
	}

	onSwitchIncludeInactivePlants(oEvent: Switch$ChangeEvent) {
		const bState = oEvent.getParameter("state");
		if (bState != this._oStateModel.getProperty("/flower_history_include_inactive")){
			throw new Error("State of flower_history_include_inactive does not match the state model");
		}

		//reload from backend
		const sUrl = Util.getServiceUrl('flower_history?include_inactive_plants=' + bState);
		Util.get(sUrl).then((oFlowerHistory: FlowerHistory) => {
			const oFlowerHistoryModel = new JSONModel(oFlowerHistory);
			oFlowerHistoryModel.setSizeLimit(2000);
			this._oFlowerHistoryDialog.setModel(oFlowerHistoryModel, "flower_history");
		});
	}
}