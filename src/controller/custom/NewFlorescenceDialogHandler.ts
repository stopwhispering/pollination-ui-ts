import { BPlantForNewFlorescence, BResultsPlantsForNewFlorescence, FRequestNewFlorescence } from "pollination/ui/interfaces/entities";
import { LNewFlorescenceInputData } from "pollination/ui/interfaces/entitiesLocal";
import { LFlorescenceStatus } from "pollination/ui/interfaces/enums";
import Dialog from "sap/m/Dialog";
import MessageBox from "sap/m/MessageBox";
import ManagedObject from "sap/ui/base/ManagedObject";
import Control from "sap/ui/core/Control";
import Fragment from "sap/ui/core/Fragment";
import View from "sap/ui/core/mvc/View";
import JSONModel from "sap/ui/model/json/JSONModel";
import ActiveFlorescencesHandler from "./ActiveFlorescencesHandler";
import Util from "./Util";
import Event from "sap/ui/base/Event";

/**
 * @namespace pollination.ui.controller.custom
 */
export default class NewFlorescenceDialogHandler extends ManagedObject {
	private _oActiveFlorescencesHandler: ActiveFlorescencesHandler

	private _oNewFlorescenceDialog: Dialog;  // todo | type when destroyed, undefined?
	private _oNewFlorescenceModel: JSONModel;

	public constructor(oActiveFlorescencesHandler: ActiveFlorescencesHandler) {
		super();
		this._oActiveFlorescencesHandler = oActiveFlorescencesHandler;
	}

	public openDialogNewActiveFlorescence(oViewToAddTo: View): void {
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
		this._oNewFlorescenceModel = new JSONModel(oNewFlorescence);

		Fragment.load({
			name: "pollination.ui.view.fragments.NewActiveFlorescence",
			id: oViewToAddTo.getId(),
			controller: oViewToAddTo.getController()
		}).then((oControl: Control | Control[]) => {
			this._oNewFlorescenceDialog = <Dialog>oControl;
			// const oDialog = <Dialog>oControl;
			oViewToAddTo.addDependent(this._oNewFlorescenceDialog);
			this._oNewFlorescenceDialog.setModel(this._oNewFlorescenceModel, "newFlorescenceModel");
			this._oNewFlorescenceDialog.open();

			$.ajax({
				url: Util.getServiceUrl('plants_for_new_florescence'),
				context: this,
				async: true,
				contentType: 'application/json'
			})
				.done(this._onDoneGetPlantsForNewFlorescence.bind)
				.fail(Util.onFail.bind(this, 'Get plants for new florescence dialog'))
		});
	}

	private _onDoneGetPlantsForNewFlorescence(oResults: BResultsPlantsForNewFlorescence): void {
		const aPlants: BPlantForNewFlorescence[] = oResults.plantsForNewFlorescenceCollection;
		var oPlantsModel = new JSONModel(aPlants);
		oPlantsModel.setSizeLimit(2000);
		this._oNewFlorescenceDialog.setModel(oPlantsModel, "plantsForNewFlorescenceModel");
	}


	private _cbDonePostNewFlorescence(): void {
		// having created a new active florescence in the backend, we close the 
		// new-floresecence-dialog and reload the active florescences
		this._oNewFlorescenceDialog.close();
		this._oActiveFlorescencesHandler.loadFlorescences();
	}

	public onPressSubmitNewFlorescence(oEvent: Event): void {
		// var oNewFlorescenceModel = <JSONModel>oNewFlorescenceDialog.getModel("newFlorescenceModel");
		const oNewFlorescence: LNewFlorescenceInputData = this._oNewFlorescenceModel.getData();
		const oNewFlorescenceRequest: FRequestNewFlorescence = {
			plant_id: oNewFlorescence.plant_id!,  // can't click submit without selecting a plant before
			florescence_status: oNewFlorescence.florescence_status,
			inflorescence_appearance_date: oNewFlorescence.inflorescence_appearance_date,
			comment: oNewFlorescence.comment
		}
		$.ajax({
			url: Util.getServiceUrl('active_florescences'),
			data: JSON.stringify(oNewFlorescenceRequest),
			context: this,
			async: true,
			type: 'POST',
			contentType: 'application/json'
		})
			.done(this._cbDonePostNewFlorescence.bind)
			.fail(Util.onFail.bind(this, 'Create new florescence'))
	}

	public onAfterCloseNewActiveFlorescence(oEvent: Event) {
		// var oDialog = <Dialog>oEvent.getSource();
		this._oNewFlorescenceDialog.getModel("plantsForNewFlorescenceModel").destroy();
		this._oNewFlorescenceModel.destroy();
		this._oNewFlorescenceDialog.destroy();
	}
	onCancelDialog(oEvent: Event) {
		this._oNewFlorescenceDialog.close();
	}
	
	onPressNewFlorescenceSetToday(oEvent: Event) {
		const oNewFlorescence = <LNewFlorescenceInputData>this._oNewFlorescenceModel.getData();
		oNewFlorescence.inflorescence_appearance_date = Util.getToday();  // e.g. '2022-11-17';
		this._oNewFlorescenceModel.updateBindings(false);
	}
}