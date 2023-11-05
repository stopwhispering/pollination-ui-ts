import Button from "sap/m/Button";
import Dialog from "sap/m/Dialog";
import { ButtonType, DialogType } from "sap/m/library";
import Text from "sap/m/Text";
import ManagedObject from "sap/ui/base/ManagedObject";
import { ValueState } from "sap/ui/core/library";
import Util from "pollination/ui/controller/custom/Util";
import { BResultsRetraining, BResultsRetrainingPollinationToSeedsModel, BResultsRetrainingRipeningDays } from "pollination/ui/interfaces/entities";

/**
 * @namespace pollination.ui.controller.custom
 */
export default class MLModelTrainer extends ManagedObject {

	public async triggerRetrainPollinationProbabilityModel() {
        const oResult = <BResultsRetrainingPollinationToSeedsModel> await Util.post(Util.getServiceUrl('retrain_probability_pollination_to_seed_model'));
        this._openResponseDialog(oResult);
    }

	public async triggerRetrainRipeningDaysModel() {
        const oResult = <BResultsRetrainingRipeningDays> await Util.post(Util.getServiceUrl('retrain_ripening_days'));
        this._openResponseDialog(oResult);
    }

    private _openResponseDialog(oResult: BResultsRetraining) {
        const oSuccessMessageDialog = new Dialog({
            type: DialogType.Message,
            title: "Success",
            state: ValueState.Success,
            content: new Text({ text: "Trained Model: " 
                                + oResult.model + "\n" 
                                + oResult.estimator + "\n"
                                + oResult.metric_name + ": " + oResult.metric_value }),
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