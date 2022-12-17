sap.ui.define([], function () {
  /**
   * @namespace pollination.ui.interfaces
   */
  var PollinationStatus;
  (function (PollinationStatus) {
    PollinationStatus["ATTEMPT"] = "attempt";
    PollinationStatus["GERMINATED"] = "germinated";
    PollinationStatus["SEED_CAPSULE"] = "seed_capsule";
    PollinationStatus["SEED"] = "seed";
    PollinationStatus["GERMINATED"] = "germinated";
    PollinationStatus["UNKNOWN"] = "unknown";
  })(PollinationStatus || (PollinationStatus = {}));
  var FlorescenceStatus;
  (function (FlorescenceStatus) {
    FlorescenceStatus["INFLORESCENCE_APPEARED"] = "inflorescence_appeared";
    FlorescenceStatus["FLOWERING"] = "flowering";
    FlorescenceStatus["FINISHED"] = "finished";
  })(FlorescenceStatus || (FlorescenceStatus = {}));
  var __exports = {
    __esModule: true
  };
  __exports.PollinationStatus = PollinationStatus;
  __exports.FlorescenceStatus = FlorescenceStatus;
  return __exports;
});
//# sourceMappingURL=Florescence.js.map