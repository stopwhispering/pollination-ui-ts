import MessageBox from "sap/m/MessageBox";
import Event from "sap/ui/base/Event";
import JSONModel from "sap/ui/model/json/JSONModel";
import { browser } from "sap/ui/Device";
import BaseController from "./BaseController";
import MessageToast from "sap/m/MessageToast";
import FilterOperator from "sap/ui/model/FilterOperator";
import Filter from "sap/ui/model/Filter";
import Fragment from "sap/ui/core/Fragment";
import { Pollination, Florescence, RetrainPollinationModelResults, PollenDonor, NewPollenContainerItem, Plant } from "../interfaces/entities";
import Dialog from "sap/m/Dialog";
import List from "sap/m/List";
import ColorPalettePopover from "sap/m/ColorPalettePopover";
import formatter from "../model/formatter";
import Button from "sap/m/Button";
import { ButtonType, DialogType } from "sap/m/library";
import { ValueState } from "sap/ui/core/library";
import Text from "sap/m/Text";
import Context from "sap/ui/model/Context";
import StepInput from "sap/m/StepInput";
import ComboBox from "sap/m/ComboBox";
import GridList from "sap/f/GridList";
import ListBinding from "sap/ui/model/ListBinding";
import SearchField from "sap/m/SearchField";

/**
 * @namespace pollination.ui.controller
 */
export default class App extends BaseController {

	private _new_temp_pollination: Pollination;
	private _new_pollinations: Pollination[]; // = [];
	private _oColorPalettePopoverMinDefautButton: ColorPalettePopover;
	private _oSuccessMessageDialog: Dialog;
	public formatter: formatter = new formatter();

	public onInit(): void {

		this.getView().setModel(new JSONModel({
			// isMobile: Device.browser.mobile,
			isMobile: browser.mobile
		}), "view");

		this._load_initial_data();

		// initialize empty model for new pollination
		this._new_temp_pollination = {
			pollinationTimestamp: this.format_timestamp(new Date()),
			location: 'indoor_led'
		}
		var oModel = new JSONModel(this._new_temp_pollination);
		this.getView().setModel(oModel, "newTempPollinationModel");
		this._reset_temp_pollination_florescence();
		this._reset_temp_pollination_pollen();

		// initialize empty model for added, not yet saved new pollinations
		this._new_pollinations = []
		var oModel = new JSONModel(this._new_pollinations);
		this.getView().setModel(oModel, "newPollinationsModel");
	}

	private _reset_temp_pollination_florescence() {
		this._new_temp_pollination.florescenceId = undefined;
		this._new_temp_pollination.florescencePlantName = undefined;
		this._new_temp_pollination.florescencePlantId = undefined;
		this._new_temp_pollination.florescenceStatus = undefined;
		this._new_temp_pollination.availableColorsRgb = ['transparent', 'black'];  // technically required placeholders
		this._new_temp_pollination.labelColorRgb = "transparent";
		(<JSONModel>this.getView().getModel('newTempPollinationModel')).updateBindings(false);
	}

	private _reset_temp_pollination_pollen() {
		this._new_temp_pollination.pollenDonorPlantName = undefined;
		this._new_temp_pollination.pollenDonorPlantId = undefined;
		this._new_temp_pollination.pollenType = undefined;
		(<JSONModel>this.getView().getModel('newTempPollinationModel')).updateBindings(false);
	}

	private _load_initial_data() {
		// load only once
		this._load_settings();

		// triggered at other places, too
		this._load_active_florescences();
		this._load_ongoing_pollinations();
	}

	private _load_settings() {
		$.ajax({
			url: this.getServiceUrl('pollinations/settings'),
			data: {},
			context: this,
			async: true
		})
			.done(this._onDoneLoadSettings)
			.fail(this.onFail.bind(this, 'Load settings'))
	}

	private _onDoneLoadSettings(result: any) {
		var oModel = new JSONModel(result);
		this.getView().setModel(oModel, "settingsModel");
	}

	private _load_active_florescences() {
		$.ajax({
			url: this.getServiceUrl('active_florescences'),
			data: {},
			context: this,
			async: true
		})
			.done(this._onDoneLoadActiveInflorescences)
			.fail(this.onFail.bind(this, 'Load current florescences'))
	}

