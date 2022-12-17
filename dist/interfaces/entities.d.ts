/**
 * @namespace pollination.ui.interfaces.entities
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
    id: int;
    plant_name: string;
    plant_id: int;
    florescence_status: string;
    available_colors_rgb: string[];
}

export interface PollenDonor {
    plant_id: int;
    plant_name: str;
}

export interface RetrainPollinationModelResults {
    model: string;
    mean_f1_score: float;
}

export interface NewPollenContainerItem {
    plant_id: int;
    plant_name: string;
    genus: string;
    count_stored_pollen_containers: int;
}

export interface Plant {
    plant_id: int;
    plant_name: string;
    genus: string;
}