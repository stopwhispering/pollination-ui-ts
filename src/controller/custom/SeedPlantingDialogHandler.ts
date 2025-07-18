import { LSeedPlantingInputData, PlantEssentials, PollinationRead, SeedPlantingCreate, SeedPlantingRead, SeedPlantingUpdate, SoilWithCountRead } from "pollination/ui/interfaces/entities";
import Dialog, { Dialog$AfterCloseEvent } from "sap/m/Dialog";
import MessageBox from "sap/m/MessageBox";
import ManagedObject from "sap/ui/base/ManagedObject";
import Fragment from "sap/ui/core/Fragment";
import View from "sap/ui/core/mvc/View";
import JSONModel from "sap/ui/model/json/JSONModel";
import Util from "./Util";
import ActiveSeedPlantingsHandler from "./ActiveSeedPlantingsHandler";
import Button, { Button$PressEvent } from "sap/m/Button";
import MessageToast from "sap/m/MessageToast";
import SegmentedButton from "sap/m/SegmentedButton";
import { ListBase$SelectionChangeEvent } from "sap/m/ListBase";
import ListItemBase from "sap/m/ListItemBase";
import Event from "sap/ui/base/Event";
import { UpdateSeedPlantingInputData } from "pollination/ui/interfaces/entitiesLocal";

/**
 * @namespace pollination.ui.controller.custom
 */
export default class SeedPlantingDialogHandler extends ManagedObject {
	private _oActiveSeedPlantingsHandler: ActiveSeedPlantingsHandler;

	private _oDialog: Dialog;
	private _oSeedPlantingModel: JSONModel;
	private _oPlantNameDialog: Dialog;
	private _fnRemoveSelections?: Function;

	public constructor(oActiveSeedPlantingsHandler: ActiveSeedPlantingsHandler) {
		super();
		this._oActiveSeedPlantingsHandler = oActiveSeedPlantingsHandler;
	}

	public async openDialogForNewSeedPlanting(oViewToAddTo: View, oPollination: PollinationRead) {
		var oNewSeedPlanting: LSeedPlantingInputData = {
			status: 'planted',
			pollination_id: oPollination.id,
			comment: undefined,
			sterilized: true,
			soaked: true,
			covered: true,
			planted_on: Util.getToday(),  // e.g. '2022-11-17';
			count_planted: 5,
			soil_id: undefined,
		}
		this._oSeedPlantingModel = new JSONModel(oNewSeedPlanting);
		const sTitle = oPollination.seed_capsule_plant_name + ' × ' + oPollination.pollen_donor_plant_name;

		this._oDialog = await this._openDialog(oViewToAddTo, sTitle);
		(<Button>oViewToAddTo.byId('btnSaveNewSeedPlanting')).setVisible(true);
		this._oDialog.open();
		this.loadSoilsList(this._oDialog);
	}

	public async openDialogForUpdateSeedPlanting(oViewToAddTo: View, oSeedPlanting: SeedPlantingRead, fnRemoveSelections: Function) {
		// to allow for safe canceling, we don't work on the original data (from App.view) but on a clone
		this._fnRemoveSelections = fnRemoveSelections;  // to clear list selections after closing dialog
		
		const oSeedPlantingClone = <UpdateSeedPlantingInputData>JSON.parse(JSON.stringify(oSeedPlanting));
		oSeedPlantingClone.count_germinated_known = (oSeedPlantingClone.count_germinated !== undefined && 
													 oSeedPlantingClone.count_germinated !== null);
		
		this._oSeedPlantingModel = new JSONModel(oSeedPlantingClone);
		const sTitle = oSeedPlantingClone.seed_capsule_plant_name + ' × ' + oSeedPlantingClone.pollen_donor_plant_name;

		this._oDialog = await this._openDialog(oViewToAddTo, sTitle);
		(<Button>oViewToAddTo.byId('btnUpdateSeedPlanting')).setVisible(true);
		(<Button>oViewToAddTo.byId('btnDeleteSeedPlanting')).setVisible(true);
		(<Button>oViewToAddTo.byId('btnNewPlant')).setVisible(true);
		(<SegmentedButton>oViewToAddTo.byId('sbStatus')).setEnabled(true);
		this._oDialog.open();
		this.loadSoilsList(this._oDialog);
	}

