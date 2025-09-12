import { BPlantForNewFlorescence, BResultsPlantsForNewFlorescence, FRequestNewFlorescence } from "pollination/ui/interfaces/entities";
import { LNewFlorescenceInputData } from "pollination/ui/interfaces/entitiesLocal";
import { FlorescenceStatus } from "pollination/ui/interfaces/enums";
import Dialog, { Dialog$AfterCloseEvent } from "sap/m/Dialog";
import ManagedObject from "sap/ui/base/ManagedObject";
import Control from "sap/ui/core/Control";
import Fragment from "sap/ui/core/Fragment";
import View from "sap/ui/core/mvc/View";
import JSONModel from "sap/ui/model/json/JSONModel";
import ActiveFlorescencesHandler from "./ActiveFlorescencesHandler";
import Util from "./Util";
import { Button$PressEvent } from "sap/m/Button";
import MessageBox from "sap/m/MessageBox";
import Event from "sap/ui/base/Event";
import { SegmentedButtonItem$PressEvent } from "sap/m/SegmentedButtonItem";
import PollinationStatisticsHandler from "./PollinationStatisticsHandler";

/**
 * @namespace pollination.ui.controller.custom
 */
export default class PollinationStatisticsDialogHandler extends ManagedObject {

	private _oPollinationStatisticsDialog: Dialog;
	private _oPollinationStatisticsHandler: PollinationStatisticsHandler;

	public constructor(oPollinationStatisticsHandler: PollinationStatisticsHandler) {
		super();
		this._oPollinationStatisticsHandler = oPollinationStatisticsHandler;
	}

	public openDialog(oViewToAddTo: View): void {
		Fragment.load({
			name: "pollination.ui.view.fragments.PollinationStatistics",
			id: oViewToAddTo.getId(),
			controller: this,
		}).then(async (oControl: Control | Control[]) => {
			this._oPollinationStatisticsDialog = <Dialog>oControl;
			oViewToAddTo.addDependent(this._oPollinationStatisticsDialog);
			await this._oPollinationStatisticsHandler.loadPollinationStatistics();
			this._oPollinationStatisticsDialog.setModel(this._oPollinationStatisticsHandler.getModel(), "pollination_statistics");
			this._oPollinationStatisticsDialog.open();
		});
	}

	onPressClose(oEvent: Button$PressEvent) {
		this._oPollinationStatisticsDialog.close();
	}

	onAfterClose(oEvent: Dialog$AfterCloseEvent) {
		this._oPollinationStatisticsDialog.destroy();
	}
	onPressRefresh(oEvent: Button$PressEvent) {
		this._oPollinationStatisticsHandler.refreshPollinationStatistics();
	}
}