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
  plant_self_pollinates?: boolean;
  self_pollinated?: boolean;
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
  count_attempted?: number;
  count_pollinated?: number;
  count_capsules?: number;
  location_text: string;
  florescence_id: number;
  florescence_comment?: string;
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
  // days_until_first_germination?: number;
  // first_seeds_sown?: number;
  // first_seeds_germinated?: number;
  // germination_rate?: number;

  seed_plantings: SeedPlantingRead[];
}
export interface PollinationUpdate {
  seed_capsule_plant_id: number;
  pollen_donor_plant_id: number;
  pollen_type: PollenType;
  self_pollinated?: boolean;
  pollinated_at: string;
  label_color_rgb: string;
  location: Location;
  count_attempted: number;
  count_pollinated?: number;
  count_capsules?: number;
  id: number;
  pollination_status: PollinationStatus;
  ongoing: boolean;
  harvest_date?: string;
  seed_capsule_length?: number;
  seed_capsule_width?: number;
  seed_length?: number;
  seed_width?: number;
  seed_count?: number;
  seed_capsule_description?: string;
  seed_description?: string;
  // days_until_first_germination?: number;
  // first_seeds_sown?: number;
  // first_seeds_germinated?: number;
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
  // germination_rate?: number;
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
  plant_preview_image_id?: number;
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
  pollen_container_collection: PollenContainerRead[];
  plantsWithoutPollenContainerCollection: BPlantWithoutPollenContainer[];
}
export interface PollenContainerRead {
  plant_id: number;
  plant_name: string;
  genus?: string;
  count_stored_pollen_containers: number;
}
export interface PollenContainerCreateUpdate {
  plant_id: number;
  // plant_name: string;
  // genus?: string;
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
export interface FRequestNewFlorescence {
  plant_id: number;
  florescence_status: string;
  inflorescence_appeared_at?: string;
  comment?: string;
}


export interface PollinationCreate {
  florescence_id: number;
  pollen_quality: PollenQuality;
  seed_capsule_plant_id: number;
  pollen_donor_plant_id: number;
  pollen_type: string;
  pollinated_at: string;
  label_color_rgb: string;
  location: string;
  count_attempted: number;
}

export interface FRequestPollenContainers {
  pollen_container_collection: PollenContainerCreateUpdate[];
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

export type SeedPlantingStatus = "planted" | "germinated" | "abandoned";

export interface SeedPlantingBase {
  status: SeedPlantingStatus;
  pollination_id?: int; 
  comment?: string;
  sterilized: boolean;
  soaked: boolean;
  covered: boolean;
  planted_on: Date;
  count_planted: int;
  soil_id: int;
}

export interface SeedPlantingRead extends SeedPlantingBase{
  id: int;
  count_germinated?: int;
  germinated_first_on?: Date;
  seed_capsule_plant_name: string;
  pollen_donor_plant_name: string;
  soil_name: string;

  plants: PlantEssentials[];
}

export interface SeedPlantingCreate extends SeedPlantingBase {
}

export interface LSeedPlantingInputData extends SeedPlantingBase {
  soil_id?: int;
  soil_name?: string;
}

export interface SeedPlantingUpdate extends SeedPlantingBase {
  id: int;
  count_germinated: int | None;
  germinated_first_on: Date | None;
}

export interface ActiveSeedPlantingsResult {
  active_seed_planting_collection: SeedPlantingRead[];
  action: string;
  message: BMessage;
}

export interface SoilBase {
  id: int;
  soil_name: string;
  mix: string;
  description?: string;
}

export interface SoilWithCountRead extends SoilBase{
  plants_count: int;
}

export interface ShortPlant{
  id: int;
  plant_name: string;
  active: boolean;
}

export interface PlantBase{
  plant_name: string;
  field_number: string | None;
  geographic_origin: string | None;
  nursery_source: string | None;
  propagation_type: FBPropagationType | None;
  active: boolean;
  cancellation_reason: FBCancellationReason | None;
  cancellation_date: Date | None;
  generation_notes: string | None;
  taxon_id: int | None;

  parent_plant: ShortPlant | None;
  parent_plant_pollen: ShortPlant | None;
  plant_notes: string | None;
  preview_image_id: int | None;

  tags: FBPlantTag[];

  seed_planting_id: int | None;
}

export interface PlantEssentials{
  id: int;
  plant_name: string;
  full_botanical_html_name: string | None;
}

export interface SeedPlantingPlantNameProposal{
  plant_name_proposal: string;
}
