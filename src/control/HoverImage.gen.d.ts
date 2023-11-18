import Event from "sap/ui/base/Event";
import { PropertyBindingInfo } from "sap/ui/base/ManagedObject";
import { $ImageSettings } from "sap/m/Image";

declare module "./HoverImage" {

    /**
     * Interface defining the settings object used in constructor calls
     */
    interface $HoverImageSettings extends $ImageSettings {
        plantName?: string | PropertyBindingInfo;
        plantId?: number | PropertyBindingInfo | `{${string}}`;
        hover?: (event: HoverImage$HoverEvent) => void;
        press?: (event: HoverImage$PressEvent) => void;
        hoverPress?: (event: HoverImage$HoverPressEvent) => void;
    }

    export default interface HoverImage {

        // property: plantName

        /**
         * Gets current value of property "plantName".
         *
         * @returns Value of property "plantName"
         */
        getPlantName(): string;

        /**
         * Sets a new value for property "plantName".
         *
         * When called with a value of "null" or "undefined", the default value of the property will be restored.
         *
         * @param plantName New value for property "plantName"
         * @returns Reference to "this" in order to allow method chaining
         */
        setPlantName(plantName: string): this;

        // property: plantId

        /**
         * Gets current value of property "plantId".
         *
         * @returns Value of property "plantId"
         */
        getPlantId(): number;

        /**
         * Sets a new value for property "plantId".
         *
         * When called with a value of "null" or "undefined", the default value of the property will be restored.
         *
         * @param plantId New value for property "plantId"
         * @returns Reference to "this" in order to allow method chaining
         */
        setPlantId(plantId: number): this;

        // event: hover

        /**
         * Attaches event handler "fn" to the "hover" event of this "HoverImage".
         *
         * When called, the context of the event handler (its "this") will be bound to "oListener" if specified,
         * otherwise it will be bound to this "HoverImage" itself.
         *
         * @param fn The function to be called when the event occurs
         * @param listener Context object to call the event handler with. Defaults to this "HoverImage" itself
         *
         * @returns Reference to "this" in order to allow method chaining
         */
        attachHover(fn: (event: HoverImage$HoverEvent) => void, listener?: object): this;

        /**
         * Attaches event handler "fn" to the "hover" event of this "HoverImage".
         *
         * When called, the context of the event handler (its "this") will be bound to "oListener" if specified,
         * otherwise it will be bound to this "HoverImage" itself.
         *
         * @param data An application-specific payload object that will be passed to the event handler along with the event object when firing the event
         * @param fn The function to be called when the event occurs
         * @param listener Context object to call the event handler with. Defaults to this "HoverImage" itself
         *
         * @returns Reference to "this" in order to allow method chaining
         */
        attachHover<CustomDataType extends object>(data: CustomDataType, fn: (event: HoverImage$HoverEvent, data: CustomDataType) => void, listener?: object): this;

        /**
         * Detaches event handler "fn" from the "hover" event of this "HoverImage".
         *
         * The passed function and listener object must match the ones used for event registration.
         *
         * @param fn The function to be called, when the event occurs
         * @param listener Context object on which the given function had to be called
         * @returns Reference to "this" in order to allow method chaining
         */
        detachHover(fn: (event: HoverImage$HoverEvent) => void, listener?: object): this;

        /**
         * Fires event "hover" to attached listeners.
         *
         * @param parameters Parameters to pass along with the event
         * @returns Reference to "this" in order to allow method chaining
         */
        fireHover(parameters?: HoverImage$HoverEventParameters): this;

        // event: press

        /**
         * Attaches event handler "fn" to the "press" event of this "HoverImage".
         *
         * When called, the context of the event handler (its "this") will be bound to "oListener" if specified,
         * otherwise it will be bound to this "HoverImage" itself.
         *
         * @param fn The function to be called when the event occurs
         * @param listener Context object to call the event handler with. Defaults to this "HoverImage" itself
         *
         * @returns Reference to "this" in order to allow method chaining
         */
        attachPress(fn: (event: HoverImage$PressEvent) => void, listener?: object): this;

