import Event from "sap/ui/base/Event";
import { CSSSize } from "sap/ui/core/library";
import { PropertyBindingInfo } from "sap/ui/base/ManagedObject";
import { $ControlSettings } from "sap/ui/core/Control";

declare module "./PollinationIndicator" {

    /**
     * Interface defining the settings object used in constructor calls
     */
    interface $PollinationIndicatorSettings extends $ControlSettings {
        value?: number | PropertyBindingInfo | `{${string}}`;
        size?: CSSSize | PropertyBindingInfo | `{${string}}`;
        pollinationStatus?: string | PropertyBindingInfo;
        ongoing?: boolean | PropertyBindingInfo | `{${string}}`;
        reverse?: boolean | PropertyBindingInfo | `{${string}}`;
        press?: (event: PollinationIndicator$PressEvent) => void;
        hover?: (event: PollinationIndicator$HoverEvent) => void;
    }

    export default interface PollinationIndicator {

        // property: value

        /**
         * Gets current value of property "value".
         *
         * Default value is: "0"
         * @returns Value of property "value"
         */
        getValue(): number;

        /**
         * Sets a new value for property "value".
         *
         * When called with a value of "null" or "undefined", the default value of the property will be restored.
         *
         * Default value is: "0"
         * @param [value="0"] New value for property "value"
         * @returns Reference to "this" in order to allow method chaining
         */
        setValue(value: number): this;

        // property: size

        /**
         * Gets current value of property "size".
         *
         * Default value is: "50px"
         * @returns Value of property "size"
         */
        getSize(): CSSSize;

        /**
         * Sets a new value for property "size".
         *
         * When called with a value of "null" or "undefined", the default value of the property will be restored.
         *
         * Default value is: "50px"
         * @param [size="50px"] New value for property "size"
         * @returns Reference to "this" in order to allow method chaining
         */
        setSize(size: CSSSize): this;

        // property: pollinationStatus

        /**
         * Gets current value of property "pollinationStatus".
         *
         * @returns Value of property "pollinationStatus"
         */
        getPollinationStatus(): string;

        /**
         * Sets a new value for property "pollinationStatus".
         *
         * When called with a value of "null" or "undefined", the default value of the property will be restored.
         *
         * @param pollinationStatus New value for property "pollinationStatus"
         * @returns Reference to "this" in order to allow method chaining
         */
        setPollinationStatus(pollinationStatus: string): this;

        // property: ongoing

        /**
         * Gets current value of property "ongoing".
         *
         * @returns Value of property "ongoing"
         */
        getOngoing(): boolean;

        /**
         * Sets a new value for property "ongoing".
         *
         * When called with a value of "null" or "undefined", the default value of the property will be restored.
         *
         * @param ongoing New value for property "ongoing"
         * @returns Reference to "this" in order to allow method chaining
         */
        setOngoing(ongoing: boolean): this;

        // property: reverse

        /**
         * Gets current value of property "reverse".
         *
         * @returns Value of property "reverse"
         */
        getReverse(): boolean;

        /**
         * Sets a new value for property "reverse".
         *
         * When called with a value of "null" or "undefined", the default value of the property will be restored.
         *
         * @param reverse New value for property "reverse"
         * @returns Reference to "this" in order to allow method chaining
         */
        setReverse(reverse: boolean): this;

        // event: press

        /**
         * Attaches event handler "fn" to the "press" event of this "PollinationIndicator".
         *
         * When called, the context of the event handler (its "this") will be bound to "oListener" if specified,
         * otherwise it will be bound to this "PollinationIndicator" itself.
         *
         * @param fn The function to be called when the event occurs
         * @param listener Context object to call the event handler with. Defaults to this "PollinationIndicator" itself
         *
         * @returns Reference to "this" in order to allow method chaining
         */
        attachPress(fn: (event: PollinationIndicator$PressEvent) => void, listener?: object): this;

