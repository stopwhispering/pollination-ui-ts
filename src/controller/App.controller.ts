import MessageBox from "sap/m/MessageBox";
import Event from "sap/ui/base/Event";
import JSONModel from "sap/ui/model/json/JSONModel";
import { browser } from "sap/ui/Device";
import BaseController from "./BaseController";
import MessageToast from "sap/m/MessageToast";
import FilterOperator from "sap/ui/model/FilterOperator";
import Filter from "sap/ui/model/Filter";
import Fragment from "sap/ui/core/Fragment";
import { Pollination, Florescence, PollenDonor, NewPollenContainerItem, Plant } from "../interfaces/entitiesLocal";
import Dialog from "sap/m/Dialog";
import List from "sap/m/List";
import ColorPalettePopover from "sap/m/ColorPalettePopover";
import formatter from "../model/formatter";
import Button from "sap/m/Button";
import Context from "sap/ui/model/Context";
import StepInput from "sap/m/StepInput";
import ComboBox from "sap/m/ComboBox";
import GridList from "sap/f/GridList";
import ListBinding from "sap/ui/model/ListBinding";
import SearchField from "sap/m/SearchField";
import { BActiveFlorescence, BResultsActiveFlorescences, FRequestNewPollination } from "../interfaces/entities";
import Control from "sap/ui/core/Control";
import PollinationToSeedProbabilityModelTrainer from "./custom/PollinationToSeedProbabilityModelTrainer";
import Util from "./custom/Util";
import FlorescenceCRUD from "./custom/FlorescenceCRUD";
import FlorescenceDialogHandler from "./custom/FlorescenceDialogHandler";
import Input from "sap/m/Input";
import PollinationHandler from "./custom/PollinationHandler";

/**
 * @namespace pollination.ui.controller
 */
export default class App extends BaseController {

	private _new_temp_pollination: Pollination;
	private _new_pollinations: Pollination[]; // = [];
	private _oColorPalettePopoverMinDefautButton: ColorPalettePopover;
	public formatter: formatter = new formatter();

