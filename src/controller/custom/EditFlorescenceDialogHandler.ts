import { BActiveFlorescence } from "pollination/ui/interfaces/entities";
import { LEditFlorescenceInput } from "pollination/ui/interfaces/entitiesLocal";
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
export default class EditFlorescenceDialogHandler extends ManagedObject {

	private _oActiveFlorescencesHandler: ActiveFlorescencesHandler

	// todo type | undefined when destroyed?
	private _oEditedFlorescenceModel: JSONModel;  // "editedFlorescenceModel" attached to Dialog
	private _oEditFlorescenceDialog: Dialog;  // todo | type when destroyed, undefined?

	public constructor(oActiveFlorescencesHandler: ActiveFlorescencesHandler) {
		super();

		this._oActiveFlorescencesHandler = oActiveFlorescencesHandler;
	}

	public openDialogEditActiveFlorescence(oViewToAddTo: View, oCurrentFlorescence: BActiveFlorescence): void{ 
		// clone active florescence object for manipulation in the dialog
		// add some control attributes to allow for usage of sliders and keeping undefined values
		const oEditedFlorescence: LEditFlorescenceInput = JSON.parse(JSON.stringify(oCurrentFlorescence));  // todo entity
		oEditedFlorescence.flowers_count_known = !!oEditedFlorescence.flowers_count
		oEditedFlorescence.branches_count_known = !!oEditedFlorescence.branches_count
		oEditedFlorescence.inflorescence_appearance_date_known = !!oEditedFlorescence.inflorescence_appearance_date
		oEditedFlorescence.first_flower_opening_date_known = !!oEditedFlorescence.first_flower_opening_date
		oEditedFlorescence.last_flower_closing_date_known = !!oEditedFlorescence.last_flower_closing_date

		// open dialog
		Fragment.load({
			name: "pollination.ui.view.fragments.EditFlorescence",
			id: oViewToAddTo.getId(),
			controller: this
		}).then((oControl: Control | Control[]) => {
			this._oEditFlorescenceDialog = <Dialog>oControl;
			oViewToAddTo.addDependent(this._oEditFlorescenceDialog);  // required to bind fragment to view
			this._oEditedFlorescenceModel = new JSONModel(oEditedFlorescence);
			this._oEditFlorescenceDialog.setModel(this._oEditedFlorescenceModel, "editedFlorescenceModel");
			this._oEditFlorescenceDialog.open();
		});
	}


	private _askToDeleteFlorescence(iFlorescenceId: int): void {
		MessageBox.confirm("Really delete Florescence? This cannot be undone.",
			{ onClose: this._onConfirmDeleteFlorescence.bind(this, iFlorescenceId) }
		);
	}

	private _onConfirmDeleteFlorescence(iFlorescenceId: int, sAction: string): void {
		if (sAction === "OK")
			this._deleteFlorescence(iFlorescenceId);
		else 
            return;  // do nothing
	}

	private _deleteFlorescence(iFlorescenceId: int) {
		$.ajax({
			url: Util.getServiceUrl('florescences/' + iFlorescenceId),
			context: this,
			async: true,
			type: 'DELETE',
			contentType: 'application/json'
		})
			.done(this._cbDoneDeleteFlorescence)
			.fail(Util.onFail.bind(this, 'Delete florescences'))
	}

	private _cbDoneDeleteFlorescence() {
		this._oEditFlorescenceDialog.close();
		this._oActiveFlorescencesHandler.loadFlorescences();
	}

	public onPressDeleteFlorescence(oEvent: Event) {
		const oEditFlorescenceModel = <JSONModel>this._oEditFlorescenceDialog.getModel('editedFlorescenceModel')
		const oEditedFlorescence = <LEditFlorescenceInput>oEditFlorescenceModel.getData()
		const iFlorescenceId = oEditedFlorescence.id;
		// const iFlorescenceId = (<JSONModel>this.getView().getModel("editedFlorescenceModel")).getData().id;
		// const oDialogEditFlorescence = <Dialog>this.byId('editFlorescence');
		this._askToDeleteFlorescence(iFlorescenceId);
	}

	public onAfterCloseEditFlorescenceDialog(oEvent: Event) {
		// destroy model and fragment, works for both regular closing and hitting ESC
		// const oDialog = <Dialog>oEvent.getSource();
		const oEditFlorescenceModel = <JSONModel>this._oEditFlorescenceDialog.getModel('editedFlorescenceModel')
		oEditFlorescenceModel.destroy();
		this._oEditFlorescenceDialog.destroy();		
	}

	public onPressEditFlorescenceSetToday(sDateField: "inflorescence_appearance_date" | "first_flower_opening_date" | "last_flower_closing_date") {
		const oEditedFlorescence = <LEditFlorescenceInput>this._oEditedFlorescenceModel.getData();
		oEditedFlorescence[sDateField] = Util.getToday();  // e.g. '2022-11-17';
		this._oEditedFlorescenceModel.updateBindings(false);
	}

	public onPressSubmitEditFlorescence(oEvent: Event) {
		var oEditedFlorescence = <LEditFlorescenceInput>this._oEditedFlorescenceModel.getData();

		// the inputs are bound to the model and might update undefined values to default values
		// we need to set them back to undefined
		if (!oEditedFlorescence.branches_count_known) {
			oEditedFlorescence.branches_count = undefined;
		}
		if (!oEditedFlorescence.flowers_count_known) {
			oEditedFlorescence.flowers_count = undefined;
		}
		if (!oEditedFlorescence.inflorescence_appearance_date_known) {
			oEditedFlorescence.inflorescence_appearance_date = undefined;
		}
		if (!oEditedFlorescence.first_flower_opening_date_known) {
			oEditedFlorescence.first_flower_opening_date = undefined;
		}
		if (!oEditedFlorescence.last_flower_closing_date_known) {
			oEditedFlorescence.last_flower_closing_date = undefined;
		}

		// depending on florescence status, we might set some dates to undefined
		// todo better validate and cancel with message
		if (oEditedFlorescence.florescence_status === "inflorescence_appeared") {
			oEditedFlorescence.first_flower_opening_date = undefined;
			oEditedFlorescence.last_flower_closing_date = undefined;
		} else if (oEditedFlorescence.florescence_status === "flowering") {
			oEditedFlorescence.last_flower_closing_date = undefined;
		} else if (oEditedFlorescence.florescence_status === "finished") {
			// nothing to do
		} else {
			throw new Error("Unknown florescence status: " + oEditedFlorescence.florescence_status);
		}

		var oEditedFlorescenceJson = JSON.stringify(oEditedFlorescence);
		$.ajax({
			url: Util.getServiceUrl('active_florescences/' + oEditedFlorescence.id),
			data: oEditedFlorescenceJson,
			context: this,
			async: true,
			type: 'PUT',
			contentType: 'application/json'
		})
			.done(this._onDonePutFlorescence)
			.fail(Util.onFail.bind(this, 'Update florescence'))
	}

	private _onDonePutFlorescence() {
		this._oEditFlorescenceDialog.close();
		this._oActiveFlorescencesHandler.loadFlorescences();
	}
	onCancelDialog(oEvent: Event) {
		this._oEditFlorescenceDialog.close();
	}	

}