import Control from "sap/ui/core/Control";
import RenderManager from "sap/ui/core/RenderManager";
import type { MetadataOptions } from "sap/ui/core/Element";
import { PollinationStatus } from "../interfaces/enums";

/**
 * @namespace pollination.ui.control
 */
export default class PollinationIndicator extends Control {

    // @ts-ignore
	constructor(id?: string | $PollinationIndicatorSettings);
    // @ts-ignore
	constructor(id?: string, settings?: $PollinationIndicatorSettings);
    // @ts-ignore
	constructor(id?: string, settings?: $PollinationIndicatorSettings) {
		super(id, settings);
	}

    static readonly metadata: MetadataOptions = {                              
        properties : {
           	"value" : {type: "int", defaultValue: "0"},
			"size" : {type: "sap.ui.core.CSSSize", defaultValue: "50px"},			

            "pollinationStatus": {type: "string"},
            "ongoing": {type: "boolean"},
            "reverse": {type: "boolean"},
        },
		events: {
			press: {},  // onclick
			hover: {},  // onmouseover, onmouseout
            // onmouseover: {},
            // onfocusin: {},
		}
    }


    onclick = () => {
		this.fireEvent('press');
	};

    onmouseover = () => {   
        this.fireEvent('hover', {'action': 'on'});
    };

    onmouseout = () => {
        this.fireEvent('hover', {'action': 'out'});
    };


    static renderer = {
		apiVersion: 2,
        render: (oRm: RenderManager, oControl: PollinationIndicator) => {
            
            // @ts-ignore
            const pollination_status: PollinationStatus = oControl.getPollinationStatus();
            // @ts-ignore
            const ongoing: boolean = oControl.getOngoing();
            // @ts-ignore
            const reverse: boolean = oControl.getReverse();

            let color: string;
            let icon: string;
            let class_: string;
            switch (pollination_status) {
                case PollinationStatus.ATTEMPT:
                    color = '#BB0000';  // red
                    icon = '🖌';
                    class_ = "circle_attempt-text";
                    break;
                // case "seed_capsule":
                case PollinationStatus.SEED_CAPSULE:
                    color = '#BB0000';  // red
                    icon = '⬮';
                    class_ = "circle_seed_capsule-text";
                    break;
                // case "seed":
                case PollinationStatus.SEED:
                    color = "#362312";  // brown
                    icon = '⋮';
                    class_ = "circle_seed-text";
                    break;
                // case "germinated":
                case PollinationStatus.GERMINATED:
                    color = "#006400";  // green
                    icon = '𖥸';
                    class_ = "circle_germinated-text";
                    break;
                case PollinationStatus.UNKNOWN:
                    color = "#FFA500";  // orange
                    icon = '⚠';
                    class_ = "circle_unknown-text";
                    break;
                default:
                    throw new Error("Unknown pollination status: " + pollination_status);
            }

            if (ongoing && pollination_status != PollinationStatus.GERMINATED) {
                color = '#D6B85A';  // yellow
                class_ = "circle_ongoing-text";
            }
            const text = (reverse ? '(' + icon + ')' : icon);
            // return '<span style="color:' + color + '">' + text + '</span>';

			oRm.openStart("div", oControl);
            // @ts-ignore
			oRm.style("width", oControl.getSize());
            // @ts-ignore
			oRm.style("height", oControl.getSize());

            oRm.class("circle_all-text"); 
            oRm.class(class_); 

            // // @ts-ignore
            // if(oControl.getAsc()){
            //     // @ts-ignore
            //     if(oControl.getValue() > oControl.getRlimit()){
            //         oRm.class("circlered-text"); 
            //         // @ts-ignore
            //     }else if((oControl.getValue() <= oControl.getRlimit()) && (oControl.getValue() > oControl.getGlimit())){
            //         oRm.class("circleyellow-text"); 			
            //     }else{
            //         oRm.class("circlegreen-text"); 			
            //     }
            // }else{
            //     // @ts-ignore
            //     if(oControl.getValue() <= oControl.getRlimit()){
            //         oRm.class("circlered-text"); 
            //         // @ts-ignore
            //     }else if((oControl.getValue() > oControl.getRlimit()) && (oControl.getValue() < oControl.getGlimit())){
            //         oRm.class("circleyellow-text"); 			
            //     }else{
            //         oRm.class("circlegreen-text"); 			
            //     }		
            // }
            oRm.openEnd();

			oRm.openStart("div").openEnd();  
            // @ts-ignore
            oRm.text(text);  
            // oRm.text(oControl.getText());  
			oRm.close("div");

			oRm.close("div");
        }
    }
}