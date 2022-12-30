import { FRequestNewFlorescence } from "pollination/ui/interfaces/entities";
import { LNewFlorescenceInputData } from "pollination/ui/interfaces/entitiesLocal";
import Dialog from "sap/m/Dialog";
import MessageBox from "sap/m/MessageBox";
import ManagedObject from "sap/ui/base/ManagedObject";
import JSONModel from "sap/ui/model/json/JSONModel";
import Util from "./Util";

/**
 * @namespace pollination.ui.controller.custom
 */
export default class FlorescenceCRUD extends ManagedObject {

	public saveNewFlorescence(oNewFlorescenceDialog: Dialog, fnLoadActiveFlorescences: Function): void {
		var oNewFlorescenceModel = <JSONModel>oNewFlorescenceDialog.getModel("newFlorescenceModel");
		var oNewFlorescence: LNewFlorescenceInputData = oNewFlorescenceModel.getData();
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
			.done(this._cbDonePostNewFlorescence.bind(this, oNewFlorescenceDialog, fnLoadActiveFlorescences))
			.fail(Util.onFail.bind(this, 'Create new florescence'))
	}

	private _cbDonePostNewFlorescence(oNewFlorescenceDialog: Dialog, fnLoadActiveFlorescences: Function): void {
		// having created a new active florescence in the backend, we close the 
		// new-floresecence-dialog and reload the active florescences
		oNewFlorescenceDialog.close();
        fnLoadActiveFlorescences();
	}

	public askToDeleteFlorescence(iFlorescenceId: int, oDialogEditFlorescence: Dialog, fnLoadActiveFlorescences: Function): void {
		MessageBox.confirm("Really delete Florescence? This cannot be undone.",
			{ onClose: this._onConfirmDeleteFlorescence.bind(this, iFlorescenceId, oDialogEditFlorescence, fnLoadActiveFlorescences) }
		);
	}

	private _onConfirmDeleteFlorescence(iFlorescenceId: int, oDialogEditFlorescence: Dialog, fnLoadActiveFlorescences: Function, sAction: string): void {
		if (sAction === "OK")
			this._deleteFlorescence(iFlorescenceId, oDialogEditFlorescence, fnLoadActiveFlorescences);
		else 
            return;  // do nothing
	}

	private _deleteFlorescence(iFlorescenceId: int, oDialogEditFlorescence: Dialog, fnLoadActiveFlorescences: Function) {
		$.ajax({
			url: Util.getServiceUrl('florescences/' + iFlorescenceId),
			context: this,
			async: true,
			type: 'DELETE',
			contentType: 'application/json'
		})
			.done(this._cbDoneDeleteFlorescence.bind(this, oDialogEditFlorescence, fnLoadActiveFlorescences))
			.fail(Util.onFail.bind(this, 'Delete florescences'))
	}

	private _cbDoneDeleteFlorescence(oDialogEditFlorescence: Dialog, fnLoadActiveFlorescences: Function) {
		oDialogEditFlorescence.close();
		fnLoadActiveFlorescences();
	}


}