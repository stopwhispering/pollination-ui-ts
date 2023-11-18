
import Event from "sap/ui/base/Event";
import { PropertyBindingInfo } from "sap/ui/base/ManagedObject";
import { $ImageSettings } from "sap/m/Image";

declare module "./HoverImage" {

    export interface HoverImage$HoverEventParameters {
        event: "onmouseover" | "onmouseout" | "onclick";
    }

}