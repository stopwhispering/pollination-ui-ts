import { BPollinationAttempt } from "pollination/ui/interfaces/entities";
import Popover from "sap/m/Popover";
import ManagedObject from "sap/ui/base/ManagedObject";
import Control from "sap/ui/core/Control";
import Fragment from "sap/ui/core/Fragment";
import View from "sap/ui/core/mvc/View";
import JSONModel from "sap/ui/model/json/JSONModel";
import BindingMode from "sap/ui/model/BindingMode";

/**
 * @namespace pollination.ui.controller.custom
 */
export default class HistoricalPollinationPopoverHandler extends ManagedObject {

    private _oPopover: Popover;
    private _oView: View;
    private _oPopoverModel: JSONModel;

    public constructor(oView: View) {
        super();

        this._oView = oView;

        this._oPopoverModel = new JSONModel();
        this._oPopoverModel.setDefaultBindingMode(BindingMode.OneWay); 
    }

    public async openPopover(oHistoricalPollination: BPollinationAttempt, oOpenBy: Control) {
        // the popup is closed when hovering away. However, we can't destroy it upon closing as
        // hovering to another hover area happens too fast and would result in duplicate id errors.
        if(!this._oPopover){
            this._oPopover = await this._initializeFragment();
        }

        this._oPopoverModel.setData(oHistoricalPollination);

        if (!this._oPopover.isOpen())
            this._oPopover.openBy(oOpenBy, true);

    }

    private async _initializeFragment(){

        const oPopover = <Popover>await Fragment.load({
			name: "pollination.ui.view.fragments.HistoricalPollinationPopover",
			id: this._oView.getId(),
			controller: this,
		});
        this._oView.addDependent(oPopover);
        oPopover.setModel(this._oPopoverModel, 'popoverModel');
        return oPopover;
    }

    public close(): void {
        if(this._oPopover && this._oPopover.isOpen())
            this._oPopover.close();
    }

}