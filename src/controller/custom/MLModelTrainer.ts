import Button from "sap/m/Button";
import Dialog from "sap/m/Dialog";
import { ButtonType, DialogType } from "sap/m/library";
import Text from "sap/m/Text";
import ManagedObject from "sap/ui/base/ManagedObject";
import { ValueState } from "sap/ui/core/library";
import Util from "pollination/ui/controller/custom/Util";
import { BResultsRetraining, BResultsRetrainingFlorescenceProbability, BResultsRetrainingGerminationDays, BResultsRetrainingGerminationProbability, BResultsRetrainingMultipleMetrics, BResultsRetrainingPollinationToSeedsModel, BResultsRetrainingRipeningDays } from "pollination/ui/interfaces/entities";
import Carousel from "sap/m/Carousel";
import Image from "sap/m/Image";
import VBox from "sap/m/VBox";
import BusyIndicator from "sap/ui/core/BusyIndicator";

/**
 * @namespace pollination.ui.controller.custom
 */
export default class MLModelTrainer extends ManagedObject {

	public async triggerRetrainPollinationProbabilityModel() {
        BusyIndicator.show(0);
        const oResult = <BResultsRetrainingPollinationToSeedsModel> await Util.post(Util.getServiceUrl('retrain_probability_pollination_to_seed_model'));
        BusyIndicator.hide();
        
        // if results contains an image_urls property, open a dialog to show the images; otherwise, just show the simple text response
        if (oResult.image_urls && oResult.image_urls.length > 0) {
            this._openResponseWithImagesDialog(oResult.results, oResult.image_urls);
        } else {
            this._openResponseDialog(oResult.results);
        }
    }

	public async triggerRetrainRipeningDaysModel() {
        BusyIndicator.show(0);
        const oResult = <BResultsRetrainingRipeningDays> await Util.post(Util.getServiceUrl('retrain_ripening_days'));
        this._openResponseDialog(oResult);
        BusyIndicator.hide();
    }

	public async triggerRetrainGerminationDaysModel() {
        BusyIndicator.show(0);
        const oResult = <BResultsRetrainingGerminationDays> await Util.post(Util.getServiceUrl('retrain_germination_days_model'));
        this._openResponseDialog(oResult);
        BusyIndicator.hide();
    }

	public async triggerRetrainGerminationProbabilityModel() {
        BusyIndicator.show(0);
        const oResult = <BResultsRetrainingGerminationProbability> await Util.post(Util.getServiceUrl('retrain_germination_probability_model'));
        this._openResponseDialog(oResult);
        BusyIndicator.hide();
    }

	public async triggerRetrainFlorescenceProbabilityModel() {
        BusyIndicator.show(0);
        const oResult = <BResultsRetrainingFlorescenceProbability> await Util.post(Util.getServiceUrl('retrain_florescence_probability_model'));
        this._openResponseDialog(oResult);
        BusyIndicator.hide();
    }


    private _openResponseWithImagesDialog(oResult: BResultsRetrainingMultipleMetrics, aImageUrls: string[]) {
        // metrics is a dict from string to float; we concatenate its entries into a string
        // we round to two decimal places
        var sMetrics = Object.entries(oResult.metrics).map(([key, value]) => `${key}: ${value.toFixed(2)}`).join(", ");
        var sText = "Trained Model: " 
                                + oResult.model + "\n" 
                                + oResult.estimator + "\n"
                                + sMetrics;
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
            height: "600px",
            width: "900px",
            backgroundDesign:"Solid",
            pages: aImageUrls.map(url => new Image(
                { 
                    src: url, 
                    backgroundSize: "Contain",
                    densityAware: false
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