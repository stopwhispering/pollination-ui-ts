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

    public static getToday() : any{
		// return today as string in format 'yyyy-MM-dd'
		return (new Date()).toISOString().substring(0,10);  // e.g. '2022-11-17';
    }

    private static _componentToHex(c: int): string {
		// 112 -> '70'
		const sHex = c.toString(16);
		return sHex.length == 1 ? "0" + sHex : sHex;
	}

	public static rgbToHex(sRgb: string): string {
		// 'rgb(112,31,31)' -> '#701f1f'
		const sRgbWithoutBrackets = sRgb.substring(4, sRgb.length - 1);
		const aRgb = sRgbWithoutBrackets.split(',');
		const sHex = "#" + this._componentToHex(parseInt(aRgb[0])) + this._componentToHex(parseInt(aRgb[1])) + this._componentToHex(parseInt(aRgb[2]));
		return sHex;
	}

}