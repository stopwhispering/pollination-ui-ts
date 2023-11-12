import ManagedObject from "sap/ui/base/ManagedObject";
import Control from "sap/ui/core/Control";
import Fragment from "sap/ui/core/Fragment";
import View from "sap/ui/core/mvc/View";
import Event from "sap/ui/base/Event";
import Menu from "sap/m/Menu";
import MLModelTrainer from "./MLModelTrainer";

/**
 * @namespace pollination.ui.controller.custom
 */
export default class RetrainModelMenuHandler extends ManagedObject {

	private _oRetrainModelMenu: Menu;

	public constructor() {
		super();
	}

	public openRetrainModelMenu(oViewToAddTo: View, oButton: Control): void {
		Fragment.load({
			name: "pollination.ui.view.fragments.RetrainModelMenu",
			id: oViewToAddTo.getId(),
			controller: this,
		}).then(async (oControl: Control | Control[]) => {
			this._oRetrainModelMenu = <Menu>oControl;
			oViewToAddTo.addDependent(this._oRetrainModelMenu);
			this._oRetrainModelMenu.openBy(oButton, true);
		});
	}

    public async  onPressRetrainProbabilityModelPollinationToSeed(oEvent: Event) {
		await new MLModelTrainer().triggerRetrainPollinationProbabilityModel();
    }

    public async  onPressRetrainRipeningDaysModel(oEvent: Event) {
		await new MLModelTrainer().triggerRetrainRipeningDaysModel();
    }

    public async  onPressRetrainGerminationDaysModel(oEvent: Event) {
		await new MLModelTrainer().triggerRetrainGerminationDaysModel();
    }

    public async  onPressRetrainGerminationProbabilityModel(oEvent: Event) {
		await new MLModelTrainer().triggerRetrainGerminationProbabilityModel();
    }

}