	private async _openDialog(oViewToAddTo: View, sTitle: string): Promise<Dialog>{
		const oDialog = <Dialog>await Fragment.load({
			name: "pollination.ui.view.fragments.SeedPlanting",
			id: oViewToAddTo.getId(),
			controller: this,
		});
		oViewToAddTo.addDependent(oDialog);
		oDialog.setTitle(sTitle);
		oDialog.setModel(this._oSeedPlantingModel, "seedPlantingModel");
		return oDialog;
	}

	private loadSoilsList(oDialog: Dialog){
		const oPromise = Util.get(Util.getServiceUrl('events/soils'));
		oPromise.then((oResult: any) => {
			const aSoils = <SoilWithCountRead[]> oResult.SoilsCollection;
			const oSoilsModel = new JSONModel(aSoils);
			oDialog.setModel(oSoilsModel, "soilsModel");
		});
	}
	
	public onSelectSoil(oEvent: ListBase$SelectionChangeEvent) {
		const oSelectedItem = <ListItemBase>oEvent.getParameter('listItem')!;
		const oSoil = <SoilWithCountRead> oSelectedItem.getBindingContext('soilsModel')!.getObject();
		const oSeedPlanting: LSeedPlantingInputData = this._oSeedPlantingModel.getData();
		oSeedPlanting.soil_id = oSoil.id;
		oSeedPlanting.soil_name = oSoil.soil_name;
		this._oSeedPlantingModel.updateBindings(false);
	}

	public async onPressSaveNew(oEvent: Button$PressEvent) {
		const oNewSeedPlanting: SeedPlantingCreate = this._oSeedPlantingModel.getData();
		if (!oNewSeedPlanting.soil_id) {
			MessageToast.show("Please select a soil");
			return;	
		}
		await this._oActiveSeedPlantingsHandler.saveNewSeedPlanting(oNewSeedPlanting);
		this._oDialog.close();
	}

	public async onPressUpdate(oEvent: Button$PressEvent){
		const oSeedPlanting: UpdateSeedPlantingInputData = this._oSeedPlantingModel.getData();
		oSeedPlanting.count_germinated = oSeedPlanting.count_germinated_known ? oSeedPlanting.count_germinated : undefined;
		const oSeedPlantingUpdate = <SeedPlantingUpdate> oSeedPlanting;
		await this._oActiveSeedPlantingsHandler.updateSeedPlanting(oSeedPlantingUpdate);
		this._oDialog.close();
	}

	public async onPressDelete(oEvent: Button$PressEvent){
		const oSeedPlanting: SeedPlantingRead = this._oSeedPlantingModel.getData();
		// await this._oActiveSeedPlantingsHandler.deleteSeedPlanting(oSeedPlanting);
		// this._oDialog.close();

		MessageBox.confirm("Really delete Seed Planting? This cannot be undone.",
			{ onClose: (sAction: string) => {
				if (sAction === "OK"){
					this._oActiveSeedPlantingsHandler.deleteSeedPlanting(oSeedPlanting);
					this._oDialog.close();
				}}
			 }
		);
	}

	public async onPressNewPlant(oEvent: Button$PressEvent){
		const oSeedPlanting: SeedPlantingRead = this._oSeedPlantingModel.getData();
		const sPlantNameProposal = await this._oActiveSeedPlantingsHandler.proposePlantName(oSeedPlanting);
		await this._askForNewPlantName(sPlantNameProposal, oSeedPlanting);
	}

