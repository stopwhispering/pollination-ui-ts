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

	public async triggerRetrain() {
        const oResult = <BResultsRetrainingPollinationToSeedsModel> await Util.post(Util.getServiceUrl('retrain_probability_pollination_to_seed_model'));
        this._openResponseDialog(oResult.model, oResult.mean_f1_score);
    }

    private _openResponseDialog(model: string, mean_f1_score: float) {
        const oSuccessMessageDialog = new Dialog({
            type: DialogType.Message,
            title: "Success",
            state: ValueState.Success,
            content: new Text({ text: "Trained Model: " + model + "\n" + "Mean F1 Score: " + mean_f1_score }),
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