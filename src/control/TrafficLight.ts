import Control from "sap/ui/core/Control";
import RenderManager from "sap/ui/core/RenderManager";
import type { MetadataOptions } from "sap/ui/core/Element";

/**
 * @namespace pollination.ui.control
 */
export default class TrafficLight extends Control {

    static readonly metadata: MetadataOptions = {                              
        properties : {
           	"value" : {type: "int", defaultValue: "0"},
           	"text" :  {type: "string", defaultValue: ""},
			"size" : {type: "sap.ui.core.CSSSize", defaultValue: "50px"},			
			"asc" : {type: "boolean", defaultValue: true},	
			"rlimit" : {type: "int", defaultValue: "90"},	
			"glimit" : {type: "int", defaultValue: "75"}			
        }
    }

    renderer = {
		apiVersion: 2,
        render: (oRm: RenderManager, oControl: TrafficLight) => {

			oRm.openStart("div", oControl);
            // @ts-ignore
			oRm.style("width", oControl.getSize());
            // @ts-ignore
			oRm.style("height", oControl.getSize());
            // @ts-ignore
            if(oControl.getAsc()){
                // @ts-ignore
                if(oControl.getValue() > oControl.getRlimit()){
                    oRm.class("circlered-text"); 
                    // @ts-ignore
                }else if((oControl.getValue() <= oControl.getRlimit()) && (oControl.getValue() > oControl.getGlimit())){
                    oRm.class("circleyellow-text"); 			
                }else{
                    oRm.class("circlegreen-text"); 			
                }
            }else{
                // @ts-ignore
                if(oControl.getValue() <= oControl.getRlimit()){
                    oRm.class("circlered-text"); 
                    // @ts-ignore
                }else if((oControl.getValue() > oControl.getRlimit()) && (oControl.getValue() < oControl.getGlimit())){
                    oRm.class("circleyellow-text"); 			
                }else{
                    oRm.class("circlegreen-text"); 			
                }		
            }
            oRm.openEnd();

			oRm.openStart("div").openEnd();  
            // @ts-ignore
            oRm.text(oControl.getText());  
			oRm.close("div");

			oRm.close("div");
        }
    }
}