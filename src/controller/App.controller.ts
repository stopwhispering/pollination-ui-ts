import Event from "sap/ui/base/Event";
import JSONModel from "sap/ui/model/json/JSONModel";
import { browser } from "sap/ui/Device";
import BaseController from "./BaseController";
import MessageToast from "sap/m/MessageToast";
import FilterOperator from "sap/ui/model/FilterOperator";
import Filter from "sap/ui/model/Filter";
import Fragment from "sap/ui/core/Fragment";
import { Florescence, NewPollenContainerItem, Plant, LUnsavedPollination } from "../interfaces/entitiesLocal";
import Dialog from "sap/m/Dialog";
import List from "sap/m/List";
import formatter from "../model/formatter";
import Button from "sap/m/Button";
import Context from "sap/ui/model/Context";
import StepInput from "sap/m/StepInput";
import ComboBox from "sap/m/ComboBox";
import GridList from "sap/f/GridList";
import ListBinding from "sap/ui/model/ListBinding";
import SearchField from "sap/m/SearchField";
import { BActiveFlorescence, BOngoingPollination, BPotentialPollenDonor, BResultsPotentialPollenDonors, FRequestNewPollination } from "../interfaces/entities";
import Control from "sap/ui/core/Control";
import PollinationToSeedProbabilityModelTrainer from "./custom/PollinationToSeedProbabilityModelTrainer";
import Util from "./custom/Util";
import NewFlorescenceDialogHandler from "./custom/NewFlorescenceDialogHandler";
import Input from "sap/m/Input";
import PollinationsHandler from "./custom/PollinationsHandler";
import PreviewPollinationHandler from "./custom/PreviewPollinationHandler";
import SettingsHandler from "./custom/SettingsHandler";
import ActiveFlorescencesHandler from "./custom/ActiveFlorescencesHandler";
import EditFlorescenceDialogHandler from "./custom/EditFlorescenceDialogHandler";
import ListItem from "sap/ui/core/ListItem";
import ListItemBase from "sap/m/ListItemBase";
import UnsavedPollinationsHandler from "./custom/UnsavedPollinationsHandler";
import EditPollinationDialogHandler from "./custom/EditPollinationDialogHandler";

/**
 * @namespace pollination.ui.controller
 */
export default class App extends BaseController {

	public formatter: formatter = new formatter();
	private _oTemporaryPollinationsHandler: PreviewPollinationHandler;
	private _oSettingsHandler: SettingsHandler;
	private _oActiveFlorescencesHandler: ActiveFlorescencesHandler;
	private _oPollinationsHandler: PollinationsHandler;
	private _oUnsavedPollinationsHandler: UnsavedPollinationsHandler;

	public onInit(): void {

		this.getView().setModel(new JSONModel({
			// isMobile: Device.browser.mobile,
			isMobile: browser.mobile
		}), "view");


		// initialize settings model and it's handler (available colors and pollination status)
		const oSettingsModel = new JSONModel(); // data type BResultsSettings
		this.getView().setModel(oSettingsModel, "settingsModel");
		this._oSettingsHandler = new SettingsHandler(oSettingsModel);
		this._oSettingsHandler.loadSettings();

		// initialize model with ongoing  pollinations in the database and it's handler
		const oPollinationModel = new JSONModel(<BOngoingPollination[]>[]);
		this.getView().setModel(oPollinationModel, "ongoingPollinationsModel");
		this._oPollinationsHandler = new PollinationsHandler(oPollinationModel);
		this._oPollinationsHandler.loadPollinations();

		// initialize empty model for new pollinations that were not saved, yet
		var oUnsavedPollinationsModel = new JSONModel([]);  // date type LUnsavedPollination[]
		this.getView().setModel(oUnsavedPollinationsModel, "newPollinationsModel");
		this._oUnsavedPollinationsHandler = new UnsavedPollinationsHandler(oUnsavedPollinationsModel, this._oPollinationsHandler, 
			// this._oActiveFlorescencesHandler
			);		

		// initialize empty model for new temporary pollination (added to the new pollinations by add button)
		var oTemporaryPollinationModel = new JSONModel();  // todo entity
		this.getView().setModel(oTemporaryPollinationModel, "newTempPollinationInput");
		this._oTemporaryPollinationsHandler = new PreviewPollinationHandler(oTemporaryPollinationModel, this._oUnsavedPollinationsHandler)

		// initialize active florescence model and it's handler (active florescences)
		const oFlorescenceModel = new JSONModel();  // data type BActiveFlorescence[]
		this.getView().setModel(oFlorescenceModel, "currentFlorescencesModel");
		this._oActiveFlorescencesHandler = new ActiveFlorescencesHandler(oFlorescenceModel, this._oTemporaryPollinationsHandler);
		this._oActiveFlorescencesHandler.loadFlorescences();

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
		this._oTemporaryPollinationsHandler.setFlorescencePlant(florescence);
		// this._new_temp_pollination.florescencePlantName = florescence.plant_name;
		// this._new_temp_pollination.florescencePlantId = florescence.plant_id;
		// this._new_temp_pollination.florescenceId = florescence.id;
		// this._new_temp_pollination.florescenceStatus = florescence.florescence_status;  // for enabling/disabling preview button

		// update the available colors for the florescence
		const aAvailableColors: string[] = this._oUnsavedPollinationsHandler.getAvailableColors(florescence);
		this._oTemporaryPollinationsHandler.setAvailableColors(aAvailableColors);
		// this._new_temp_pollination.availableColorsRgb = this._getAvailableColors(florescence);
		// (<JSONModel>this.getView().getModel("newTempPollinationInput")).updateBindings(false);
	}

