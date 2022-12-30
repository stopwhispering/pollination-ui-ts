import Button from "sap/m/Button";
import Dialog from "sap/m/Dialog";
import { ButtonType, DialogType } from "sap/m/library";
import Text from "sap/m/Text";
import ManagedObject from "sap/ui/base/ManagedObject";
import { ValueState } from "sap/ui/core/library";
import Util from "pollination/ui/controller/custom/Util";
import { BResultsRetrainingPollinationToSeedsModel } from "pollination/ui/interfaces/entities";

/**
 * @namespace pollination.ui.controller.custom
 */
export default class PollinationToSeedProbabilityModelTrainer extends ManagedObject {

	public triggerRetrain() {
		$.ajax({
			url: Util.getServiceUrl('retrain_probability_pollination_to_seed_model'),
			context: this,
			async: true,
			type: 'POST',
			contentType: 'application/json'
		})
			.done(this._cbDoneRetrain)
			.fail(Util.onFail.bind(this, 'Retrain Pollination Model'))
	}

	private _cbDoneRetrain(result: BResultsRetrainingPollinationToSeedsModel) {
        const oSuccessMessageDialog = new Dialog({
            type: DialogType.Message,
            title: "Success",
            state: ValueState.Success,
            content: new Text({ text: "Trained Model: " + result.model + "\n" + "Mean F1 Score: " + result.mean_f1_score }),
            beginButton: new Button({
                type: ButtonType.Emphasized,
                text: "OK",
                press() {
                    oSuccessMessageDialog.close();
                }
            })
        });
        oSuccessMessageDialog.open();
	}
}