	private _onDoneLoadActiveInflorescences(result: any) {
		var oModel = new JSONModel(result.activeFlorescenceCollection);
		this.getView().setModel(oModel, "currentFlorescencesModel");

		this._reset_temp_pollination_florescence();
	}

	private _load_ongoing_pollinations() {

		$.ajax({
			url: this.getServiceUrl('ongoing_pollinations'),
			data: {},
			context: this,
			async: true
		})
			.done(this._onDoneLoadOngoingPollinations)
			.fail(this.onFail.bind(this, 'Load ongoing pollinations'))
	}

	private _onDoneLoadOngoingPollinations(result: any) {
		var oModelOngoingPollinations = <JSONModel>this.getView().getModel("ongoingPollinationsModel");
		if (!oModelOngoingPollinations) {
			var oModelOngoingPollinations = new JSONModel(result.ongoingPollinationCollection);
			this.getView().setModel(oModelOngoingPollinations, "ongoingPollinationsModel");
		} else {
			(<JSONModel>oModelOngoingPollinations).setData(result.ongoingPollinationCollection);
		}
	}

	public onSelectionChangedCurrentFlorescence(oEvent: Event) {
		var florescence: Florescence = oEvent.getParameter('listItem').getBindingContext('currentFlorescencesModel').getObject();
		// var plant_id = florescence.id;
		$.ajax({
			url: this.getServiceUrl('potential_pollen_donors/' + florescence.id),
			data: {},
			context: this,
			async: true
		})
			.done(this._onDoneLoadPotentialPollenDonors)
			.fail(this.onFail.bind(this, 'Load potential pollen donors'))

		// set selected florescence plant in new pollination temp model 
		this._new_temp_pollination.florescencePlantName = florescence.plant_name;
		this._new_temp_pollination.florescencePlantId = florescence.plant_id;
		this._new_temp_pollination.florescenceId = florescence.id;
		this._new_temp_pollination.florescenceStatus = florescence.florescence_status;  // for enabling/disabling preview button

		// update the available colors for the florescence
		this._new_temp_pollination.availableColorsRgb = this._getAvailableColors(florescence);
		(<JSONModel>this.getView().getModel("newTempPollinationModel")).updateBindings(false);
	}

	private _getAvailableColors(florescence: Florescence) {
		// determine available colors based on the colors we received from backend for the currently selected
		// florescence and the colors we already used for unsaved pollinations 

		// clone available colors from those we received from backend so we don't modify the original below
		var availabeColorsRgb = JSON.parse(JSON.stringify(florescence.available_colors_rgb));

		// remove colors from unsaved pollinations
		for (var i = 0; i < this._new_pollinations.length; i++) {
			var pollination = this._new_pollinations[i];
			if (this._new_temp_pollination.florescenceId === pollination.florescenceId) {
				var iIndex = availabeColorsRgb.indexOf(pollination.labelColorRgb);
				if (iIndex >= 0) {
					availabeColorsRgb.splice(iIndex, 1);
				}
			}
		}
		return availabeColorsRgb;
	}

	public onSelectionChangedPollenDonor(oEvent: Event) {
		var pollenDonor = oEvent.getParameter('listItem').getBindingContext('potentialPollenDonorsModel').getObject();

		this._new_temp_pollination.pollenDonorPlantName = pollenDonor.plant_name;
		this._new_temp_pollination.pollenDonorPlantId = pollenDonor.plant_id;
		this._new_temp_pollination.pollenType = pollenDonor.pollen_type;
		var oNewTempPollinationModel = this.getView().getModel("newTempPollinationModel");
		(<JSONModel>oNewTempPollinationModel).updateBindings(false);
	}

	private _onDoneLoadPotentialPollenDonors(result: any) {
		var oModel = new JSONModel(result.potentialPollenDonorCollection);
		this.getView().setModel(oModel, "potentialPollenDonorsModel");

		this._reset_temp_pollination_pollen();
	}

	public getPollenTypeGroup(oContext: Context) {
		//grouper for Pollen Type
		const text = oContext.getProperty('pollen_type') + ' Pollen'
		return text.toUpperCase().replace('_', ' ');
	}

