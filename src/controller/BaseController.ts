import Fragment from "sap/ui/core/Fragment";
import Controller from "sap/ui/core/mvc/Controller";
import Event from "sap/ui/base/Event";
import MessageToast from "sap/m/MessageToast";
import Constants from "../Constants";

/**
 * @namespace pollination.ui.controller
 */
export default class BaseController extends Controller {

    public getServiceUrl(sUrl: string) : string {
        return Constants.base_url + sUrl;
    }

    public applyToFragment(sId: string, fn: Function, fnInit?: Function) : any {
        //create fragment singleton and apply supplied function to it (e.g. open, close)
        // if stuff needs to be done only once, supply fnInit where first usage happens
        
        //example usages:
        // this.applyToFragment('dialogAddTag', _onOpenAddTagDialog.bind(this));
        // this.applyToFragment('dialogFindSpecies', (o)=>o.close());
        // this.applyToFragment('dialogFindSpecies', (o)=>{doA; doB; doC;}, fnMyInit);
        
        //fragment id to fragment file path
        var sIdToFragment = {
            editFlorescence: 'pollination.ui.view.fragments.EditFlorescence',
            editPollination: 'pollination.ui.view.fragments.EditPollination',
            maintainPollenContainers: 'pollination.ui.view.fragments.MaintainPollenContainers',
            addActiveFlorescence: 'pollination.ui.view.fragments.AddActiveFlorescence',
        }

        var oView = this.getView();
        if(oView.byId(sId)){
            fn(oView.byId(sId));
        } else {
            Fragment.load({
                name: sIdToFragment[sId],
                id: oView.getId(),
                controller: this
            }).then(function(oFragment: Fragment){
                oView.addDependent(oFragment);
                if(fnInit){
                    fnInit(oFragment);
                }
                fn(oFragment);	
            });
        }			
    }

    public onCancelDialog(dialogId: string) : void {
        // generic handler for fragments to be closed
        this.applyToFragment(dialogId,(o)=>o.close());
    }

    public onChangeInputPreventNonFloat(oEvent: Event) : void{
        // prevent non-float (i.e. non-numerical) input
        var newValue = oEvent.getParameter('newValue');
        if(isNaN(Number(newValue))){
            var sPath = oEvent.getSource().getBindingPath('value');  // e.g. '/seed_capsule_length'
            var oModel = oEvent.getSource().getBindingInfo('value').binding.getModel();
            oModel.setProperty(sPath, undefined);
            oModel.updateBindings();
        }
    }

    public onChangeInputPreventNonInt(oEvent: Event) : void{
        // prevent non-integer (i.e. non-numerical or decimal) input
        var newValue = oEvent.getParameter('newValue');
        if(isNaN(Number(newValue)) || !Number.isInteger(Number(newValue))){
            var sPath = oEvent.getSource().getBindingPath('value');  // e.g. '/seed_capsule_length'
            var oModel = oEvent.getSource().getBindingInfo('value').binding.getModel();
            oModel.setProperty(sPath, undefined);
            oModel.updateBindings();
        }
    }

    public onSetToday(sModel: string, sDateField: string) : any{
        // set today's date in a date field of a model; must be a simple object model, no collection
        var oModel = this.getView().getModel(sModel);
        var oData = oModel.getData();
        oData[sDateField] = (new Date()).toISOString().substring(0,10);  // e.g. '2022-11-17';
        oModel.updateBindings();
    }

    public format_timestamp(d: Date) : string{
        // convert date object to 'yyyy-MM-dd HH:mm' formatted string
        var iso = d.toISOString();  // '2022-11-15T22:29:30.457Z'
        var formatted = iso.replace('T', ' ').substr(0, 16);  // '2022-11-15 22:29'
        return formatted
    }

    public onFail(trigger: string, status: any) : any{
        if (!!status && !!status.responseJSON && !!status.responseJSON.detail){
            var message = status.responseJSON.detail.message;
        } else {
            message = 'Error at "' + trigger + '" - See console.';
        }
        MessageToast.show(message);
    }    

}