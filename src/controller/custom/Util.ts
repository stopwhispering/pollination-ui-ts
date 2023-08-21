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
	
	public static getImageUrl(image_id: int, size_type?: string, width?: float, height?: float): string | undefined {
		if (!size_type) {
			var path = 'image/' + image_id.toString();
		} else if (size_type !== 'rem' && size_type != 'px') {
			console.log('Bad size type: ' + size_type);
			return undefined;
		} else {
			var width_px = (size_type === 'px') ? width : Math.round(width! * 16);
			var height_px = (size_type === 'px') ? height : Math.round(height! * 16);
			path = 'image/' + image_id.toString() + '?width=' + width_px + '&height=' + height_px;
		}

		return this.getServiceUrl(path);
	}

	private async http<T>(
		request: RequestInfo
	): Promise<Response> {
		let response: Response;
		try {
			response = await fetch(
				request
			);
		} catch (error) {
			// unexpected python error
			// e.g. 500 division by zero; no further information available
			console.log(error)
			let sMsg = JSON.stringify(error);
			MessageToast.show(sMsg);
			throw error;
		}

		if (!response.ok) {
			// todo use ErrorHandling.onFail()
			
			const err_body = await response.json();
			let sMsg: string;

			// pydantic validation error
			if (err_body.detail && Array.isArray(err_body.detail))
				sMsg = JSON.stringify(err_body.detail);

			// starlette httperror 
			// raise e.g. via raise HTTPException(status_code=404, detail="Item not found") or subclasses
			else if (err_body.detail && typeof err_body.detail === "string")
				sMsg = err_body.detail;
			
			else
				sMsg = JSON.stringify(err_body);

			console.log(err_body);
			MessageToast.show(sMsg);
			throw new Error(sMsg);
		}
		return await response.json();
	}

	public static async get<T>(
		path: string,
		args: RequestInit = { method: "GET" }
	): Promise<any> {
		return await Util.prototype.http<T>(new Request(path, args));
	}

	public static async post<T>(
		path: string,
		body?: any,
		args: RequestInit = { method: "POST", body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }
	): Promise<any> {
		return await Util.prototype.http<T>(new Request(path, args));
	}

	public static async del<T>(
		path: string,
		body?: any,
		args: RequestInit = { method: "DELETE", body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }
	): Promise<any> {
		return await Util.prototype.http<T>(new Request(path, args));
	}

	public static async put<T>(
		path: string,
		body: any,
		args: RequestInit = { method: "PUT", body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' } }
	): Promise<any> {
		return await Util.prototype.http<T>(new Request(path, args));
	}

	public static format_timestamp(d: Date): string {
		// convert date object to 'yyyy-MM-dd HH:mm' formatted string
		// javascript Date with timezones and string formatting is 
		// a total mess, so we don't use toISOString() or getTImezoneOffset() etc.
		// but instead format manually
		// note: getMonth() returns month zero-based!
		const sDate = d.getFullYear().toString() + '-' + (d.getMonth()+1).toString().padStart(2, "0") + '-' + d.getDate().toString().padStart(2, "0")
		const sTime = d.getHours().toString().padStart(2, "0") + ':' + d.getMinutes().toString().padStart(2, "0")
		return sDate + ' ' + sTime;
	}

	public static getToday(): any {
		// return today as string in format 'yyyy-MM-dd'
		return (new Date()).toISOString().substring(0, 10);  // e.g. '2022-11-17';
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