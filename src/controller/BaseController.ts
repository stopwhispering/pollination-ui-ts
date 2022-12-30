import Fragment from "sap/ui/core/Fragment";
import Controller from "sap/ui/core/mvc/Controller";
import Control from "sap/ui/core/Control";
import { LIdToFragmentMap } from "../interfaces/entitiesLocal";
import Dialog from "sap/m/Dialog";
import Popover from "sap/m/Popover";

/**
 * @namespace pollination.ui.controller
 */
export default class BaseController extends Controller {

    public applyToFragment(sId: string, fn: Function, fnInit?: Function) : any {
        //create fragment singleton and apply supplied function to it (e.g. open, close)
        // if stuff needs to be done only once, supply fnInit where first usage happens
        
        //example usages:
        // this.applyToFragment('dialogAddTag', _onOpenAddTagDialog.bind(this));
        // this.applyToFragment('dialogFindSpecies', (o)=>o.close());
        // this.applyToFragment('dialogFindSpecies', (o)=>{doA; doB; doC;}, fnMyInit);
        
        //fragment id to fragment file path
        var mIdToFragment: LIdToFragmentMap = {
            maintainPollenContainers: 'pollination.ui.view.fragments.MaintainPollenContainers',
        }

        var oView = this.getView();
        if(oView.byId(sId)){
            fn(oView.byId(sId));
        } else {
            Fragment.load({
                name: mIdToFragment[sId],
                id: oView.getId(),
                controller: this
            }).then(function(oFragment: Control | Control[]){
                oView.addDependent(<Control>oFragment);
                if(fnInit){
                    fnInit(oFragment);
                }
                fn(oFragment);
            });
        }
    }

    public onCancelDialog(dialogId: string) : void {
        // generic handler for fragments to be closed
        this.applyToFragment(dialogId,(oDialog: Dialog|Popover)=>oDialog.close());
    }
}