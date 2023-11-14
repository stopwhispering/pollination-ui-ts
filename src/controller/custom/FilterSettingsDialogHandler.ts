import ViewSettingsDialog from "sap/m/ViewSettingsDialog";
import ManagedObject from "sap/ui/base/ManagedObject";
import Control from "sap/ui/core/Control";
import Fragment from "sap/ui/core/Fragment";
import View from "sap/ui/core/mvc/View";
import JSONModel from "sap/ui/model/json/JSONModel";
import Event from "sap/ui/base/Event";
import PollinationsHandler from "./PollinationsHandler";

/**
 * @namespace pollination.ui.controller.custom
 */
export default class FilterSettingsDialogHandler extends ManagedObject {

    private _oStateModel: JSONModel;
    private _oFilterSettingsDialog: ViewSettingsDialog;
    private _oPollinationsHandler: PollinationsHandler;
    private _oFilterSettingsInputModel: JSONModel;

    public constructor(oStateModel: JSONModel, _oPollinationsHandler: PollinationsHandler) {
        super();
        this._oStateModel = oStateModel;
        this._oPollinationsHandler = _oPollinationsHandler;
    }

	public openFilterSettingsDialog(oViewToAddTo: View): void {  // TODO: add type for oPollination
		
        Fragment.load({
			name: "pollination.ui.view.fragments.FilterSettings",
			id: oViewToAddTo.getId(),
			controller: this
		}).then((oControl: Control | Control[]) => {
			this._oFilterSettingsDialog = <ViewSettingsDialog>oControl;
			oViewToAddTo.addDependent(this._oFilterSettingsDialog);  // required to bind fragment to view

            // we don't directly modify the state model but rather a model that is bound to the fragment
            // this enables us to cancel the changes if the user cancels the dialog
            // current filter
            const include_ongoing_pollinations = this._oStateModel.getProperty('/include_ongoing_pollinations');
            const include_finished_pollinations = this._oStateModel.getProperty('/include_finished_pollinations');
            this._oFilterSettingsInputModel = new JSONModel(
                {'ongoing_pollinations': include_ongoing_pollinations,
                 'finished_pollinations': include_finished_pollinations,}
            );
			this._oFilterSettingsDialog.setModel(this._oFilterSettingsInputModel, "filterSettingsInput");
			this._oFilterSettingsDialog.open();
		});		


	}
	onConfirmSettings(oEvent: Event) {
		this._oStateModel.setProperty("/include_ongoing_pollinations", 
                                      this._oFilterSettingsInputModel.getProperty("/ongoing_pollinations"));
		this._oStateModel.setProperty("/include_finished_pollinations", 
                                      this._oFilterSettingsInputModel.getProperty("/finished_pollinations"));

                                      
        // this._oActiveFlorescencesHandler.loadFlorescences();
        this._oPollinationsHandler.loadPollinations();
	}

}