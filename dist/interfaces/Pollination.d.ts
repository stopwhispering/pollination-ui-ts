/**
 * @namespace pollination.ui.interfaces.entities
 */
export default interface Pollination {
	pollinationTimestamp: string;
	location: string;
    florescenceId?: int;
    florescencePlantName?: string;
    florescencePlantId?: int;
    florescenceStatus?: string;
    availableColorsRgb?: string[];
    labelColorRgb?: string;  
    pollenDonorPlantName?: string;
    pollenDonorPlantId?: int;
    pollenType?: string;

}