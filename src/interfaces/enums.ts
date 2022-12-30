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

export enum LFlorescenceStatus {
  INFLORESCENCE_APPEARED = 'inflorescence_appeared',
  FLOWERING = 'flowering',
  FINISHED = 'finished',
}