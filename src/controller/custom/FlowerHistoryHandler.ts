import { BFloweringPeriodState, BPlantFlowerHistory, BResultsFlowerHistory } from "pollination/ui/interfaces/entities";
import Dialog from "sap/m/Dialog";
import ManagedObject from "sap/ui/base/ManagedObject";
import Fragment from "sap/ui/core/Fragment";
import View from "sap/ui/core/mvc/View";
import Util from "./Util";
import Event from "sap/ui/base/Event";
import Table from "sap/m/Table";
import Column from "sap/m/Column";
import Label from "sap/m/Label";
import Text from "sap/m/Text";
import ColumnListItem from "sap/m/ColumnListItem";
import { TextAlign } from "sap/ui/core/library";
import Control from "sap/ui/core/Control";
import VBox from "sap/m/VBox";
import FlexBox from "sap/m/FlexBox";

/**
 * @namespace pollination.ui.controller.custom
 */
export default class FlowerHistoryHandler extends ManagedObject {

	private _oFlowerHistoryDialog: Dialog;
	private _oFlowerHistoryList: Table;

	public constructor() {
		super();
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

			const oResult = <BResultsFlowerHistory> await Util.get(Util.getServiceUrl('flower_history'))
			this._populateFlowerHistory(oResult);

		});
	}

	private _createPlantHeaderColumn(): Column{
		return new Column({
			width: "5rem",
			header: new Label({
				text: 'Plant',
				textAlign: TextAlign.Center,
				wrapping: true,
			})
		});
	}

	private _createPeriodHeaderColumn(sMonth: string): Column{
		const oHeaderVBox = new VBox();
		if (sMonth.endsWith('01')){
			oHeaderVBox.addItem(new Label({
				text: sMonth.substring(2, 4),
				textAlign: TextAlign.Center,
			}));
		} else {
			oHeaderVBox.addItem(new Label({
				text: "",
				textAlign: TextAlign.Center,
			}));
		}
		oHeaderVBox.addItem(new Label({
			text: sMonth.substring(5, 7),
			textAlign: TextAlign.Center,
		}));
		return new Column({
			width: "1rem",
			header: new VBox({
				items: [oHeaderVBox]
			})
			
		});
	}

	private _createPeriodCell(oPeriodState: BFloweringPeriodState): Control{
		const oFlexBox = new FlexBox({items: [new Label()]});
		if (oPeriodState.flowering_state === "flowering"){
			oFlexBox.addStyleClass("floweringColor");
		} else if (oPeriodState.flowering_state === "seeds_ripening"){
			oFlexBox.addStyleClass("seedsRipeningColor");
		} else if (oPeriodState.flowering_state === "inflorescence_growing"){
			oFlexBox.addStyleClass("inflorescenceColor");
		} else if (oPeriodState.flowering_state === "not_flowering"){
			// do nothing
		} else {
			throw new Error("Unknown flowering state: " + oPeriodState.flowering_state);
		}
		return oFlexBox;
	}

	private _populateFlowerHistory(oResults: BResultsFlowerHistory): void {
		// create a column for each month in the flower history (in addition to the plant name as left-most column)
		this._oFlowerHistoryList.removeAllColumns();
		this._oFlowerHistoryList.addColumn(this._createPlantHeaderColumn());

		for (let i = 0; i < oResults.months.length; i++) {
			const sMonth = oResults.months[i];
			this._oFlowerHistoryList.addColumn(this._createPeriodHeaderColumn(sMonth));
		};


		for (let i = 0; i < oResults.plants.length; i++) {
			const oPlantHistory: BPlantFlowerHistory = oResults.plants[i];

			const oPlantNameCell = new Text({ text: oPlantHistory.plant_name });
			const aCells: Control[] = [oPlantNameCell];
			for (let j = 0; j < oPlantHistory.periods.length; j++) {
				const oPeriod: BFloweringPeriodState = oPlantHistory.periods[j];
				aCells.push(this._createPeriodCell(oPeriod));
			}
			const oListItem = new ColumnListItem({
				cells: aCells,
			});
			this._oFlowerHistoryList.addItem(oListItem);
		}
	}

	onAfterCloseFlowerHistory(oEvent: Event) {
		this._oFlowerHistoryDialog.destroy();
	}
}