        /**
         * Attaches event handler "fn" to the "press" event of this "HoverImage".
         *
         * When called, the context of the event handler (its "this") will be bound to "oListener" if specified,
         * otherwise it will be bound to this "HoverImage" itself.
         *
         * @param data An application-specific payload object that will be passed to the event handler along with the event object when firing the event
         * @param fn The function to be called when the event occurs
         * @param listener Context object to call the event handler with. Defaults to this "HoverImage" itself
         *
         * @returns Reference to "this" in order to allow method chaining
         */
        attachPress<CustomDataType extends object>(data: CustomDataType, fn: (event: HoverImage$PressEvent, data: CustomDataType) => void, listener?: object): this;

        /**
         * Detaches event handler "fn" from the "press" event of this "HoverImage".
         *
         * The passed function and listener object must match the ones used for event registration.
         *
         * @param fn The function to be called, when the event occurs
         * @param listener Context object on which the given function had to be called
         * @returns Reference to "this" in order to allow method chaining
         */
        detachPress(fn: (event: HoverImage$PressEvent) => void, listener?: object): this;

        /**
         * Fires event "press" to attached listeners.
         *
         * @param parameters Parameters to pass along with the event
         * @returns Reference to "this" in order to allow method chaining
         */
        firePress(parameters?: HoverImage$PressEventParameters): this;

        // event: hoverPress

        /**
         * Attaches event handler "fn" to the "hoverPress" event of this "HoverImage".
         *
         * When called, the context of the event handler (its "this") will be bound to "oListener" if specified,
         * otherwise it will be bound to this "HoverImage" itself.
         *
         * @param fn The function to be called when the event occurs
         * @param listener Context object to call the event handler with. Defaults to this "HoverImage" itself
         *
         * @returns Reference to "this" in order to allow method chaining
         */
        attachHoverPress(fn: (event: HoverImage$HoverPressEvent) => void, listener?: object): this;

        /**
         * Attaches event handler "fn" to the "hoverPress" event of this "HoverImage".
         *
         * When called, the context of the event handler (its "this") will be bound to "oListener" if specified,
         * otherwise it will be bound to this "HoverImage" itself.
         *
         * @param data An application-specific payload object that will be passed to the event handler along with the event object when firing the event
         * @param fn The function to be called when the event occurs
         * @param listener Context object to call the event handler with. Defaults to this "HoverImage" itself
         *
         * @returns Reference to "this" in order to allow method chaining
         */
        attachHoverPress<CustomDataType extends object>(data: CustomDataType, fn: (event: HoverImage$HoverPressEvent, data: CustomDataType) => void, listener?: object): this;

        /**
         * Detaches event handler "fn" from the "hoverPress" event of this "HoverImage".
         *
         * The passed function and listener object must match the ones used for event registration.
         *
         * @param fn The function to be called, when the event occurs
         * @param listener Context object on which the given function had to be called
         * @returns Reference to "this" in order to allow method chaining
         */
        detachHoverPress(fn: (event: HoverImage$HoverPressEvent) => void, listener?: object): this;

        /**
         * Fires event "hoverPress" to attached listeners.
         *
         * @param parameters Parameters to pass along with the event
         * @returns Reference to "this" in order to allow method chaining
         */
        fireHoverPress(parameters?: HoverImage$HoverPressEventParameters): this;
    }

    /**
     * Interface describing the parameters of HoverImage's 'hover' event.
     */
    // eslint-disable-next-line
    export interface HoverImage$HoverEventParameters {
    }

    /**
     * Interface describing the parameters of HoverImage's 'press' event.
     */
    // eslint-disable-next-line
    export interface HoverImage$PressEventParameters {
    }

    /**
     * Interface describing the parameters of HoverImage's 'hoverPress' event.
     */
    // eslint-disable-next-line
    export interface HoverImage$HoverPressEventParameters {
    }

    /**
     * Type describing the HoverImage's 'hover' event.
     */
    export type HoverImage$HoverEvent = Event<HoverImage$HoverEventParameters>;

    /**
     * Type describing the HoverImage's 'press' event.
     */
    export type HoverImage$PressEvent = Event<HoverImage$PressEventParameters>;

    /**
     * Type describing the HoverImage's 'hoverPress' event.
     */
    export type HoverImage$HoverPressEvent = Event<HoverImage$HoverPressEventParameters>;
}
