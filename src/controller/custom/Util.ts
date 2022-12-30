import Constants from "pollination/ui/Constants";
import MessageToast from "sap/m/MessageToast";
import ManagedObject from "sap/ui/base/ManagedObject";

/**
 * @namespace pollination.ui.controller.custom
 */
export default class Util extends ManagedObject {
    public static getServiceUrl(sUrl: string) {
		return Constants.base_url + sUrl;
	}

    public static onFail(trigger: string, status: any) : any{
        if (!!status && !!status.responseJSON && !!status.responseJSON.detail){
            var message = status.responseJSON.detail.message;
        } else {
            message = 'Error at "' + trigger + '" - See console.';
        }
        MessageToast.show(message);
    }

    public static format_timestamp(d: Date) : string{
        // convert date object to 'yyyy-MM-dd HH:mm' formatted string
        var iso = d.toISOString();  // '2022-11-15T22:29:30.457Z'
        var formatted = iso.replace('T', ' ').substring(0, 16);  // '2022-11-15 22:29'
        return formatted
    } 
}