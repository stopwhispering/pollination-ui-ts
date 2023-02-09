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
import Control from "sap/ui/core/Control";
import { PollinationRead } from "pollination/ui/interfaces/entities";
import { LEditPollinationInput } from "pollination/ui/interfaces/entitiesLocal";
import ActiveFlorescencesHandler from "./ActiveFlorescencesHandler";
import PollinationsHandler from "./PollinationsHandler";
import IconTabBar from "sap/m/IconTabBar";

/**
 * @namespace pollination.ui.controller.custom
 */
export default class EditPollinationDialogHandler extends ManagedObject {

    private _oSettingsModel: JSONModel;
	private _oActiveFlorescencesHandler: ActiveFlorescencesHandler
    private _oPollinationsHandler: PollinationsHandler;

	private _oEditPollinationInputModel: JSONModel;
    private _oColorPalettePopoverMinDefautButton: ColorPalettePopover;
    private _oEditPollinationDialog: Dialog;

    public constructor(oSettingsModel: JSONModel, oActiveFlorescencesHandler: ActiveFlorescencesHandler, oPollinationsHandler: PollinationsHandler) {
        super();
		
        this._oSettingsModel = oSettingsModel;
		this._oActiveFlorescencesHandler = oActiveFlorescencesHandler;
        this._oPollinationsHandler = oPollinationsHandler;
    }

	public openDialogEditOngoingPollination(oPollination: PollinationRead, oViewToAddTo: View): void {  // TODO: add type for oPollination
		// clone ongoing pollination object for manipulation in the dialog
		// add some control attributes to allow for usage of sliders and keeping undefined values
		var oEditedPollination: LEditPollinationInput = JSON.parse(JSON.stringify(oPollination));
		oEditedPollination.pollination_timestamp_known = !!oEditedPollination.pollination_timestamp
		oEditedPollination.harvest_date_known = !!oEditedPollination.harvest_date

		// open dialog
        Fragment.load({
            name: "pollination.ui.view.fragments.EditPollination",
            id: oViewToAddTo.getId(),
            controller: this
        }).then((oControl: Control | Control[]) => {
            this._oEditPollinationDialog = <Dialog>oControl;
			oViewToAddTo.addDependent(this._oEditPollinationDialog);  // required to bind fragment to view
			this._oEditPollinationInputModel = new JSONModel(oEditedPollination);
			oViewToAddTo.setModel(this._oEditPollinationInputModel, "editPollinationInput");
			this._oEditPollinationDialog.open();

            // depending on pollination status, open the correct initial icon tab bar tab
            const oIconTabBar = <IconTabBar>oViewToAddTo.byId('editPollinationIconTabBar');
            if (oEditedPollination.pollination_status === "seed")
                oIconTabBar.setSelectedKey("icon_tab_seed_details");
            else if (oEditedPollination.pollination_status === "germinated")
                    oIconTabBar.setSelectedKey("icon_tab_germination_details");
            else
                oIconTabBar.setSelectedKey("icon_tab_pollination_details");
		});
	}

	public onAfterCloseEditPollinationDialog(oEvent: Event) {
		// destroy model and fragment, works for both regular closing and hitting ESC
		var oDialog = oEvent.getSource();
		oDialog.destroy();
		this._oEditPollinationInputModel.destroy();
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
		this._oEditPollinationInputModel.setProperty("/label_color_rgb", oEvent.getParameter("value"));
		this._oEditPollinationInputModel.updateBindings(false);
	}

	public onChangeInputCalcGerminationRate(oEvent: Event) {
		// upon changing # seeds sown or # seeds germinated, re-calculates germination rate

		// apply our default validator for int input
		this.onChangeInputPreventNonInt(oEvent);

		// get values and calculate germination rate
		var iSeedsSown = this._oEditPollinationInputModel.getProperty("/first_seeds_sown");
		var iSeedsGerminated = this._oEditPollinationInputModel.getProperty("/first_seeds_germinated");
		if (iSeedsSown && iSeedsGerminated) {
			var fGerminationRate = iSeedsGerminated / iSeedsSown * 100;
			var iGerminationRate = Math.round(fGerminationRate);
			this._oEditPollinationInputModel.setProperty("/germination_rate", iGerminationRate);
		}
		this._oEditPollinationInputModel.updateBindings(false);

	}

	/////////////////////////////////////////////////////////////////////////////////////////////////////
	// 		Edit pollination handlers
	/////////////////////////////////////////////////////////////////////////////////////////////////////	
    public onChangeInputPreventNonFloat(oEvent: Event) : void{
        // prevent non-float (i.e. non-numerical) input
        var newValue = oEvent.getParameter('newValue');
        if(isNaN(Number(newValue))){
            var sPath = (<Control>oEvent.getSource()).getBindingPath('value');  // e.g. '/seed_capsule_length'
            this._oEditPollinationInputModel.setProperty(sPath, undefined);
            this._oEditPollinationInputModel.updateBindings(false);
        }
    }

    public onChangeInputPreventNonInt(oEvent: Event) : void{
        // prevent non-integer (i.e. non-numerical or decimal) input
        var newValue = oEvent.getParameter('newValue');
        if(isNaN(Number(newValue)) || !Number.isInteger(Number(newValue))){
            var sPath = (<Control>oEvent.getSource()).getBindingPath('value');  // e.g. '/seed_capsule_length'
            this._oEditPollinationInputModel.setProperty(sPath, undefined);
            this._oEditPollinationInputModel.updateBindings(false);
        }
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
		var oEditedPollination = this._oEditPollinationInputModel.getData();

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

        this._oActiveFlorescencesHandler.loadFlorescences();
        this._oPollinationsHandler.loadPollinations();
	}

	public onPressDeletePollination(oEvent: Event) {
		var pollination_id = this._oEditPollinationInputModel.getData().id;
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

        this._oActiveFlorescencesHandler.loadFlorescences();
        this._oPollinationsHandler.loadPollinations();
	}

    public onCancelEditPollinationDialog(dialogId: string) : void {
        this._oEditPollinationDialog.close();
    }
	
	onPressEditPollinationSetToday(oEvent: Event) {
        const oEditedPollination = <LEditPollinationInput> this._oEditPollinationInputModel.getData();
        oEditedPollination.harvest_date = Util.getToday();  // e.g. '2022-11-17';
		this._oEditPollinationInputModel.updateBindings(false);
	}	
}