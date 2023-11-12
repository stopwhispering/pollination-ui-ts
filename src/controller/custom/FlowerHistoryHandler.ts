import { BFloweringPeriodState, BPlantFlowerHistory, BResultsFlowerHistory, FlowerHistory, FlowerHistoryMonth, FlowerHistoryPlant, FlowerHistoryYear } from "pollination/ui/interfaces/entities";
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
			mergeDuplicates: true,
			header: new Label({
				text: 'Plant',
				textAlign: TextAlign.Center,
				wrapping: true,
			},)
		});
	}

	private _createPeriodHeaderColumn(sMonth: string): Column{
		const sCurrentMonth = new Date().toISOString().substring(5, 7);
		return new Column({
			width: "1rem",
			styleClass: sCurrentMonth == sMonth ? "flowerHistoryCurrentMonth": "",
			header: new Label({
				text: sMonth,
				textAlign: TextAlign.Center,
				})
		})		
	}

	private _createYearHeaderColumn(): Column{
		return new Column({
			width: "1.5rem",
			header: new Label({
				text: "Year",
				textAlign: TextAlign.Center,
			})
		});
	}

	private _createPeriodCell(oPeriodState: FlowerHistoryMonth): Control{
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

	private _populateFlowerHistory(oResults: FlowerHistory): void {
		// create a column for each month in the flower history (in addition to the plant name as left-most column)
		this._oFlowerHistoryList.removeAllColumns();
		this._oFlowerHistoryList.addColumn(this._createPlantHeaderColumn());
		this._oFlowerHistoryList.addColumn(this._createYearHeaderColumn());

		for (let i = 1; i < 13; i++) {
			const sMonth = i.toString().padStart(2, '0');
			this._oFlowerHistoryList.addColumn(this._createPeriodHeaderColumn(sMonth));
		};

		// one row per plant and year
		oResults.plants.forEach(oFlowerHistoryPlant => {

			oFlowerHistoryPlant.years.forEach(oFlowerHistoryYear => {

				const aCells: Control[] = []
				aCells.push(new Text({ text: oFlowerHistoryPlant.plant_name }));
				aCells.push(new Text({ text: oFlowerHistoryYear.year }));
	
				for (let j = 0; j < oFlowerHistoryYear.months.length; j++) {
					const oFlowerHistoryMonth: FlowerHistoryMonth = oFlowerHistoryYear.months[j];
					aCells.push(this._createPeriodCell(oFlowerHistoryMonth));
				}

				const oListItem = new ColumnListItem({
					cells: aCells,
				});
				this._oFlowerHistoryList.addItem(oListItem);
			})
		})
	}

	onAfterCloseFlowerHistory(oEvent: Event) {
		this._oFlowerHistoryDialog.destroy();
	}
}