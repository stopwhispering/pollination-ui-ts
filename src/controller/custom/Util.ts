import Constants from "pollination/ui/Constants";
import MessageToast from "sap/m/MessageToast";
import ManagedObject from "sap/ui/base/ManagedObject";
import Event from "sap/ui/base/Event";

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

	public static onFail(trigger: string, error: JQueryXHR, sTypeOfError: null | "timeout" | "error" | "abort" | "parsererror", oExceptionObject?: any): void {
		const _parseFastAPILegacyError = function (error: JQueryXHR): string | undefined {
			//fastapi manually thrown exceptions via throw_exception()	todo remove once all fastapi exceptions are migrated to HTTPException
			if ((!!error) && (!!error.responseJSON) && (!!error.responseJSON.detail) && (!!error.responseJSON.detail.type)) {
				console.log('fastapi legacy error');
				return error.responseJSON.detail.type + ': ' + error.responseJSON.detail.message;
			}
		}

		const _parseFastAPIHttpError = function (error: JQueryXHR): string | undefined {
			// raise e.g. via raise HTTPException(status_code=404, detail="Item not found") or subclasses
			console.log('fastapi http error');
			return undefined //todo
		}

		const _parseServerNotReachableError = function (error: JQueryXHR): string | undefined {
			//server not reachable
			const oErrorEvent: Event = <unknown>error as Event;
			if (!!oErrorEvent.getParameter && oErrorEvent.getParameter('message')) {
				console.log('server not reachable');
				return 'Could not reach Server (Error: ' + error.status + ' ' + error.statusText + ')'
			}
		}

		const _parsePydanticInputValidationError = function (error: JQueryXHR): string | undefined {
			//422 pydantic input validation error
			if (error && error.responseJSON && error.responseJSON.detail && Array.isArray(error.responseJSON.detail)) {
				console.log('pydantic input validation error');
				return JSON.stringify(error.responseJSON.detail);
			}
		}

		const _anyPythonError = function (error: JQueryXHR): string | undefined {
			//e.g. unexpected ValueError, TypeError, etc.
			if (error && !error.responseJSON && error.statusText === 'error') {
				console.log('Unexpected Python Error');
				return 'Unexpected Python Error';
			}
		}

		console.log(error);
		const sMsg = (_parseFastAPILegacyError(error) || _parseFastAPIHttpError(error) || _parseServerNotReachableError(error) ||
			_parsePydanticInputValidationError(error) || _anyPythonError(error) || 'Unknown Error. See onReceiveErrorGeneric and handle.');
		MessageToast.show(sMsg);
	}

	public static format_timestamp(d: Date): string {
		// convert date object to 'yyyy-MM-dd HH:mm' formatted string
		// javascript Date with timezones and string formatting is 
		// a total mess, so we don't use toISOString() or getTImezoneOffset() etc.
		// but instead format manually
		const sDate = d.getFullYear().toString() + '-' + d.getMonth().toString().padStart(2, "0") + '-' + d.getDate().toString().padStart(2, "0")
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