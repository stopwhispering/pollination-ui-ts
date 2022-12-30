import { BPlantForNewFlorescence, BResultsPlantsForNewFlorescence } from "pollination/ui/interfaces/entities";
import { LNewFlorescenceInputData } from "pollination/ui/interfaces/entitiesLocal";
import { LFlorescenceStatus } from "pollination/ui/interfaces/enums";
import Button from "sap/m/Button";
import Dialog from "sap/m/Dialog";
import ManagedObject from "sap/ui/base/ManagedObject";
import Control from "sap/ui/core/Control";
import Fragment from "sap/ui/core/Fragment";
import View from "sap/ui/core/mvc/View";
import JSONModel from "sap/ui/model/json/JSONModel";
import Util from "./Util";

/**
 * @namespace pollination.ui.controller.custom
 */
export default class FlorescenceDialogHandler extends ManagedObject {

	public openDialogAddActiveFlorescence(oViewToAddTo: View, sFragmentPath: string): void {
		// open dialog to add a new florescence
		// create input model
		// trigger ajax call to get plants for new florescence to be displayed in select
		var oNewFlorescence: LNewFlorescenceInputData = {
			plant_id: undefined,
			plant_name: undefined,
			florescence_status: LFlorescenceStatus.INFLORESCENCE_APPEARED,
			inflorescence_appearance_date: undefined,
			comment: undefined
		}
		var oNewFlorescenceModel = new JSONModel(oNewFlorescence);

		Fragment.load({
			name: sFragmentPath,
			id: oViewToAddTo.getId(),
			controller: oViewToAddTo.getController()
		}).then((oControl: Control | Control[]) => {
			const oDialog = <Dialog>oControl;
			oViewToAddTo.addDependent(oDialog);
			oDialog.setModel(oNewFlorescenceModel, "newFlorescenceModel");
			oDialog.open();

			$.ajax({
				url: Util.getServiceUrl('plants_for_new_florescence'),
				context: this,
				async: true,
				contentType: 'application/json'
			})
				.done(this._onDoneGetPlantsForNewFlorescence.bind(this, oDialog))
				.fail(Util.onFail.bind(this, 'Get plants for new florescence dialog'))
		});
	}

	private _onDoneGetPlantsForNewFlorescence(oDialog: Dialog, oResults: BResultsPlantsForNewFlorescence): void {
		const aPlants: BPlantForNewFlorescence[] = oResults.plantsForNewFlorescenceCollection;
		var oPlantsModel = new JSONModel(aPlants);
		oPlantsModel.setSizeLimit(2000);
		oDialog.setModel(oPlantsModel, "plantsForNewFlorescenceModel");
	}

	public openDialogEditActiveFlorescence(oViewToAddTo: View, sFragmentPath: string, oCurrentFlorescence): void {  // todo entity
		// clone active florescence object for manipulation in the dialog
		var oEditedFlorescence = JSON.parse(JSON.stringify(oCurrentFlorescence));  // todo entity

		// add some control attributes to allow for usage of sliders and keeping undefined values
		oEditedFlorescence.flowers_count_known = !!oEditedFlorescence.flowers_count
		oEditedFlorescence.branches_count_known = !!oEditedFlorescence.branches_count
		oEditedFlorescence.inflorescence_appearance_date_known = !!oEditedFlorescence.inflorescence_appearance_date
		oEditedFlorescence.first_flower_opening_date_known = !!oEditedFlorescence.first_flower_opening_date
		oEditedFlorescence.last_flower_closing_date_known = !!oEditedFlorescence.last_flower_closing_date

		// open dialog
		Fragment.load({
			name: sFragmentPath,
			id: oViewToAddTo.getId(),
			controller: oViewToAddTo.getController()
		}).then((oControl: Control | Control[]) => {
			const oDialog = <Dialog>oControl;
			oViewToAddTo.addDependent(oDialog);  // required to bind fragment to view
			var oEditedFlorescenceModel = new JSONModel(oEditedFlorescence);
			oDialog.setModel(oEditedFlorescenceModel, "editedFlorescenceModel");
			oDialog.open();
		});
	}

}