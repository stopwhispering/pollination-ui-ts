/**
 * @namespace pollination.ui.interfaces
 */

// sync with local.json model and backend!
export enum PollinationStatus {
  ATTEMPT = 'attempt',
  SEED_CAPSULE = 'seed_capsule',
  SEED = 'seed',
  GERMINATED = 'germinated',
  UNKNOWN = 'unknown',
}

export enum FlorescenceStatus {
  INFLORESCENCE_APPEARED = 'inflorescence_appeared',
  FLOWERING = 'flowering',
  FINISHED = 'finished',
  ABORTED = 'aborted',
}

export type BFloweringState = "inflorescence_growing" | "flowering" | "seeds_ripening" | "not_flowering";

export type BMessageType = "Information" | "None" | "Success" | "Warning" | "Error" | "Debug";

export enum PollenQuality {
  GOOD = 'good',
  BAD = 'bad',
  UNKNOWN = 'unknown',
}

// export type PollenQuality = "GOOD" | "BAD" | "UNKNOWN";