	public onSelectionChangedPollenDonor(oEvent: Event) {
		const oListItem = <ListItem>oEvent.getParameter('listItem')
		const oPollenDonor = <BPotentialPollenDonor>oListItem.getBindingContext('potentialPollenDonorsModel')!.getObject();

		this._oTemporaryPollinationsHandler.setPollenDonorPlant(oPollenDonor);
		// this._new_temp_pollination.pollenDonorPlantName = pollenDonor.plant_name;
		// this._new_temp_pollination.pollenDonorPlantId = pollenDonor.plant_id;
		// this._new_temp_pollination.pollenType = pollenDonor.pollen_type;
		// var onewTempPollinationInput = this.getView().getModel("newTempPollinationInput");
		// (<JSONModel>onewTempPollinationInput).updateBindings(false);
	}

	private _onDoneLoadPotentialPollenDonors(result: BResultsPotentialPollenDonors) {
		const aPotentialPollenDonors = <BPotentialPollenDonor[]>result.potentialPollenDonorCollection
		var oModel = new JSONModel(aPotentialPollenDonors);
		this.getView().setModel(oModel, "potentialPollenDonorsModel");

		this._oTemporaryPollinationsHandler.resetTempPollinationPollen();
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
		const sColor = oEvent.getParameter('value');
		this._oTemporaryPollinationsHandler.setLabelColorRGB(sColor)
		// this._new_temp_pollination.labelColorRgb = oEvent.getParameter('value');
		// var onewTempPollinationInput = <JSONModel>this.getView().getModel("newTempPollinationInput");
		// onewTempPollinationInput.updateBindings(false);
	}

	public onPressAddAsPollinationPreview(oEvent: Event) {
		// get selected florescence and selected pollen donor
		const oActiveFlorescencesList = <List>this.getView().byId('activeFlorescencesList');
		const oSelectedFlorescenceListItem = <ListItemBase>oActiveFlorescencesList.getSelectedItem(); // todo entity
		const oFlorescence = <BActiveFlorescence>oSelectedFlorescenceListItem.getBindingContext('currentFlorescencesModel')!.getObject()
		
		// if (!oSelectedFlorescenceListItem) {
		// 	MessageToast.show('Please select a florescence.')
		// 	return;
		// }		
		const oPollenDonorList = <List>this.getView().byId('potentialPollenDonorsList');
		var oSelectedPollenDonorListItem = <ListItemBase>oPollenDonorList.getSelectedItem();
		var oSelectedPollenDonor = <BPotentialPollenDonor>oSelectedPollenDonorListItem.getBindingContext('potentialPollenDonorsModel')!.getObject();
		
		this._oTemporaryPollinationsHandler.preview(oFlorescence, oSelectedPollenDonor)

		// var selectedFlorescenceItem = (<List>this.getView().byId('activeFlorescencesList')).getSelectedItem();
		// if (selectedFlorescenceItem === null || selectedFlorescenceItem === undefined) {
		// 	MessageToast.show('Please select a florescence.')
		// 	return;
		// }
		// var selectedFlorescence = <Florescence>selectedFlorescenceItem.getBindingContext('currentFlorescencesModel')!.getObject();

		// var selectedPollenDonorItem = (<List>this.getView().byId('potentialPollenDonorsList')).getSelectedItem();
		// var selectedPollenDonor = <PollenDonor>selectedPollenDonorItem.getBindingContext('potentialPollenDonorsModel')!.getObject();

		// // var onewTempPollinationInput = this.getView().getModel("newTempPollinationInput");
		// // var oNewTempPollination = onewTempPollinationInput.getData();
		// if (this._new_temp_pollination.florescencePlantName !== selectedFlorescence.plant_name
		// 	|| this._new_temp_pollination.pollenDonorPlantName !== selectedPollenDonor.plant_name) {
		// 	MessageToast.show('Bad Plant Names.')
		// 	return;
		// }

		// switch (this._new_temp_pollination.location) {
		// 	case 'indoor_led': var locationText = 'indoor LED'; break;
		// 	case 'indoor': var locationText = 'indoor'; break;
		// 	case 'outdoor': var locationText = 'outdoor'; break;
		// 	default:
		// 		MessageToast.show('Bad Location.')
		// 		return;
		// }

		// if (!this._new_temp_pollination.labelColorRgb || this._new_temp_pollination.labelColorRgb === '' || this._new_temp_pollination.labelColorRgb === 'transparent') {
		// 	MessageToast.show('Choose Color first.')
		// 	return;
		// }

		// // add new pollination to the newPollinationsModel
		// var oNewPollination = {
		// 	florescenceId: this._new_temp_pollination.florescenceId,
		// 	seedCapsulePlantName: selectedFlorescence.plant_name,
		// 	seedCapsulePlantId: selectedFlorescence.plant_id,
		// 	pollenDonorPlantName: selectedPollenDonor.plant_name,
		// 	pollenDonorPlantId: selectedPollenDonor.plant_id,
		// 	pollenType: this._new_temp_pollination.pollenType,
		// 	pollinationTimestamp: this._new_temp_pollination.pollinationTimestamp,  // '%Y-%m-%d %H:%M' without seconds
		// 	location: this._new_temp_pollination.location,
		// 	locationText: locationText,
		// 	labelColorRgb: this._new_temp_pollination.labelColorRgb
		// }
		// this._new_pollinations.push(oNewPollination);
		// (<JSONModel>this.getView().getModel("newPollinationsModel")).updateBindings(false);

		// // remove label color from available colors for this florescence
		// this._new_temp_pollination.labelColorRgb = 'transparent';
		// this._new_temp_pollination.availableColorsRgb = this._getAvailableColors(selectedFlorescence);
		// (<JSONModel>this.getView().getModel("newTempPollinationInput")).updateBindings(false);
	}

