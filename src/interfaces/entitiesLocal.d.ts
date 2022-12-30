import { BActiveFlorescence, BOngoingPollination } from "./entities";
import { FlorescenceStatus, LFlorescenceStatus } from "./enums";

/**
 * @namespace pollination.ui.interfaces.entitiesLocal
 */
export interface LUnsavedPollination {
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

export interface LIdToFragmentMap {
    [key: string]: string;  // e.g. dialogRenamePlant: "plants.ui.view.fragments.DetailRename"
  }

export interface LNewFlorescenceInputData {
plant_id: int|undefined;
plant_name: string|undefined,
florescence_status: LFlorescenceStatus;
inflorescence_appearance_date: string|undefined,
comment: string|undefined,
}

export interface LEditPollinationInput extends BOngoingPollination{
    // used for model "editPollinationInput"
    pollination_timestamp_known: boolean;
    harvest_date_known: boolean;
}

export interface LEditFlorescenceInput extends BActiveFlorescence{
    // used for model "editedFlorescenceModel"
    flowers_count_known: boolean;
    branches_count_known: boolean;
    inflorescence_appearance_date_known: boolean;
    first_flower_opening_date_known: boolean;
    last_flower_closing_date_known: boolean;
}

