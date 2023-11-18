import { CSSSize } from "sap/ui/core/library";
import { PropertyBindingInfo } from "sap/ui/base/ManagedObject";
import { $ControlSettings } from "sap/ui/core/Control";

declare module "./TrafficLight" {

    /**
     * Interface defining the settings object used in constructor calls
     */
    interface $TrafficLightSettings extends $ControlSettings {
        value?: number | PropertyBindingInfo | `{${string}}`;
        text?: string | PropertyBindingInfo;
        size?: CSSSize | PropertyBindingInfo | `{${string}}`;
        asc?: boolean | PropertyBindingInfo | `{${string}}`;
        rlimit?: number | PropertyBindingInfo | `{${string}}`;
        glimit?: number | PropertyBindingInfo | `{${string}}`;
    }

    export default interface TrafficLight {

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

        // property: text

        /**
         * Gets current value of property "text".
         *
         * Default value is: ""
         * @returns Value of property "text"
         */
        getText(): string;

        /**
         * Sets a new value for property "text".
         *
         * When called with a value of "null" or "undefined", the default value of the property will be restored.
         *
         * Default value is: ""
         * @param [text=""] New value for property "text"
         * @returns Reference to "this" in order to allow method chaining
         */
        setText(text: string): this;

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

        // property: asc

        /**
         * Gets current value of property "asc".
         *
         * Default value is: true
         * @returns Value of property "asc"
         */
        getAsc(): boolean;

        /**
         * Sets a new value for property "asc".
         *
         * When called with a value of "null" or "undefined", the default value of the property will be restored.
         *
         * Default value is: true
         * @param [asc=true] New value for property "asc"
         * @returns Reference to "this" in order to allow method chaining
         */
        setAsc(asc: boolean): this;

        // property: rlimit

        /**
         * Gets current value of property "rlimit".
         *
         * Default value is: "90"
         * @returns Value of property "rlimit"
         */
        getRlimit(): number;

        /**
         * Sets a new value for property "rlimit".
         *
         * When called with a value of "null" or "undefined", the default value of the property will be restored.
         *
         * Default value is: "90"
         * @param [rlimit="90"] New value for property "rlimit"
         * @returns Reference to "this" in order to allow method chaining
         */
        setRlimit(rlimit: number): this;

        // property: glimit

        /**
         * Gets current value of property "glimit".
         *
         * Default value is: "75"
         * @returns Value of property "glimit"
         */
        getGlimit(): number;

        /**
         * Sets a new value for property "glimit".
         *
         * When called with a value of "null" or "undefined", the default value of the property will be restored.
         *
         * Default value is: "75"
         * @param [glimit="75"] New value for property "glimit"
         * @returns Reference to "this" in order to allow method chaining
         */
        setGlimit(glimit: number): this;
    }
}