	public getFlorescenceStatusGroup(oContext: Context) {
		return oContext.getProperty('florescence_status').toUpperCase().replace('_', ' ');
	}

	public getPollinationStatusGroup(oContext: Context) {
		// we can't change order here, only format the group text
		return oContext.getProperty('pollination_status').toUpperCase().replace('_', ' ');
	}

	public getPollinationStatusComparator(a: string, b: string) {
		//receives the results of getPollinationStatusGroup for two items as inputs
		//return numbered output for custom sorting
		//cf sap.ui.model.Sorter.defaultComparator
		const orderMapping: any = {
			'ATTEMPT': 1,
			'SEED_CAPSULE': 2,
			'GERMINATED': 3
		};
		const scoreA = orderMapping[a];
		const scoreB = orderMapping[b];

		if (scoreA < scoreB) {
			return -1;
		} else {
			return 1;
		}
	}

	public getGenusGroup(oContext: Context) {
		return oContext.getProperty('genus');
	}

	public onColorSelect(oEvent: Event) {
		this._new_temp_pollination.labelColorRgb = oEvent.getParameter('value');
		var oNewTempPollinationModel = <JSONModel>this.getView().getModel("newTempPollinationModel");
		oNewTempPollinationModel.updateBindings(false);
	}

	public onPressAddButton(oEvent: Event) {
		var selectedFlorescenceItem = (<List>this.getView().byId('activeFlorescencesList')).getSelectedItem();
		if (selectedFlorescenceItem === null || selectedFlorescenceItem === undefined) {
			MessageToast.show('Please select a florescence.')
			return;
		}
		var selectedFlorescence = <Florescence>selectedFlorescenceItem.getBindingContext('currentFlorescencesModel')!.getObject();

		var selectedPollenDonorItem = (<List>this.getView().byId('potentialPollenDonorsList')).getSelectedItem();
		var selectedPollenDonor = <PollenDonor>selectedPollenDonorItem.getBindingContext('potentialPollenDonorsModel')!.getObject();

		// var oNewTempPollinationModel = this.getView().getModel("newTempPollinationModel");
		// var oNewTempPollination = oNewTempPollinationModel.getData();
		if (this._new_temp_pollination.florescencePlantName !== selectedFlorescence.plant_name
			|| this._new_temp_pollination.pollenDonorPlantName !== selectedPollenDonor.plant_name) {
			MessageToast.show('Bad Plant Names.')
			return;
		}

		switch (this._new_temp_pollination.location) {
			case 'indoor_led': var locationText = 'indoor LED'; break;
			case 'indoor': var locationText = 'indoor'; break;
			case 'outdoor': var locationText = 'outdoor'; break;
			default:
				MessageToast.show('Bad Location.')
				return;
		}

		if (!this._new_temp_pollination.labelColorRgb || this._new_temp_pollination.labelColorRgb === '' || this._new_temp_pollination.labelColorRgb === 'transparent') {
			MessageToast.show('Choose Color first.')
			return;
		}

		// add new pollination to the newPollinationsModel
		var oNewPollination = {
			florescenceId: this._new_temp_pollination.florescenceId,
			seedCapsulePlantName: selectedFlorescence.plant_name,
			seedCapsulePlantId: selectedFlorescence.plant_id,
			pollenDonorPlantName: selectedPollenDonor.plant_name,
			pollenDonorPlantId: selectedPollenDonor.plant_id,
			pollenType: this._new_temp_pollination.pollenType,
			pollinationTimestamp: this._new_temp_pollination.pollinationTimestamp,  // '%Y-%m-%d %H:%M' without seconds
			location: this._new_temp_pollination.location,
			locationText: locationText,
			labelColorRgb: this._new_temp_pollination.labelColorRgb
		}
		this._new_pollinations.push(oNewPollination);
		(<JSONModel>this.getView().getModel("newPollinationsModel")).updateBindings(false);

		// remove label color from available colors for this florescence
		this._new_temp_pollination.labelColorRgb = 'transparent';
		this._new_temp_pollination.availableColorsRgb = this._getAvailableColors(selectedFlorescence);
		(<JSONModel>this.getView().getModel("newTempPollinationModel")).updateBindings(false);
	}

