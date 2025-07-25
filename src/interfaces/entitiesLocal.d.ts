import { BActiveFlorescence, PollenQuality, PollinationRead, SeedPlantingRead } from "./entities";
import { FlorescenceStatus, FlorescenceStatus } from "./enums";

/**
 * @namespace pollination.ui.interfaces.entitiesLocal
 */
export interface LUnsavedPollination {
    pollinated_at: string;
    location: string;
    count_attempted: 1;
    florescence_id: int;
    seedCapsulePlantName: string;
    seed_capsule_plant_id: int;
    seed_capsule_plant_preview_image_id?: int;
    // florescenceStatus: string;
    florescence_comment?: string;
    label_color_rgb?: string;
    pollenDonorPlantName: string;
    pollen_donor_plant_id: int;
    pollen_donor_plant_preview_image_id?: int;
    
    pollen_type: string;
    goodPollenQuality: boolean;  // not saved to backend
    // pollen_quality: PollenQuality;  // mapped from goodPollenQuality when saving
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
    inflorescence_appeared_at: string|undefined,
    first_flower_opened_at: string|undefined,
    comment: string|undefined,
}

export interface LEditPollinationInput extends PollinationRead{
    // used for model "editPollinationInput"
    // pollination_timestamp_known: boolean;
    pollinated_at_known: boolean;
    harvest_date_known: boolean;
    count_pollinated_known: boolean;
    count_capsules_known: boolean;
    goodPollenQuality: boolean;  // not saved to backend, but used for UI
}

export interface LEditFlorescenceInput extends BActiveFlorescence{
    // used for model "editedFlorescenceModel"
    flowers_count_known: boolean;
    branches_count_known: boolean;
    inflorescence_appeared_at_known: boolean;
    first_flower_opened_at_known: boolean;
    last_flower_closed_at_known: boolean;

    perianth_size_known: boolean;
    flower_colors_known: boolean;
    stigma_position_known: boolean;
}

export type LColorProperties = "flower_color" | "flower_color_second";

export interface LPreviewImageBasics{
    plant_id?: int,
    plant_name?: string,
    plant_preview_image_id: int,
}

export interface LPreviewImage extends LPreviewImageBasics{
    // plant_id: int,
    // plant_name: string,
    // plant_preview_image_id: int,
    plant_preview_image_url: string
}

export interface StateModelData{
    seed_capsule_selected: boolean,
    pollen_donor_selected: boolean,
    florescence_status: FlorescenceStatus | undefined,
    
    // filter settings dialog
    include_ongoing_pollinations: boolean,
    include_recently_finished_pollinations: boolean,
    include_finished_pollinations: boolean,
    flower_history_include_inactive: boolean,
}

export interface UpdateSeedPlantingInputData extends SeedPlantingRead{
    count_germinated_known: boolean;
}

export type LHoverAction = "on" | "out";
export interface PollinationIndicator$HoverEventParameters {
    action: LHoverAction;
}
export interface PollinationIndicator$PressEventParameters {
    action: LHoverAction;
}
export type PollinationIndicator$HoverEvent = Event<PollinationIndicator$HoverEventParameters, PollinationIndicator>;
export type PollinationIndicator$PressEvent = Event<PollinationIndicator$PressEventParameters, PollinationIndicator>;