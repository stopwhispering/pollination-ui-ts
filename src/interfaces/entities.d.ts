/**
 * @namespace pollination.ui.interfaces.entities
 */

import { FlorescenceStatus, BFloweringState } from "./enums";

// from other modules
export interface BMessage {
    type: BMessageType;
    message: string;
    additionalText?: string;
    description?: string;
  }
// export type FlorescenceStatus = "inflorescence_appeared" | "flowering" | "finished" | "aborted";
// auto-generated via pydantic-2-ts
export interface BActiveFlorescence {
  id: number;
  plant_id: number;
  plant_name: string;
  plant_preview_image_id: number | undefined;
  florescence_status: FlorescenceStatus;
  inflorescence_appeared_at?: string;
  comment?: string;
  branches_count?: number;
  flowers_count?: number;
  perianth_length?: number;
  perianth_diameter?: number;
  flower_color?: string;
  flower_color_second?: string;
  flower_colors_differentiation?: FlowerColorDifferentiation;
  stigma_position?: StigmaPosition;
  first_flower_opened_at?: string;
  last_flower_closed_at?: string;
  available_colors_rgb: string[];
}
export interface PollinationRead {
  seed_capsule_plant_id: number;
  seed_capsule_plant_name: string;
  pollen_donor_plant_id: number;
  pollen_donor_plant_name: string;
  pollinated_at?: string;
  pollen_type: string;
  location?: string;
  count?: number;
  location_text: string;
  label_color_rgb: string;
  id: number;
  pollination_status: string;
  ongoing: boolean;
  harvest_date?: string;
  seed_capsule_length?: number;
  seed_capsule_width?: number;
  seed_length?: number;
  seed_width?: number;
  seed_count?: number;
  seed_capsule_description?: string;
  seed_description?: string;
  days_until_first_germination?: number;
  first_seeds_sown?: number;
  first_seeds_germinated?: number;
  germination_rate?: number;
}
export interface BPlantForNewFlorescence {
  plant_id: number;
  plant_name: string;
  genus?: string;
}
export interface BPlantWithoutPollenContainer {
  plant_id: number;
  plant_name: string;
  genus?: string;
}
export interface BPollinationAttempt {
  reverse: boolean;
  pollination_status: string;
  pollination_at?: string;
  harvest_at?: string;
  germination_rate?: number;
  ongoing: boolean;
}
export interface BPollinationResultingPlant {
  plant_id: number;
  plant_name: string;
  reverse: boolean;
}
export interface BPollinationStatus {
  key: string;
  text: string;
}
export interface BPotentialPollenDonor {
  plant_id: number;
  plant_name: string;
  pollen_type: string;
  count_stored_pollen_containers?: number;
  already_ongoing_attempt: boolean;
  probability_pollination_to_seed?: number;
  pollination_attempts: BPollinationAttempt[];
  resulting_plants: BPollinationResultingPlant[];
}
export interface BResultsActiveFlorescences {
  action: string;
  message?: BMessage;
  active_florescence_collection: BActiveFlorescence[];
}
export interface BResultsOngoingPollinations {
  action: string;
  message?: BMessage;
  ongoing_pollination_collection: PollinationRead[];
}
export interface BResultsPlantsForNewFlorescence {
  plants_for_new_florescence_collection: BPlantForNewFlorescence[];
}
export interface BResultsPollenContainers {
  pollen_container_collection: FBPollenContainer[];
  plantsWithoutPollenContainerCollection: BPlantWithoutPollenContainer[];
}
export interface FBPollenContainer {
  plant_id: number;
  plant_name: string;
  genus?: string;
  count_stored_pollen_containers: number;
}
export interface BResultsPotentialPollenDonors {
  action: string;
  message?: BMessage;
  potential_pollen_donor_collection: BPotentialPollenDonor[];
}
export interface SettingsRead {
  colors: string[];
}


export interface BResultsRetrainingPollinationToSeedsModel {
    model: string;
    mean_f1_score: float;
}

export type FlowerColorDifferentiation = "top_bottom" | "ovary_mouth" | "striped" | "uniform";
export type StigmaPosition = "exserted" | "mouth" | "inserted" | "deeply_inserted";

export interface FRequestEditedFlorescence {
  id: number;
  plant_id: number;
  plant_name: string;
  florescence_status: string;
  inflorescence_appeared_at?: string;
  comment?: string;
  branches_count?: number;
  flowers_count?: number;
  perianth_length?: number;
  perianth_diameter?: number;
  flower_color?: string;
  flower_color_second?: string;
  flower_colors_differentiation?: FlowerColorDifferentiation;
  stigma_position?: StigmaPosition;
  first_flower_opened_at?: string;
  last_flower_closed_at?: string;
}
export interface FRequestEditedPollination {
  id: number;
  seed_capsule_plant_id: number;
  pollen_donor_plant_id: number;
  pollinated_at?: string;
  pollen_type: string;
  location?: string;
  count: number;
  label_color_rgb: string;
  pollination_status: string;
  ongoing: boolean;
  harvest_date?: string;
  seed_capsule_length?: number;
  seed_capsule_width?: number;
  seed_length?: number;
  seed_width?: number;
  seed_count?: number;
  seed_capsule_description?: string;
  seed_description?: string;
  days_until_first_germination?: number;
  first_seeds_sown?: number;
  first_seeds_germinated?: number;
}
export interface FRequestNewFlorescence {
  plant_id: number;
  florescence_status: string;
  inflorescence_appeared_at?: string;
  comment?: string;
}


export interface PollinationCreate {
  florescenceId: number;
  pollen_quality: PollenQuality;
  seed_capsule_plant_id: number;
  pollen_donor_plant_id: number;
  pollen_type: string;
  pollinated_at: string;
  label_color_rgb: string;
  location: string;
  count: number;
}

export interface FRequestPollenContainers {
  pollen_container_collection: FBPollenContainer[];
}




export interface BFloweringPeriodState {
  month: string;
  flowering_state: BFloweringState;
}

export interface BPlantFlowerHistory {
  plant_id: number;
  plant_name: string;
  periods: BFloweringPeriodState[];
}

export interface BResultsFlowerHistory {
  action: string;
  message: BMessage;
  plants: BPlantFlowerHistory[];
  months: string[];
}