	// private _deleteNewPollination(oNewPollination: LUnsavedPollination) {
	// 	var index = this._new_pollinations.indexOf(oNewPollination);
	// 	this._new_pollinations.splice(index, 1);
	// 	(<JSONModel>this.getView().getModel("newPollinationsModel")).updateBindings(false);
	// }

	public onPressDeleteNewPollinationButton(oEvent: Event) {
		const oUnsavedPollination = <LUnsavedPollination>(<Button>oEvent.getSource()).getBindingContext("newPollinationsModel")!.getObject();  // todo Type
		this._oUnsavedPollinationsHandler.removePollination(oUnsavedPollination);
		// this._deleteNewPollination(oNewPollination);
	}

	public onPressSaveNewPollinationButton(oEvent: Event) {
		const oUnsavedPollinationsModel = <JSONModel>this.getView().getModel("newPollinationsModel")
		const oControl = <Control>oEvent.getSource()
		const oPollination = <FRequestNewPollination>oControl.getBindingContext("newPollinationsModel")!.getObject();
		this._oUnsavedPollinationsHandler.savePollination(oPollination)

		// const oControl = <Control>oEvent.getSource()
		// var oNewPollination = <FRequestNewPollination>oControl.getBindingContext("newPollinationsModel")!.getObject();
		// $.ajax({
		// 	url: Util.getServiceUrl('pollinations'),
		// 	data: JSON.stringify(oNewPollination),
		// 	context: this,
		// 	async: true,
		// 	type: 'POST',
		// 	contentType: 'application/json'
		// })
		// 	.done(this._onDonePostNewPollination.bind(this, oNewPollination))
		// 	.fail(Util.onFail.bind(this, 'Save new pollinations'))
	}

	// private _onDonePostNewPollination(oNewPollination: LUnsavedPollination) {
	// 	// having posted a new pollination, re-read the ongoing pollinations list
	// 	this._oPollinationsHandler.loadPollinations();

	// 	// also re-read the active florescences list
	// 	this._oActiveFlorescencesHandler.loadFlorescences();

	// 	// remove saved new pollination from new pollinations model 
	// 	this.getView().getModel("newPollinationsModel")
	// 	this._deleteNewPollination(oNewPollination);
	// }

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
	// 		edit Pollination
	////////////////////////////////////////////////////////////////////////////////////////////////////////////
	public onPressEditOngoingPollination(oEvent: Event): void {
		const oSettingsModel = <JSONModel>this.getView().getModel("settingsModel");
		const oOngoingPollination = <BOngoingPollination>(<Button>oEvent.getSource()).getBindingContext("ongoingPollinationsModel")!.getObject();
		const oPollinationModel = <JSONModel>this.getView().getModel("ongoingPollinationsModel");

		const oEditPollinationDialogHandler = new EditPollinationDialogHandler(oSettingsModel, this._oActiveFlorescencesHandler, this._oPollinationsHandler);
		oEditPollinationDialogHandler.openDialogEditOngoingPollination(oOngoingPollination, this.getView());

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

		this._oActiveFlorescencesHandler.loadFlorescences();
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
	public onPressEditActiveFlorescence(oEvent: Event) {
		// open the dialog to edit the selected active florescence
		const oControl = <Control>oEvent.getSource();
		const oFlorescence = <BActiveFlorescence>oControl.getBindingContext("currentFlorescencesModel")!.getObject();
		
		const oEditFlorescenceDialogHandler = new EditFlorescenceDialogHandler(this._oActiveFlorescencesHandler);
		oEditFlorescenceDialogHandler.openDialogEditActiveFlorescence(this.getView(), oFlorescence)
	}
	public onPressNewActiveFlorescence(oEvent: Event) {
		// open the dialog to create a new active florescence
		const oNewFlorescenceDialogHandler = new NewFlorescenceDialogHandler(this._oActiveFlorescencesHandler);
		oNewFlorescenceDialogHandler.openDialogNewActiveFlorescence(this.getView());
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