	public onInit(): void {

		this.getView().setModel(new JSONModel({
			// isMobile: Device.browser.mobile,
			isMobile: browser.mobile
		}), "view");

		this._load_initial_data();

		// initialize empty model for new pollination
		this._new_temp_pollination = {
			pollinationTimestamp: Util.format_timestamp(new Date()),
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
			url: Util.getServiceUrl('pollinations/settings'),
			data: {},
			context: this,
			async: true
		})
			.done(this._onDoneLoadSettings)
			.fail(Util.onFail.bind(this, 'Load settings'))
	}

	private _onDoneLoadSettings(result: any) {
		var oModel = new JSONModel(result);
		this.getView().setModel(oModel, "settingsModel");
	}

	private _load_active_florescences() {
		// load active florescences and reset the corresponding model
		$.ajax({
			url: Util.getServiceUrl('active_florescences'),
			data: {},
			context: this,
			async: true
		})
			.done(this._onDoneLoadActiveInflorescences)
			.fail(Util.onFail.bind(this, 'Load current florescences'))
	}

	private _onDoneLoadActiveInflorescences(results: BResultsActiveFlorescences) {
		const aActiveFlorescences: BActiveFlorescence[] = results.activeFlorescenceCollection;
		var oModel = new JSONModel(aActiveFlorescences);
		this.getView().setModel(oModel, "currentFlorescencesModel");

		this._reset_temp_pollination_florescence();
	}

	private _load_ongoing_pollinations() {

		$.ajax({
			url: Util.getServiceUrl('ongoing_pollinations'),
			data: {},
			context: this,
			async: true
		})
			.done(this._onDoneLoadOngoingPollinations)
			.fail(Util.onFail.bind(this, 'Load ongoing pollinations'))
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
			url: Util.getServiceUrl('potential_pollen_donors/' + florescence.id),
			data: {},
			context: this,
			async: true
		})
			.done(this._onDoneLoadPotentialPollenDonors)
			.fail(Util.onFail.bind(this, 'Load potential pollen donors'))

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

	public onPressAddAsPollinationPreview(oEvent: Event) {
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
		const oControl = <Control>oEvent.getSource()
		var oNewPollination = <FRequestNewPollination>oControl.getBindingContext("newPollinationsModel")!.getObject();
		$.ajax({
			url: Util.getServiceUrl('pollinations'),
			data: JSON.stringify(oNewPollination),
			context: this,
			async: true,
			type: 'POST',
			contentType: 'application/json'
		})
			.done(this._onDonePostNewPollination.bind(this, oNewPollination))
			.fail(Util.onFail.bind(this, 'Save new pollinations'))
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
		this.applyToFragment('editFlorescence', (o: any) => {
			o.close();
		});
		this._load_active_florescences();
	}



	////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// 		editPollination
	////////////////////////////////////////////////////////////////////////////////////////////////////////////
	public onPressEditOngoingPollination(oEvent: Event) {
		const oOngoingPollination = (<Button>oEvent.getSource()).getBindingContext("ongoingPollinationsModel")!.getObject();
		const oPollinationHandler = new PollinationHandler();
		oPollinationHandler.onPressEditOngoingPollination(oOngoingPollination, this.getView());

	}



	////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// 		pollen containers maintenance
	////////////////////////////////////////////////////////////////////////////////////////////////////////////
	public onPressOpenPollenContainersMaintenance(oEvent: Event) {
		// query pollen containers from backend and open dialog for maintenance
		$.ajax({
			url: Util.getServiceUrl('pollen_containers'),
			context: this,
			async: true,
			contentType: 'application/json'
		})
			.done(this._onDoneGetPollenContainers)
			.fail(Util.onFail.bind(this, 'Get pollen containers'))

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
			url: Util.getServiceUrl('pollen_containers'),
			data: oPollenContainersJson,
			context: this,
			async: true,
			type: 'POST',
			contentType: 'application/json'
		})
			.done(this._onDonePutPollenContainers)
			.fail(Util.onFail.bind(this, 'Maintained Pollen Containers'))
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
	// 		add/delete/update active florescences
	////////////////////////////////////////////////////////////////////////////////////////////////////////////
	public onPressAddActiveFlorescence(oEvent: Event) {
		// open the dialog to create a new active florescence
		new FlorescenceDialogHandler().openDialogAddActiveFlorescence(this.getView(),
																		 "pollination.ui.view.fragments.AddActiveFlorescence");
	}

	public onPressSubmitNewFlorescence(oEvent: Event): void {
		const oDialogNewFlorescence = <Dialog>this.byId('addActiveFlorescence')
		new FlorescenceCRUD().saveNewFlorescence(oDialogNewFlorescence, this._load_active_florescences)
	}

	public onAfterCloseAddActiveFlorescence(oEvent: Event) {
		var oDialog = <Dialog>oEvent.getSource();
		oDialog.getModel("plantsForNewFlorescenceModel").destroy();
		oDialog.getModel("newFlorescenceModel").destroy();
		oDialog.destroy();
	}

	public onPressDeleteFlorescence(oEvent: Event) {
		const iFlorescenceId = (<JSONModel>this.getView().getModel("editedFlorescenceModel")).getData().id;
		const oDialogEditFlorescence = <Dialog>this.byId('editFlorescence');
		new FlorescenceCRUD().askToDeleteFlorescence(iFlorescenceId, oDialogEditFlorescence, this._load_active_florescences);
	}

    public onSetToday(oEvent: Event) : any{
		// find (masked)Input that belongs to the triggered event and
		// set its value to today's date
		const sDateInputId = (<Control>oEvent.getSource()).data()['inputId'];
		const oDateInput = <Input>this.byId(sDateInputId);
		const sToday = (new Date()).toISOString().substring(0,10);  // e.g. '2022-11-17';
		oDateInput.setValue(sToday);
    }

	public onPressEditActiveFlorescence(oEvent: Event) {
		const oFlorescence = (<Button>oEvent.getSource()).getBindingContext("currentFlorescencesModel")!.getObject();
		new FlorescenceDialogHandler().openDialogEditActiveFlorescence(this.getView(),
														   			   "pollination.ui.view.fragments.EditFlorescence",
																	   oFlorescence)
	}

	public onAfterCloseEditFlorescenceDialog(oEvent: Event) {
		// destroy model and fragment, works for both regular closing and hitting ESC
		const oDialog = <Dialog>oEvent.getSource();
		oDialog.getModel("editedFlorescenceModel").destroy();
		oDialog.destroy();		
	}

	/////////////////////////////////////////////////////////////////////////////////////////////////////
	// 		Edit pollination handlers
	/////////////////////////////////////////////////////////////////////////////////////////////////////	
    public onChangeInputPreventNonFloat(oEvent: Event) : void{
        // prevent non-float (i.e. non-numerical) input
        var newValue = oEvent.getParameter('newValue');
        if(isNaN(Number(newValue))){
            var sPath = (<Control>oEvent.getSource()).getBindingPath('value');  // e.g. '/seed_capsule_length'
            var oEditPollinationInputModel = <JSONModel>this.getView().getModel('editedPollinationModel')
            oEditPollinationInputModel.setProperty(sPath, undefined);
            oEditPollinationInputModel.updateBindings(false);
        }
    }

    public onChangeInputPreventNonInt(oEvent: Event) : void{
        // prevent non-integer (i.e. non-numerical or decimal) input
        var newValue = oEvent.getParameter('newValue');
        if(isNaN(Number(newValue)) || !Number.isInteger(Number(newValue))){
            var sPath = (<Control>oEvent.getSource()).getBindingPath('value');  // e.g. '/seed_capsule_length'
            var oEditPollinationInputModel = <JSONModel>this.getView().getModel('editedPollinationModel')
            oEditPollinationInputModel.setProperty(sPath, undefined);
            oEditPollinationInputModel.updateBindings(false);
        }
    }

	/////////////////////////////////////////////////////////////////////////////////////////////////////
	// 		retraining the model that predicts
	//      the probability of an attempted pollination 
	//   	to make it into seeds stage
	/////////////////////////////////////////////////////////////////////////////////////////////////////
	public onPressRetrainProbabilityModelPollinationToSeed(oEvent: Event) {
		new PollinationToSeedProbabilityModelTrainer().triggerRetrain();
	}
}