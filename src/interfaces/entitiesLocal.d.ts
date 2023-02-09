import { BActiveFlorescence, PollinationRead } from "./entities";
import { FlorescenceStatus, FlorescenceStatus } from "./enums";

/**
 * @namespace pollination.ui.interfaces.entitiesLocal
 */
export interface LUnsavedPollination {
    pollination_timestamp: string;
    location: string;
    count: 1;
    florescenceId?: int;
    florescencePlantName?: string;
    florescencePlantId?: int;
    florescenceStatus?: string;
    availableColorsRgb?: string[];
    label_color_rgb?: string;
    pollenDonorPlantName?: string;
    pollen_donor_plant_id?: int;
    pollen_type?: string;
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
florescence_status: FlorescenceStatus;
inflorescence_appearance_date: string|undefined,
comment: string|undefined,
}

export interface LEditPollinationInput extends PollinationRead{
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

    perianth_size_known: boolean;
    flower_colors_known: boolean;
    stigma_position_known: boolean;
}

export type LColorProperties = "flower_color" | "flower_color_second";