	private _deleteNewPollination(oNewPollination: Pollination) {
		var index = this._new_pollinations.indexOf(oNewPollination);
		this._new_pollinations.splice(index, 1);
		(<JSONModel>this.getView().getModel("newPollinationsModel")).updateBindings(false);
	}

	public onPressDeleteNewPollinationButton(oEvent: Event) {
		var oNewPollination = <Pollination>(<Button>oEvent.getSource()).getBindingContext("newPollinationsModel")!.getObject();  // todo type
		this._deleteNewPollination(oNewPollination);
	}

	public onPressSaveNewPollinationButton(oEvent: Event) {
		var oNewPollination = <Pollination>(<Button>oEvent.getSource()).getBindingContext("newPollinationsModel")!.getObject();  // todo type
		var oNewPollinationsJson = JSON.stringify(oNewPollination);
		$.ajax({
			url: this.getServiceUrl('pollinations'),
			data: oNewPollinationsJson,
			context: this,
			async: true,
			type: 'POST',
			contentType: 'application/json'
		})
			.done(this._onDonePostNewPollination.bind(this, oNewPollination))
			.fail(this.onFail.bind(this, 'Save new pollinations'))
	}

	private _onDonePostNewPollination(oNewPollination: Pollination) {
		// having posted a new pollination, re-read the ongoing pollinations list
		this._load_ongoing_pollinations();

		// also re-read the active florescences list
		this._load_active_florescences();

		// remove saved new pollination from new pollinations model 
		this.getView().getModel("newPollinationsModel")
		this._deleteNewPollination(oNewPollination);
	}

	public onLiveChangeOngoingPollinationsFilter(oEvent: Event) {
		// add filter to ongoing pollinations gridlist
		var aFilters = [];
		var sQuery = (<SearchField>oEvent.getSource()).getValue();
		if (sQuery && sQuery.length > 0) {
			// var filter = new Filter("seed_capsule_plant_name", FilterOperator.Contains, sQuery);
			// filter on multiple fields, connected with OR
			var filter = new Filter([
				new Filter("seed_capsule_plant_name", FilterOperator.Contains, sQuery),
				new Filter("pollen_donor_plant_name", FilterOperator.Contains, sQuery),
				new Filter("seed_capsule_plant_id", FilterOperator.EQ, sQuery),
				new Filter("pollen_donor_plant_id", FilterOperator.EQ, sQuery),
				new Filter("pollination_timestamp", FilterOperator.Contains, sQuery),
				new Filter("pollen_type", FilterOperator.Contains, sQuery),
			], false);
			aFilters.push(filter);
		}

		// update list binding
		var oList = <GridList>this.byId("ongoingPollinationsList");
		var oBinding = <ListBinding>oList.getBinding("items");
		oBinding.filter(aFilters, "Application");
	}


	////////////////////////////////////////////////////////////////////////////////////////////////////////////
	//		edit florescence
	////////////////////////////////////////////////////////////////////////////////////////////////////////////
	public onPressEditActiveFlorescence(oEvent: Event) {
		// clone active florescence object for manipulation in the dialog
		var oCurrentFlorescence = (<Button>oEvent.getSource()).getBindingContext("currentFlorescencesModel")!.getObject();
		var oEditedFlorescence = JSON.parse(JSON.stringify(oCurrentFlorescence));

		// add some control attributes to allow for usage of sliders and keeping undefined values
		oEditedFlorescence.flowers_count_known = !!oEditedFlorescence.flowers_count
		oEditedFlorescence.branches_count_known = !!oEditedFlorescence.branches_count
		oEditedFlorescence.inflorescence_appearance_date_known = !!oEditedFlorescence.inflorescence_appearance_date
		oEditedFlorescence.first_flower_opening_date_known = !!oEditedFlorescence.first_flower_opening_date
		oEditedFlorescence.last_flower_closing_date_known = !!oEditedFlorescence.last_flower_closing_date

		// // open dialog and bind model
		// this.applyToFragment('editFlorescence',(o)=>{asdf
		// 	var oEditedFlorescenceModel = new sap.ui.model.json.JSONModel(oEditedFlorescence);
		// 	this.getView().setModel(oEditedFlorescenceModel, "editedFlorescenceModel");
		// 	o.open();
		// }, undefined);

		// open dialog
		var oView = this.getView();
		var fn = (oDialog: any) => {
			oView.addDependent(oDialog);  // required to bind fragment to view
			var oEditedFlorescenceModel = new JSONModel(oEditedFlorescence);
			oView.setModel(oEditedFlorescenceModel, "editedFlorescenceModel");
			oDialog.open();
		};
		if (!this.byId('editedFlorescenceModel')) {
			Fragment.load({
				name: "pollination.ui.view.fragments.EditFlorescence",
				id: oView.getId(),
				controller: this
			}).then(fn);
		} else {
			fn(<Dialog>this.byId('editedFlorescenceModel'));
		}
	}