	private async _askForNewPlantName(sPlantNameProposal: string, oSeedPlanting: SeedPlantingRead) {
		if (this._oPlantNameDialog) {
			this._oPlantNameDialog.destroy();
		}

		this._oPlantNameDialog = <Dialog>await Fragment.load({
			name: "pollination.ui.view.fragments.PlantName",
			id: this._oDialog.getId(),
			controller: this,
		});
		this._oDialog.addDependent(this._oPlantNameDialog);
			// oDialog.setModel(this._oSeedPlantingModel, "seedPlantingModel");
		// return oDialog;
		const oInputPlantName = {
			plant_name: sPlantNameProposal,
			seed_planting: oSeedPlanting
		}
		const oInputPlantNameModel = new JSONModel(oInputPlantName);
		this._oPlantNameDialog.setModel(oInputPlantNameModel, "inputPlantNameModel");
		this._oPlantNameDialog.open();
	}

	public async onSubmitPlantName(oEvent: Button$PressEvent) {
		const oInputPlantName = (<JSONModel>this._oPlantNameDialog.getModel("inputPlantNameModel")).getData()
		const sPlantName = oInputPlantName.plant_name;
		const oSeedPlanting = <SeedPlantingRead>oInputPlantName.seed_planting;
		//as we are working on a clone of the original data and only the latter is updated, we need
		// to update our clone to have the new plant shown in the dialog
		const aOngoingPollinations: PollinationRead[] = await this._oActiveSeedPlantingsHandler.createNewPlantForSeedPlanting(oSeedPlanting, sPlantName);
		// find our pollination in the list of reloaded ongoing pollinations
		const oReloadedPollination = aOngoingPollinations.find((oPollination: PollinationRead) => oPollination.id == oInputPlantName.seed_planting.pollination_id);
		if (!oReloadedPollination) {
			throw new Error("Could not find pollination with id " + oInputPlantName.seed_planting.pollination_id);
		}
		// find our seed planting
		const oReloadedSeedPlanting = oReloadedPollination.seed_plantings.find((oSeedPlanting: SeedPlantingRead) => oSeedPlanting.id == oInputPlantName.seed_planting.id);
		if (!oReloadedSeedPlanting) {
			throw new Error("Could not find seed planting with id " + oInputPlantName.seed_planting.id);
		}
		// set our clone's list of plants to a new clone of the reloaded plants
		const aClonedReloadedPlants = JSON.parse(JSON.stringify(oReloadedSeedPlanting.plants));
		this._oSeedPlantingModel.setProperty('/plants', aClonedReloadedPlants);
		this._oSeedPlantingModel.updateBindings(false);
		this._oPlantNameDialog.close();
	}

	public onCancelPlantName(oEvent: Button$PressEvent) {
		this._oPlantNameDialog.close();
	}

	public onAfterClose(oEvent: Dialog$AfterCloseEvent) {
		// var oDialog = <Dialog>oEvent.getSource();
		this._oDialog.getModel("seedPlantingModel")!.destroy();
		this._oDialog.destroy();

		if (this._fnRemoveSelections) {
			this._fnRemoveSelections();
		}
	}

	onCancel(oEvent: Button$PressEvent) {
		this._oDialog.close();
	}
	onPressSetTodayButton(oEvent: Button$PressEvent) {
		this._oSeedPlantingModel.setProperty('/germinated_first_on', Util.getToday());
		this._oSeedPlantingModel.updateBindings(false);
	}

	onOpenPlantDetailsInNewTab(oEvent: Event) {
		const oControl = <Button>oEvent.getSource();
		const oContext = oControl.getBindingContext("seedPlantingModel");
		if (!oContext) {
			MessageToast.show('No plant selected');
			return;
		}
		const oPlant = <PlantEssentials>oContext.getObject();
		const sUrl = Util.getPlantDetailsUrl(oPlant.id);
		window.open(sUrl, '_blank');
	}
}