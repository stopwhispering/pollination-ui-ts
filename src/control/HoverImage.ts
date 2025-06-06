import Image from "sap/m/Image";
import type { MetadataOptions } from "sap/ui/core/Element";
import RenderManager from "sap/ui/core/RenderManager";
import includeStylesheet from "sap/ui/dom/includeStylesheet";

/**
 * @namespace pollination.ui.control
 */
export default class HoverImage extends Image {
  // The following three lines were generated and should remain as-is to make TypeScript aware of the constructor signatures
  constructor(idOrSettings?: string | $HoverImageSettings);
  constructor(id?: string, settings?: $HoverImageSettings);
  constructor(id?: string, settings?: $HoverImageSettings) { super(id, settings); }


    static readonly metadata: MetadataOptions = {                              
      properties: {
        plantName: {type: "string", defaultValue: null},
        plantId: {type: "int", defaultValue: null}
      },
      events: {
        hover: {},  // onmouseover, onmouseout; existing events are not overwritten
        press: {},   // onclick
        hoverPress: {}  // fired from onmouseover, onmouseout, onclick
      }
    }

    init(){
        super.init();
        includeStylesheet('control/HoverImage.css');
        // this.addStyleClass("hover-image");
    }

    onmouseover = () => {  
        // const params: HoverImage$HoverEventParameters = {event: "onmouseover"};
        // // this.fireEvent('hover', params);
        // this.fireEvent('hoverPress', params);
    };
    
    onmouseout = () => {  
        // const params: HoverImage$HoverEventParameters = {event: "onmouseout"};
        // // this.fireEvent('hover', params);
        // this.fireEvent('hoverPress', params);
    };

    onclick = () => {  
      const params: HoverImage$HoverEventParameters = {event: "onclick"};
        // this.fireEvent('press', params);
        // this.fireEvent('press');
        this.fireEvent('hoverPress');
    };

    static renderer = {

      apiVersion: 2,
          render: (oRm: RenderManager, oControl: HoverImage) => {
            oRm.openStart("div", oControl);
            oRm.class("rounded");
            oRm.openEnd();
            Image.prototype.getRenderer().render(oRm, oControl);
            oRm.close("div");
          } 
    }

    // static renderer = {}// add nothing, just inherit the ButtonRenderer as is; 
    //                      // could also specify this explicitly with:  renderer:"sap.m.ImageRenderer"


}