        /**
         * Attaches event handler "fn" to the "press" event of this "PollinationIndicator".
         *
         * When called, the context of the event handler (its "this") will be bound to "oListener" if specified,
         * otherwise it will be bound to this "PollinationIndicator" itself.
         *
         * @param data An application-specific payload object that will be passed to the event handler along with the event object when firing the event
         * @param fn The function to be called when the event occurs
         * @param listener Context object to call the event handler with. Defaults to this "PollinationIndicator" itself
         *
         * @returns Reference to "this" in order to allow method chaining
         */
        attachPress<CustomDataType extends object>(data: CustomDataType, fn: (event: PollinationIndicator$PressEvent, data: CustomDataType) => void, listener?: object): this;

        /**
         * Detaches event handler "fn" from the "press" event of this "PollinationIndicator".
         *
         * The passed function and listener object must match the ones used for event registration.
         *
         * @param fn The function to be called, when the event occurs
         * @param listener Context object on which the given function had to be called
         * @returns Reference to "this" in order to allow method chaining
         */
        detachPress(fn: (event: PollinationIndicator$PressEvent) => void, listener?: object): this;

        /**
         * Fires event "press" to attached listeners.
         *
         * @param parameters Parameters to pass along with the event
         * @returns Reference to "this" in order to allow method chaining
         */
        firePress(parameters?: PollinationIndicator$PressEventParameters): this;

        // event: hover

        /**
         * Attaches event handler "fn" to the "hover" event of this "PollinationIndicator".
         *
         * When called, the context of the event handler (its "this") will be bound to "oListener" if specified,
         * otherwise it will be bound to this "PollinationIndicator" itself.
         *
         * @param fn The function to be called when the event occurs
         * @param listener Context object to call the event handler with. Defaults to this "PollinationIndicator" itself
         *
         * @returns Reference to "this" in order to allow method chaining
         */
        attachHover(fn: (event: PollinationIndicator$HoverEvent) => void, listener?: object): this;

        /**
         * Attaches event handler "fn" to the "hover" event of this "PollinationIndicator".
         *
         * When called, the context of the event handler (its "this") will be bound to "oListener" if specified,
         * otherwise it will be bound to this "PollinationIndicator" itself.
         *
         * @param data An application-specific payload object that will be passed to the event handler along with the event object when firing the event
         * @param fn The function to be called when the event occurs
         * @param listener Context object to call the event handler with. Defaults to this "PollinationIndicator" itself
         *
         * @returns Reference to "this" in order to allow method chaining
         */
        attachHover<CustomDataType extends object>(data: CustomDataType, fn: (event: PollinationIndicator$HoverEvent, data: CustomDataType) => void, listener?: object): this;

        /**
         * Detaches event handler "fn" from the "hover" event of this "PollinationIndicator".
         *
         * The passed function and listener object must match the ones used for event registration.
         *
         * @param fn The function to be called, when the event occurs
         * @param listener Context object on which the given function had to be called
         * @returns Reference to "this" in order to allow method chaining
         */
        detachHover(fn: (event: PollinationIndicator$HoverEvent) => void, listener?: object): this;

        /**
         * Fires event "hover" to attached listeners.
         *
         * @param parameters Parameters to pass along with the event
         * @returns Reference to "this" in order to allow method chaining
         */
        fireHover(parameters?: PollinationIndicator$HoverEventParameters): this;
    }

    /**
     * Interface describing the parameters of PollinationIndicator's 'press' event.
     */
    // eslint-disable-next-line
    export interface PollinationIndicator$PressEventParameters {
    }

    /**
     * Interface describing the parameters of PollinationIndicator's 'hover' event.
     */
    // eslint-disable-next-line
    export interface PollinationIndicator$HoverEventParameters {
    }

    /**
     * Type describing the PollinationIndicator's 'press' event.
     */
    export type PollinationIndicator$PressEvent = Event<PollinationIndicator$PressEventParameters>;

    /**
     * Type describing the PollinationIndicator's 'hover' event.
     */
    export type PollinationIndicator$HoverEvent = Event<PollinationIndicator$HoverEventParameters>;
}