	public onAfterCloseEditFlorescenceDialog(oEvent: Event) {
		// destroy model and fragment, works for both regular closing and hitting ESC
		var oDialog = oEvent.getSource();
		oDialog.destroy();
		this.getView().getModel("editedFlorescenceModel").destroy();
	}

	public onPressEditFlorescenceSetToday(dateField: string) {
		var oEditedFlorescenceModel = <JSONModel>this.getView().getModel("editedFlorescenceModel");
		var oEditedFlorescence = oEditedFlorescenceModel.getData();
		oEditedFlorescence[dateField] = (new Date()).toISOString().substring(0, 10);  // e.g. '2022-11-17';
		oEditedFlorescenceModel.updateBindings(false);
	}

	public onPressSubmitEditFlorescence(oEvent: Event) {
		var oEditedFlorescenceModel = <JSONModel>this.getView().getModel("editedFlorescenceModel");
		var oEditedFlorescence = oEditedFlorescenceModel.getData();

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
			url: this.getServiceUrl('active_florescences/' + oEditedFlorescence.id),
			data: oEditedFlorescenceJson,
			context: this,
			async: true,
			type: 'PUT',
			contentType: 'application/json'
		})
			.done(this._onDonePutFlorescence)
			.fail(this.onFail.bind(this, 'Update florescence'))
	}

	private _onDonePutFlorescence() {
		this.applyToFragment('editFlorescence', (o: any) => {
			o.close();
		});
		this._load_active_florescences();
	}

	public onPressDeleteFlorescence(oEvent: Event) {
		var florescence_id = (<JSONModel>this.getView().getModel("editedFlorescenceModel")).getData().id;
		MessageBox.confirm("Really delete Florescence? This cannot be undone.",
			{ onClose: this._onConfirmDeleteFlorescence.bind(this, florescence_id) }
		);
	}

	private _onConfirmDeleteFlorescence(florescence_id: int, sAction: string) {
		if (sAction === "OK") {
			this._deleteFlorescence(florescence_id);
		} else {
			// do nothing
		}
	}

	private _deleteFlorescence(florescence_id: int) {
		$.ajax({
			url: this.getServiceUrl('florescences/' + florescence_id),
			context: this,
			async: true,
			type: 'DELETE',
			contentType: 'application/json'
		})
			.done(this._onDoneDeleteFlorescence)
			.fail(this.onFail.bind(this, 'Delete florescences'))
	}

	private _onDoneDeleteFlorescence() {
		this.applyToFragment('editFlorescence', (o: Dialog) => {
			o.close();
		});

		this._load_active_florescences();
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// 		editPollination
	////////////////////////////////////////////////////////////////////////////////////////////////////////////
	public onPressEditOngoingPollination(oEvent: Event) {
		// clone ongoing pollination object for manipulation in the dialog
		var oOngoingPollination = (<Button>oEvent.getSource()).getBindingContext("ongoingPollinationsModel")!.getObject();
		var oEditedPollination = JSON.parse(JSON.stringify(oOngoingPollination));

		// add some control attributes to allow for usage of sliders and keeping undefined values
		oEditedPollination.pollination_timestamp_known = !!oEditedPollination.pollination_timestamp
		oEditedPollination.harvest_date_known = !!oEditedPollination.harvest_date

		// // open dialog and bind model
		// this.applyToFragment('editPollination',(o)=>{
		// 	var oEditedPollinationModel = new sap.ui.model.json.JSONModel(oEditedPollination);
		// 	this.getView().setModel(oEditedPollinationModel, "editedPollinationModel");
		// 	o.open();
		// });

		var oView = this.getView();
		var fn = (o: any) => {
			oView.addDependent(o);  // required to bind fragment to view
			var oEditedPollinationModel = new JSONModel(oEditedPollination);
			oView.setModel(oEditedPollinationModel, "editedPollinationModel");
			o.open();
		};

		// open dialog
		if (!this.byId('editPollination')) {
			Fragment.load({
				name: "pollination.ui.view.fragments.EditPollination",
				id: this.getView().getId(),
				controller: this
			}).then(fn);
		} else {
			fn(this.byId('editPollination'));
		}
	}

	public onAfterCloseEditPollinationDialog(oEvent: Event) {
		// destroy model and fragment, works for both regular closing and hitting ESC
		var oDialog = oEvent.getSource();
		oDialog.destroy();
		this.getView().getModel("editedPollinationModel").destroy();
	}

	public onOpenColorPalettePopover(oEvent: Event) {
		const oButton = <Button>oEvent.getSource()
		// read colors from settings model
		var oSettingsModel = this.getView().getModel("settingsModel");
		var aColors = oSettingsModel.getProperty("/colors");

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
		var oEditedPollinationModel = <JSONModel>this.getView().getModel("editedPollinationModel");
		oEditedPollinationModel.setProperty("/label_color_rgb", oEvent.getParameter("value"));
		oEditedPollinationModel.updateBindings(false);
	}

	public onChangeInputCalcGerminationRate(oEvent: Event) {
		// upon changing # seeds sown or # seeds germinated, re-calculates germination rate

		// apply our default validator for int input
		this.onChangeInputPreventNonInt(oEvent);

		// get values and calculate germination rate
		var oEditedPollinationModel = <JSONModel>this.getView().getModel("editedPollinationModel");
		var iSeedsSown = oEditedPollinationModel.getProperty("/first_seeds_sown");
		var iSeedsGerminated = oEditedPollinationModel.getProperty("/first_seeds_germinated");
		if (iSeedsSown && iSeedsGerminated) {
			var fGerminationRate = iSeedsGerminated / iSeedsSown * 100;
			var iGerminationRate = Math.round(fGerminationRate);
			oEditedPollinationModel.setProperty("/germination_rate", iGerminationRate);
		}
		oEditedPollinationModel.updateBindings(false);

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
		var oEditedPollinationModel = <JSONModel>this.getView().getModel("editedPollinationModel");
		var oEditedPollination = oEditedPollinationModel.getData();

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
			url: this.getServiceUrl('pollinations/' + oEditedPollination.id),
			data: oEditedPollinationJson,
			context: this,
			async: true,
			type: 'PUT',
			contentType: 'application/json'
		})
			.done(this._onDonePutPollination)
			.fail(this.onFail.bind(this, 'Update pollination'))
	}

	private _onDonePutPollination() {
		this.applyToFragment('editPollination', (o: Dialog) => {
			o.close();
		});

		this._load_active_florescences();
		this._load_ongoing_pollinations();
	}

	public onPressDeletePollination(oEvent: Event) {
		var pollination_id = (<JSONModel>this.getView().getModel("editedPollinationModel")).getData().id;
		MessageBox.confirm("Really delete Pollination? This cannot be undone.",
			{ onClose: this._onConfirmDeletePollination.bind(this, pollination_id) }
		);
	}

	private _onConfirmDeletePollination(pollination_id: int, sAction: string) {
		if (sAction === "OK") {
			this._deletePollination(pollination_id);
		} else {
			// do nothing
		}
	}

	private _deletePollination(pollination_id: int) {
		$.ajax({
			url: this.getServiceUrl('pollinations/' + pollination_id),
			context: this,
			async: true,
			type: 'DELETE',
			contentType: 'application/json'
		})
			.done(this._onDoneDeletePollination)
			.fail(this.onFail.bind(this, 'Delete pollination'))
	}

	private _onDoneDeletePollination() {
		this.applyToFragment('editPollination', (o: Dialog) => {
			o.close();
		});

		this._load_active_florescences();
		this._load_ongoing_pollinations();
	}


	////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// 		pollen containers maintenance
	////////////////////////////////////////////////////////////////////////////////////////////////////////////
	public onPressOpenPollenContainersMaintenance(oEvent: Event) {
		// query pollen containers from backend and open dialog for maintenance
		$.ajax({
			url: this.getServiceUrl('pollen_containers'),
			context: this,
			async: true,
			contentType: 'application/json'
		})
			.done(this._onDoneGetPollenContainers)
			.fail(this.onFail.bind(this, 'Get pollen containers'))

		// // open dialog
		// this.applyToFragment('maintainPollenContainers',(o)=>{
		// 	o.open();			
		// } undefined)

		// open dialog
		var oView = this.getView();
		if (!this.byId('maintainPollenContainers')) {
			Fragment.load({
				name: "pollination.ui.view.fragments.MaintainPollenContainers",
				id: oView.getId(),
				controller: this
			}).then((oDialog: any) => {
				oView.addDependent(oDialog);
				oDialog.open();
			});
		} else {
			(<Dialog>this.byId('maintainPollenContainers')).open();
		}

	}

	private _onDoneGetPollenContainers(result: any) {
		var oModel = new JSONModel(result);
		oModel.setSizeLimit(2000);
		this.getView().setModel(oModel, "pollenContainersModel");
	}

	public onAfterClosemaintainPollenContainers(oEvent: Event) {
		var oDialog = oEvent.getSource();
		oDialog.destroy();
		this.getView().getModel("pollenContainersModel").destroy();
	}

	public onPressSubmitPollenContainers(oEvent: Event) {
		var oPollenContainersModel = <JSONModel>this.getView().getModel("pollenContainersModel");
		var oPollenContainersFull = oPollenContainersModel.getData();

		//we only send the pollen containers, not the list of plants that have none
		var oPollenContainers = {
			"pollenContainerCollection": oPollenContainersFull.pollenContainerCollection
		}

		var oPollenContainersJson = JSON.stringify(oPollenContainers);
		$.ajax({
			url: this.getServiceUrl('pollen_containers'),
			data: oPollenContainersJson,
			context: this,
			async: true,
			type: 'POST',
			contentType: 'application/json'
		})
			.done(this._onDonePutPollenContainers)
			.fail(this.onFail.bind(this, 'Maintained Pollen Containers'))
	}

	private _onDonePutPollenContainers() {
		this.applyToFragment('maintainPollenContainers', (o: Dialog) => {
			o.close();
		}, undefined);

		this._load_active_florescences();
	}

	public onPressAddPlantForPollenContainer(oEvent: Event) {
		var iCount = (<StepInput>this.byId('newPlantPollenContainerCount')).getValue();
		if (iCount <= 0) {
			MessageToast.show("Please enter a positive number");
			return;
		}

		var oPollenContainer = <ComboBox>this.byId('newPlantPollenContainer');
		if (!oPollenContainer.getSelectedItem()) {
			MessageToast.show("Please select a plant");
			return;
		}

		var oPlant = <Plant>oPollenContainer.getSelectedItem()!.getBindingContext('pollenContainersModel')!.getObject();
		var oNewPollenContainerItem = <NewPollenContainerItem>{
			plant_id: oPlant.plant_id,
			plant_name: oPlant.plant_name,
			genus: oPlant.genus,
			count_stored_pollen_containers: iCount
		}

		// insert into pollen containers list
		var oPollenContainersModel = <JSONModel>this.getView().getModel("pollenContainersModel");
		var aPollenContainers = oPollenContainersModel.getData().pollenContainerCollection;
		aPollenContainers.push(oNewPollenContainerItem);

		// remove from plants list without pollen containers
		var aPlantsWithoutPollenContainers = oPollenContainersModel.getData().plantsWithoutPollenContainerCollection;
		var iIndex = aPlantsWithoutPollenContainers.indexOf(oPlant);
		aPlantsWithoutPollenContainers.splice(iIndex, 1);

		oPollenContainersModel.updateBindings(false);
		oPollenContainer.clearSelection();
	}


	////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// 		add active florescences
	////////////////////////////////////////////////////////////////////////////////////////////////////////////
	public onPressAddActiveFlorescence(oEvent: Event) {
		// query plants to fill combobox for new florescence
		$.ajax({
			url: this.getServiceUrl('plants_for_new_florescence'),
			context: this,
			async: true,
			contentType: 'application/json'
		})
			.done(this._onDoneGetPlantsForNewFlorescence)
			.fail(this.onFail.bind(this, 'Get plants for new florescence'))

		// create model for new florescence
		var oNewFlorescence = {
			plant_id: undefined,
			plant_name: undefined,
			florescence_status: 'inflorescence_appeared',
			inflorescence_appearance_date: undefined,
			comment: undefined
		}
		// var oNewFlorescenceModel = new sap.ui.model.json.JSONModel(oNewFlorescence);
		var oNewFlorescenceModel = new JSONModel(oNewFlorescence);
		this.getView().setModel(oNewFlorescenceModel, "newFlorescenceModel");

		// open dialog
		var oView = this.getView();
		if (!this.byId('addActiveFlorescence')) {
			Fragment.load({
				name: "pollination.ui.view.fragments.AddActiveFlorescence",
				id: oView.getId(),
				controller: this
			}).then((oDialog: any) => {
				oView.addDependent(oDialog);
				oDialog.open();
			});
		} else {
			(<Dialog>this.byId('addActiveFlorescence')).open();
		}
	}

	private _onDoneGetPlantsForNewFlorescence(result: any) {
		var oModel = new JSONModel(result.plantsForNewFlorescenceCollection);
		oModel.setSizeLimit(2000);
		this.getView().setModel(oModel, "plantsForNewFlorescenceModel");
	}

	public onPressSubmitNewFlorescence() {
		var oNewFlorescenceModel = <JSONModel>this.getView().getModel("newFlorescenceModel");
		var oNewFlorescence = oNewFlorescenceModel.getData();

		var oNewFlorescenceJson = JSON.stringify(oNewFlorescence);
		$.ajax({
			url: this.getServiceUrl('active_florescences'),
			data: oNewFlorescenceJson,
			context: this,
			async: true,
			type: 'POST',
			contentType: 'application/json'
		})
			.done(this._onDonePostNewFlorescence)
			.fail(this.onFail.bind(this, 'Create new florescence'))
	}

	private _onDonePostNewFlorescence() {
		this.applyToFragment('addActiveFlorescence', (o: Dialog) => {
			o.close();
		}, undefined);

		this._load_active_florescences();
	}

	public onAfterCloseAddActiveFlorescence(oEvent: Event) {
		var oDialog = oEvent.getSource();
		oDialog.destroy();
		this.getView().getModel("plantsForNewFlorescenceModel").destroy();
		this.getView().getModel("newFlorescenceModel").destroy();
	}

	public onPressRetrainProbabilityModelPollinationToSeed(oEvent: Event) {
		$.ajax({
			url: this.getServiceUrl('retrain_probability_pollination_to_seed_model'),
			context: this,
			async: true,
			type: 'POST',
			contentType: 'application/json'
		})
			.done(this._onDoneRetrainPollinationModel)
			.fail(this.onFail.bind(this, 'Retrain Pollination Model'))
	}

	private _onDoneRetrainPollinationModel(result: RetrainPollinationModelResults) {
		var oSuccessMessageDialog = this._oSuccessMessageDialog;
		if (!this._oSuccessMessageDialog) {
			this._oSuccessMessageDialog = new Dialog({
				type: DialogType.Message,
				title: "Success",
				state: ValueState.Success,
				content: new Text({ text: "Trained Model: " + result.model + "\n" + "Mean F1 Score: " + result.mean_f1_score }),
				beginButton: new Button({
					type: ButtonType.Emphasized,
					text: "OK",
					press() {
						oSuccessMessageDialog.close();
					}  //.bind(this)
				})
			});
		}
		this._oSuccessMessageDialog.open();
	}
}