sap.ui.define([], function () {
  /**
   * @namespace pollination.ui.interfaces
   */
  var PollinationStatus;
  (function (PollinationStatus) {
    PollinationStatus["ATTEMPT"] = "attempt";
    PollinationStatus["SEED_CAPSULE"] = "seed_capsule";
    PollinationStatus["SEED"] = "seed";
    PollinationStatus["GERMINATED"] = "germinated";
    PollinationStatus["UNKNOWN"] = "unknown";
  })(PollinationStatus || (PollinationStatus = {}));
  var __exports = {
    __esModule: true
  };
  __exports.PollinationStatus = PollinationStatus;
  return __exports;
});
//# sourceMappingURL=PollinationStatus.js.map