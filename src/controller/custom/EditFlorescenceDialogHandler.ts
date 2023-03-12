import { BActiveFlorescence } from "pollination/ui/interfaces/entities";
import { LColorProperties, LEditFlorescenceInput } from "pollination/ui/interfaces/entitiesLocal";
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
import ColorPalettePopover from "sap/m/ColorPalettePopover";
import MessageToast from "sap/m/MessageToast";
import { FlorescenceStatus } from "pollination/ui/interfaces/enums";

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
		oEditedFlorescence.inflorescence_appeared_at_known = !!oEditedFlorescence.inflorescence_appeared_at
		oEditedFlorescence.first_flower_opened_at_known = !!oEditedFlorescence.first_flower_opened_at
		oEditedFlorescence.last_flower_closed_at_known = !!oEditedFlorescence.last_flower_closed_at

		oEditedFlorescence.perianth_size_known = (!!oEditedFlorescence.perianth_length && !!oEditedFlorescence.perianth_diameter);
		oEditedFlorescence.flower_colors_known = !!oEditedFlorescence.flower_color;
		oEditedFlorescence.stigma_position_known = !!oEditedFlorescence.stigma_position;

		if (!oEditedFlorescence.flower_colors_differentiation)
			oEditedFlorescence.flower_colors_differentiation = 'uniform';

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


	private async _askToDeleteFlorescence(iFlorescenceId: int) {
		MessageBox.confirm("Really delete Florescence? This cannot be undone.",
			{ onClose: this._onConfirmDeleteFlorescence.bind(this, iFlorescenceId) }
		);
	}

	private _onConfirmDeleteFlorescence(iFlorescenceId: int, sAction: string) {
		if (sAction === "OK")
			this._deleteFlorescence(iFlorescenceId);
		else 
            return;  // do nothing
	}

	private async _deleteFlorescence(iFlorescenceId: int) {
		await Util.del(Util.getServiceUrl('florescences/' + iFlorescenceId));
		this._oEditFlorescenceDialog.close();
		this._oActiveFlorescencesHandler.loadFlorescences();
	}

	public onPressDeleteFlorescence(oEvent: Event) {
		const oEditFlorescenceModel = <JSONModel>this._oEditFlorescenceDialog.getModel('editedFlorescenceModel')
		const oEditedFlorescence = <LEditFlorescenceInput>oEditFlorescenceModel.getData()
		const iFlorescenceId = oEditedFlorescence.id;
		this._askToDeleteFlorescence(iFlorescenceId);
	}

	public onAfterCloseEditFlorescenceDialog(oEvent: Event) {
		// destroy model and fragment, works for both regular closing and hitting ESC
		const oEditFlorescenceModel = <JSONModel>this._oEditFlorescenceDialog.getModel('editedFlorescenceModel')
		oEditFlorescenceModel.destroy();
		this._oEditFlorescenceDialog.destroy();		
	}

	public onPressEditFlorescenceSetToday(sDateField: "inflorescence_appeared_at" | "first_flower_opened_at" | "last_flower_closed_at") {
		const oEditedFlorescence = <LEditFlorescenceInput>this._oEditedFlorescenceModel.getData();
		oEditedFlorescence[sDateField] = Util.getToday();  // e.g. '2022-11-17';
		this._oEditedFlorescenceModel.updateBindings(false);
	}

	public onPressSubmitEditFlorescence(oEvent: Event) {
		var oEditedFlorescence = <LEditFlorescenceInput>this._oEditedFlorescenceModel.getData();
		this._submitEditedFlorescence(oEditedFlorescence)
	}

	private async _submitEditedFlorescence(oEditedFlorescence: LEditFlorescenceInput){
		// the inputs are bound to the model and might update undefined values to default values
		// we need to set them back to undefined
		if (!oEditedFlorescence.branches_count_known) {
			oEditedFlorescence.branches_count = undefined;
		}
		if (!oEditedFlorescence.flowers_count_known) {
			oEditedFlorescence.flowers_count = undefined;
		}
		if (!oEditedFlorescence.inflorescence_appeared_at_known) {
			oEditedFlorescence.inflorescence_appeared_at = undefined;
		}
		if (!oEditedFlorescence.first_flower_opened_at_known) {
			oEditedFlorescence.first_flower_opened_at = undefined;
		}
		if (!oEditedFlorescence.last_flower_closed_at_known) {
			oEditedFlorescence.last_flower_closed_at = undefined;
		}
		if (!oEditedFlorescence.perianth_size_known) {
			oEditedFlorescence.perianth_length = undefined;
			oEditedFlorescence.perianth_diameter = undefined;
		}
		if (!oEditedFlorescence.stigma_position_known) {
			oEditedFlorescence.stigma_position = undefined;
		}
		if (!oEditedFlorescence.flower_colors_known) {
			oEditedFlorescence.flower_color = undefined;
			oEditedFlorescence.flower_color_second = undefined;
			oEditedFlorescence.flower_colors_differentiation = undefined;
		}
		if (oEditedFlorescence.flower_colors_differentiation === "uniform") {
			oEditedFlorescence.flower_color_second = undefined;
		}
		if ((oEditedFlorescence.flower_colors_differentiation === "top_bottom" || 
			oEditedFlorescence.flower_colors_differentiation === "striped" ||
			oEditedFlorescence.flower_colors_differentiation === "ovary_mouth")
			&& !oEditedFlorescence.flower_color_second) {
			MessageToast.show("Please pick second flower color");
			return;
		}

		// depending on florescence status, we might set some dates to undefined
		// todo better validate and cancel with message
		if (oEditedFlorescence.florescence_status === FlorescenceStatus.INFLORESCENCE_APPEARED) {
			oEditedFlorescence.first_flower_opened_at = undefined;
			oEditedFlorescence.last_flower_closed_at = undefined;
		} else if (oEditedFlorescence.florescence_status === FlorescenceStatus.FLOWERING) {
			oEditedFlorescence.last_flower_closed_at = undefined;
		} else if (oEditedFlorescence.florescence_status === FlorescenceStatus.FINISHED) {
			// nothing to do
		} else if (oEditedFlorescence.florescence_status === FlorescenceStatus.ABORTED) {
			// nothing to do
		} else {
			throw new Error("Unknown florescence status: " + oEditedFlorescence.florescence_status);
		}

		await Util.put(Util.getServiceUrl('active_florescences/' + oEditedFlorescence.id), oEditedFlorescence)
		this._oEditFlorescenceDialog.close();
		this._oActiveFlorescencesHandler.loadFlorescences();
	}

	onCancelDialog(oEvent: Event) {
		this._oEditFlorescenceDialog.close();
	}
	onFirstColorPress(oEvent: Event) {
		const oSource: Control = <Control>oEvent.getSource();
		this.openColorPalettePopover("flower_color", oSource)
	}

	onSecondColorPress(oEvent: Event) {
		const oSource: Control = <Control>oEvent.getSource();
		this.openColorPalettePopover("flower_color_second", oSource)
	}

	private openColorPalettePopover(color_property: LColorProperties, oSource: Control) {
		const oColorPalettePopoverCustom = new ColorPalettePopover({
			defaultColor: "white",
			showDefaultColorButton: false,
			colors: ["#292f36", "#4ecdc4", "#3a506b"],
			colorSelect: this._handleColorSelect.bind(this, this._oEditedFlorescenceModel, color_property)
		});
	// @ts-ignore
	oColorPalettePopoverCustom.openBy(oSource);
	}

	private _handleColorSelect(oEditedFlorescenceModel: JSONModel, color_property: LColorProperties, oEvent: Event) {
		let sColor = oEvent.getParameter('value');
		
		// color returns either a predefined color (only rgb hex codes, e.g. "#4ecdc4") or, if user picked 
		// a custom color, a rgb components string like 'rgb(112,31,31)'. in the latter case, we need to convert
		if (sColor.startsWith('rgb')) {
			sColor = Util.rgbToHex(sColor);
		} else if (!sColor.startsWith('#')) {
			throw new Error("Unknown color format: " + sColor);
		}

		const oEditedFlorescence = <LEditFlorescenceInput>oEditedFlorescenceModel.getData();
		oEditedFlorescence[color_property] = sColor;
		oEditedFlorescenceModel.updateBindings(false);
	}
	onPressAbortFlorescence(oEvent: Event) {
		const oEditFlorescenceModel = <JSONModel>this._oEditFlorescenceDialog.getModel('editedFlorescenceModel')
		const oEditedFlorescenceInput = <LEditFlorescenceInput>oEditFlorescenceModel.getData();
		oEditedFlorescenceInput.florescence_status = FlorescenceStatus.ABORTED;
		this._askToAbortFlorescence(oEditedFlorescenceInput);
	}

	private _askToAbortFlorescence(oEditedFlorescenceInput: LEditFlorescenceInput): void {
		MessageBox.confirm("Really set Florescence aborted? This cannot be undone.",
			{ onClose: this._onConfirmAbortFlorescence.bind(this, oEditedFlorescenceInput) }
		);
	}

	private _onConfirmAbortFlorescence(oEditedFlorescenceInput: LEditFlorescenceInput, sAction: string): void {
		if (sAction === "OK")
		 	this._submitEditedFlorescence(oEditedFlorescenceInput);
		else 
            return;  // do nothing
	}
}