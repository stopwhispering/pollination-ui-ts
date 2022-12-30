import Button from "sap/m/Button";
import ColorPalettePopover from "sap/m/ColorPalettePopover";
import MessageBox from "sap/m/MessageBox";
import ManagedObject from "sap/ui/base/ManagedObject";
import Fragment from "sap/ui/core/Fragment";
import View from "sap/ui/core/mvc/View";
import JSONModel from "sap/ui/model/json/JSONModel";
import Util from "./Util";
import Event from "sap/ui/base/Event";
import Dialog from "sap/m/Dialog";

/**
 * @namespace pollination.ui.controller.custom
 */
export default class PollinationHandler extends ManagedObject {

    private _oSettingsModel: JSONModel;
    private _oEditedPollinationModel: JSONModel;
    private _fnLoadActiveFlorescences: Function;
    private _fnLoadOngoingPollinations: Function;

    private _oColorPalettePopoverMinDefautButton: ColorPalettePopover;
    private _oEditPollinationDialog: Dialog;

    public constructor(oSettingsModel: JSONModel, _oEditedPollinationModel: JSONModel, 
        _fnLoadActiveFlorescences: Function, _fnLoadOngoingPollinations: Function) {
        super();
        this._oSettingsModel = oSettingsModel;
        this._oEditedPollinationModel = _oEditedPollinationModel;
        this._fnLoadActiveFlorescences = _fnLoadActiveFlorescences;
        this._fnLoadOngoingPollinations = _fnLoadOngoingPollinations;
    }

	public onPressEditOngoingPollination(oPollination, oViewToAddTo: View) {  // TODO: add type for oPollination
		// clone ongoing pollination object for manipulation in the dialog
		var oEditedPollination = JSON.parse(JSON.stringify(oPollination));

		// add some control attributes to allow for usage of sliders and keeping undefined values
		oEditedPollination.pollination_timestamp_known = !!oEditedPollination.pollination_timestamp
		oEditedPollination.harvest_date_known = !!oEditedPollination.harvest_date

		// this.applyToFragment('editPollination',(o)=>{
		// 	var oEditedPollinationModel = new sap.ui.model.json.JSONModel(oEditedPollination);
		// 	this.getView().setModel(oEditedPollinationModel, "editedPollinationModel");
		// 	o.open();
		// });

		var fn = (o: any) => {
            this._oEditPollinationDialog = o;
			oViewToAddTo.addDependent(o);  // required to bind fragment to view
			var oEditedPollinationModel = new JSONModel(oEditedPollination);
			oViewToAddTo.setModel(oEditedPollinationModel, "editedPollinationModel");
			o.open();
		};

		// open dialog
        Fragment.load({
            name: "pollination.ui.view.fragments.EditPollination",
            id: oViewToAddTo.getId(),
            controller: this
        }).then(fn);
	}

	public onAfterCloseEditPollinationDialog(oEvent: Event) {
		// destroy model and fragment, works for both regular closing and hitting ESC
		var oDialog = oEvent.getSource();
		oDialog.destroy();
		this._oEditedPollinationModel.destroy();
	}

	public onOpenColorPalettePopover(oEvent: Event) {
		const oButton = <Button>oEvent.getSource()
		// read colors from settings model
		var aColors = this._oSettingsModel.getProperty("/colors");

		// open popover and set colors
		if (!this._oColorPalettePopoverMinDefautButton) {
			this._oColorPalettePopoverMinDefautButton = new ColorPalettePopover("oColorPalettePopoverMinDef", {
				showMoreColorsButton: false,
				colors: aColors,
				colorSelect: this._onSelectColorInColorPalettePopover.bind(this)
			});
		}
		// @ts-ignore  typescript data definitions for sap.m.ColorPalette are missing .openBy()
		this._oColorPalettePopoverMinDefautButton.openBy(oButton);
	}

	private _onSelectColorInColorPalettePopover(oEvent: Event) {
		// update color in model
		this._oEditedPollinationModel.setProperty("/label_color_rgb", oEvent.getParameter("value"));
		this._oEditedPollinationModel.updateBindings(false);
	}

	public onChangeInputCalcGerminationRate(oEvent: Event) {
		// upon changing # seeds sown or # seeds germinated, re-calculates germination rate

		// apply our default validator for int input
		this.onChangeInputPreventNonInt(oEvent);

		// get values and calculate germination rate
		var iSeedsSown = this._oEditedPollinationModel.getProperty("/first_seeds_sown");
		var iSeedsGerminated = this._oEditedPollinationModel.getProperty("/first_seeds_germinated");
		if (iSeedsSown && iSeedsGerminated) {
			var fGerminationRate = iSeedsGerminated / iSeedsSown * 100;
			var iGerminationRate = Math.round(fGerminationRate);
			this._oEditedPollinationModel.setProperty("/germination_rate", iGerminationRate);
		}
		this._oEditedPollinationModel.updateBindings(false);

	}

	public onPressSubmitEditPollinationAndFinish(oEvent: Event) {
		MessageBox.confirm("Finish Pollination? This will remove it from the list and cannot be undone.",
			{ onClose: this._onConfirmSubmitEditPollinationAndFinish.bind(this) }
		);
	}

	private _onConfirmSubmitEditPollinationAndFinish(sAction: string) {
		if (sAction === "OK") {
			this.onPressSubmitEditPollination(true);
		} else {
			// do nothing
		}
	}


	public onPressSubmitEditPollination(setFinished: boolean) {
		var oEditedPollination = this._oEditedPollinationModel.getData();

		// the inputs are bound to the model and might update undefined values to default values
		// we need to set them back to undefined
		if (!oEditedPollination.pollination_timestamp_known) {
			oEditedPollination.pollination_timestamp = undefined;
		}
		if (!oEditedPollination.harvest_date_known) {
			oEditedPollination.harvest_date = undefined;
		}

		// set finished if confirmed
		if (setFinished === true) {
			oEditedPollination.ongoing = false;
		}

		// todo validate status with certain inputs and cancel with message

		var oEditedPollinationJson = JSON.stringify(oEditedPollination);
		$.ajax({
			url: Util.getServiceUrl('pollinations/' + oEditedPollination.id),
			data: oEditedPollinationJson,
			context: this,
			async: true,
			type: 'PUT',
			contentType: 'application/json'
		})
			.done(this._onDonePutPollination)
			.fail(Util.onFail.bind(this, 'Update pollination'))
	}

	private _onDonePutPollination() {
		this._oEditPollinationDialog.close();

        this._fnLoadActiveFlorescences();
        this._fnLoadOngoingPollinations();
	}

	public onPressDeletePollination(oEvent: Event) {
		var pollination_id = this._oEditedPollinationModel.getData().id;
		MessageBox.confirm("Really delete Pollination? This cannot be undone.",
			{ onClose: this._onConfirmDeletePollination.bind(this, pollination_id) }
		);
	}

	private _onConfirmDeletePollination(pollination_id: int, sAction: string) {
		if (sAction === "OK") 
			this._deletePollination(pollination_id);
	}

	private _deletePollination(pollination_id: int) {
		$.ajax({
			url: Util.getServiceUrl('pollinations/' + pollination_id),
			context: this,
			async: true,
			type: 'DELETE',
			contentType: 'application/json'
		})
			.done(this._onDoneDeletePollination)
			.fail(Util.onFail.bind(this, 'Delete pollination'))
	}

	private _onDoneDeletePollination() {
		this._oEditPollinationDialog.close();

        this._fnLoadActiveFlorescences();
        this._fnLoadOngoingPollinations();
	}
}