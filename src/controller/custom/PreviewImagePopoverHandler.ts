import { BActiveFlorescence, PotentialPollenDonor } from "pollination/ui/interfaces/entities";
import formatter from "pollination/ui/model/formatter";
import Popover from "sap/m/Popover";
import ManagedObject from "sap/ui/base/ManagedObject";
import Control from "sap/ui/core/Control";
import Fragment from "sap/ui/core/Fragment";
import View from "sap/ui/core/mvc/View";
import JSONModel from "sap/ui/model/json/JSONModel";
import Util from "./Util";
import { LPreviewImage, LPreviewImageBasics } from "pollination/ui/interfaces/entitiesLocal";
import { Image$PressEvent } from "sap/m/Image";

/**
 * @namespace pollination.ui.controller.custom
 */
export default class PreviewImagePopoverHandler extends ManagedObject {

    private _oImagePreviewPopover: Popover;  // "popoverPopupImage"
    private _oView: View;

    public formatter: formatter = new formatter();  // requires instant instantiation, otherwise formatter is not available in view

    public constructor(oView: View) {
        super();
        this._oView = oView;
    }

    public openPreviewImagePopover(oOpenBy: Control, oPreviewImageBasics: LPreviewImageBasics
    ): void {

        // the popup is closed when hovering away. However, we can't destroy it upon closing as
        // hovering to another hover area happens too fast and would result in duplicate id errors.
        if(!this._oImagePreviewPopover){
            // first time opening
            this._initializeFragment(this._oView, oOpenBy, oPreviewImageBasics);
            return;
        }

        this._attach_data(oPreviewImageBasics);
        (<JSONModel>this._oImagePreviewPopover.getModel('preview_image_model')).updateBindings(true);

        if (!this._oImagePreviewPopover.isOpen())
            this._oImagePreviewPopover.openBy(oOpenBy, true);
    }

    private _initializeFragment(oAttachTo: View, oOpenBy: Control, oPreviewImageBasics: LPreviewImageBasics): void{

        Fragment.load({
            name: "pollination.ui.view.fragments.PreviewImagePopover",
            id: oAttachTo.getId(),
            controller: this
        }).then((oControl: Control | Control[]) => {
            this._oImagePreviewPopover = <Popover>oControl;
            // oAttachTo.addDependent(this._oImagePreviewPopover);  // this would cause isuses
            this._attach_data(oPreviewImageBasics);
            this._oImagePreviewPopover.openBy(oOpenBy, true);
        });
    }

    private _attach_data(oPreviewImageBasics: LPreviewImageBasics): void {

        const oPreviewImageData: LPreviewImage = {
            plant_id: oPreviewImageBasics.plant_id,
            plant_name: oPreviewImageBasics.plant_name,
            plant_preview_image_id: oPreviewImageBasics.plant_preview_image_id!,
            plant_preview_image_url: this._getImageUrl(oPreviewImageBasics.plant_preview_image_id!),
        }
        const oPreviewImageModel = new JSONModel(oPreviewImageData);
        this._oImagePreviewPopover.setModel(oPreviewImageModel, 'preview_image_model');
    }

    private _getImageUrl(image_id: int): string {
        // get url for image in preview popup openened when hovering in florescence list
        // return Util.getImageUrl(image_id, 'px', 288, 288)!;
        return Util.getImageUrl(image_id)!;
    }

    public onClickImage(oEvent: Image$PressEvent): void {
        this._oImagePreviewPopover.close();
    }

    // public close(): void {
    //     if(this._oImagePreviewPopover && this._oImagePreviewPopover.isOpen())
    //         this._oImagePreviewPopover.close();
    // }

}