import ManagedObject from "sap/ui/base/ManagedObject";

/**
 * @namespace pollination.ui.controller.interfaces.entities
 */
export interface Pollination {
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

export interface Florescence {
    id: int;plant_name
    plant_id: int;
    florescence_status: string;
    available_colors_rgb: string[];
}

export interface PollenDonor {
    plant_id: int;
    plant_name: str;
}

export enum PollinationStatus {
    ATTEMPT = 'attempt',
    GERMINATED = 'germinated',
    SEED_CAPSULE = 'seed_capsule',
    SEED = 'seed',
    GERMINATED = 'germinated',
    UNKNOWN = 'unknown',
  }

export enum FlorescenceStatus{
    INFLORESCENCE_APPEARED = 'inflorescence_appeared',
    FLOWERING = 'flowering',
    FINISHED = 'finished',
}