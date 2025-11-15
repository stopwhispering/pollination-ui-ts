import Button from "sap/m/Button";
import Dialog from "sap/m/Dialog";
import { ButtonType, DialogType } from "sap/m/library";
import Text from "sap/m/Text";
import ManagedObject from "sap/ui/base/ManagedObject";
import { ValueState } from "sap/ui/core/library";
import Util from "pollination/ui/controller/custom/Util";
import { BResultsRetraining, BResultsRetrainingFlorescenceProbability, BResultsRetrainingGerminationDays, BResultsRetrainingGerminationProbability, BResultsRetrainingPollinationToSeedsModel, BResultsRetrainingRipeningDays } from "pollination/ui/interfaces/entities";
import Carousel from "sap/m/Carousel";
import Image from "sap/m/Image";
import VBox from "sap/m/VBox";

/**
 * @namespace pollination.ui.controller.custom
 */
export default class MLModelTrainer extends ManagedObject {

	public async triggerRetrainPollinationProbabilityModel() {
        const oResult = <BResultsRetrainingPollinationToSeedsModel> await Util.post(Util.getServiceUrl('retrain_probability_pollination_to_seed_model'));
        
        // if results contains an image_urls property, open a dialog to show the images; otherwise, just show the simple text response
        if (oResult.image_urls && oResult.image_urls.length > 0) {
            this._openResponseWithImagesDialog(oResult.results, oResult.image_urls);
        } else {
            this._openResponseDialog(oResult.results);
        }
    }

	public async triggerRetrainRipeningDaysModel() {
        const oResult = <BResultsRetrainingRipeningDays> await Util.post(Util.getServiceUrl('retrain_ripening_days'));
        this._openResponseDialog(oResult);
    }

	public async triggerRetrainGerminationDaysModel() {
        const oResult = <BResultsRetrainingGerminationDays> await Util.post(Util.getServiceUrl('retrain_germination_days_model'));
        this._openResponseDialog(oResult);
    }

	public async triggerRetrainGerminationProbabilityModel() {
        const oResult = <BResultsRetrainingGerminationProbability> await Util.post(Util.getServiceUrl('retrain_germination_probability_model'));
        this._openResponseDialog(oResult);
    }

	public async triggerRetrainFlorescenceProbabilityModel() {
        const oResult = <BResultsRetrainingFlorescenceProbability> await Util.post(Util.getServiceUrl('retrain_florescence_probability_model'));
        this._openResponseDialog(oResult);
    }


    private _openResponseWithImagesDialog(oResult: BResultsRetraining, aImageUrls: string[]) {
        var sText = "Trained Model: " 
                                + oResult.model + "\n" 
                                + oResult.estimator + "\n"
                                + oResult.metric_name + ": " + oResult.metric_value
        if (oResult.notes) {
            sText += "\nNotes: " + oResult.notes;
        }        

        const oText = new Text({
            text: sText
        });

        aImageUrls = aImageUrls.map(url => Util.getServiceUrl(url));

        // avoid caching by adding a timestamp
        aImageUrls = aImageUrls.map(url => `${url}?timestamp=${new Date().getTime()}`);

        const oCarousel = new Carousel({
            height: "700px",
            width: "1200px",
            backgroundDesign:"Solid",
            pages: aImageUrls.map(url => new Image(
                { 
                    src: url, 
                    backgroundSize: "Contain",
                    // densityAware: false
                })
            )
        });

        // VBox to stack Text + Carousel
        const oVBox = new VBox({
            items: [oText, oCarousel],
            renderType: "Bare"
        });

        const oDialog = new Dialog({
            title: "Success",
            content: [oVBox],
            endButton: new Button({
                text: "Close",
                press: () => {
                    oDialog.close();
                }
            })
        });
        oDialog.addStyleClass("sapUiResponsiveContentPadding");
        oDialog.open();        

    }

    private _openResponseDialog(oResult: BResultsRetraining) {
        var sText = "Trained Model: " 
                                + oResult.model + "\n" 
                                + oResult.estimator + "\n"
                                + oResult.metric_name + ": " + oResult.metric_value
        if (oResult.notes) {
            sText += "\nNotes: " + oResult.notes;
        }

        const oSuccessMessageDialog = new Dialog({
            type: DialogType.Message,
            title: "Success",
            state: ValueState.Success,
            content: new Text({ text: sText }),
            beginButton: new Button({
                type: ButtonType.Emphasized,
                text: "Close",
                press() {
                    oSuccessMessageDialog.close();
                }
            })
        });
        oSuccessMessageDialog.open();
    }

}