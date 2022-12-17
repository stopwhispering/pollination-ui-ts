sap.ui.define(["sap/m/MessageBox", "sap/ui/model/json/JSONModel", "sap/ui/Device", "./BaseController", "sap/m/MessageToast", "sap/ui/model/FilterOperator", "sap/ui/model/Filter", "sap/ui/core/Fragment", "sap/m/Dialog", "sap/m/ColorPalettePopover", "../model/formatter", "sap/m/Button", "sap/m/library", "sap/ui/core/library", "sap/m/Text"], function (MessageBox, JSONModel, sap_ui_Device, __BaseController, MessageToast, FilterOperator, Filter, Fragment, Dialog, ColorPalettePopover, __formatter, Button, sap_m_library, sap_ui_core_library, Text) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const browser = sap_ui_Device["browser"];
  const BaseController = _interopRequireDefault(__BaseController);
  const formatter = _interopRequireDefault(__formatter);
  const ButtonType = sap_m_library["ButtonType"];
  const DialogType = sap_m_library["DialogType"];
  const ValueState = sap_ui_core_library["ValueState"];
  /**
   * @namespace pollination.ui.controller
   */
  const App = BaseController.extend("pollination.ui.controller.App", {
    constructor: function constructor() {
      BaseController.prototype.constructor.apply(this, arguments);
      this.formatter = new formatter();
    },
    onInit: function _onInit() {
      this.getView().setModel(new JSONModel({
        // isMobile: Device.browser.mobile,
        isMobile: browser.mobile
      }), "view");
      this._load_initial_data();

      // initialize empty model for new pollination
      this._new_temp_pollination = {
        pollinationTimestamp: this.format_timestamp(new Date()),
        location: 'indoor_led'
      };
      var oModel = new JSONModel(this._new_temp_pollination);
      this.getView().setModel(oModel, "newTempPollinationModel");
      this._reset_temp_pollination_florescence();
      this._reset_temp_pollination_pollen();

      // initialize empty model for added, not yet saved new pollinations
      this._new_pollinations = [];
      var oModel = new JSONModel(this._new_pollinations);
      this.getView().setModel(oModel, "newPollinationsModel");
    },
    _reset_temp_pollination_florescence: function _reset_temp_pollination_florescence() {
      this._new_temp_pollination.florescenceId = undefined;
      this._new_temp_pollination.florescencePlantName = undefined;
      this._new_temp_pollination.florescencePlantId = undefined;
      this._new_temp_pollination.florescenceStatus = undefined;
      this._new_temp_pollination.availableColorsRgb = ['transparent', 'black']; // technically required placeholders
      this._new_temp_pollination.labelColorRgb = "transparent";
      this.getView().getModel('newTempPollinationModel').updateBindings(false);
    },
    _reset_temp_pollination_pollen: function _reset_temp_pollination_pollen() {
      this._new_temp_pollination.pollenDonorPlantName = undefined;
      this._new_temp_pollination.pollenDonorPlantId = undefined;
      this._new_temp_pollination.pollenType = undefined;
      this.getView().getModel('newTempPollinationModel').updateBindings(false);
    },
    _load_initial_data: function _load_initial_data() {
      // load only once
      this._load_settings();

      // triggered at other places, too
      this._load_active_florescences();
      this._load_ongoing_pollinations();
    },
    _load_settings: function _load_settings() {
      $.ajax({
        url: this.getServiceUrl('pollinations/settings'),
        data: {},
        context: this,
        async: true
      }).done(this._onDoneLoadSettings).fail(this.onFail.bind(this, 'Load settings'));
    },
    _onDoneLoadSettings: function _onDoneLoadSettings(result) {
      var oModel = new JSONModel(result);
      this.getView().setModel(oModel, "settingsModel");
    },
    _load_active_florescences: function _load_active_florescences() {
      $.ajax({
        url: this.getServiceUrl('active_florescences'),
        data: {},
        context: this,
        async: true
      }).done(this._onDoneLoadActiveInflorescences).fail(this.onFail.bind(this, 'Load current florescences'));
    },
    _onDoneLoadActiveInflorescences: function _onDoneLoadActiveInflorescences(result) {
      var oModel = new JSONModel(result.activeFlorescenceCollection);
      this.getView().setModel(oModel, "currentFlorescencesModel");
      this._reset_temp_pollination_florescence();
    },
    _load_ongoing_pollinations: function _load_ongoing_pollinations() {
      $.ajax({
        url: this.getServiceUrl('ongoing_pollinations'),
        data: {},
        context: this,
        async: true
      }).done(this._onDoneLoadOngoingPollinations).fail(this.onFail.bind(this, 'Load ongoing pollinations'));
    },
    _onDoneLoadOngoingPollinations: function _onDoneLoadOngoingPollinations(result) {
      var oModelOngoingPollinations = this.getView().getModel("ongoingPollinationsModel");
      if (!oModelOngoingPollinations) {
        var oModelOngoingPollinations = new JSONModel(result.ongoingPollinationCollection);
        this.getView().setModel(oModelOngoingPollinations, "ongoingPollinationsModel");
      } else {
        oModelOngoingPollinations.setData(result.ongoingPollinationCollection);
      }
    },
    onSelectionChangedCurrentFlorescence: function _onSelectionChangedCurrentFlorescence(oEvent) {
      var florescence = oEvent.getParameter('listItem').getBindingContext('currentFlorescencesModel').getObject();
      // var plant_id = florescence.id;
      $.ajax({
        url: this.getServiceUrl('potential_pollen_donors/' + florescence.id),
        data: {},
        context: this,
        async: true
      }).done(this._onDoneLoadPotentialPollenDonors).fail(this.onFail.bind(this, 'Load potential pollen donors'));

      // set selected florescence plant in new pollination temp model 
      this._new_temp_pollination.florescencePlantName = florescence.plant_name;
      this._new_temp_pollination.florescencePlantId = florescence.plant_id;
      this._new_temp_pollination.florescenceId = florescence.id;
      this._new_temp_pollination.florescenceStatus = florescence.florescence_status; // for enabling/disabling preview button

      // update the available colors for the florescence
      this._new_temp_pollination.availableColorsRgb = this._getAvailableColors(florescence);
      this.getView().getModel("newTempPollinationModel").updateBindings(false);
    },
    _getAvailableColors: function _getAvailableColors(florescence) {
      // determine available colors based on the colors we received from backend for the currently selected
      // florescence and the colors we already used for unsaved pollinations 

      // clone available colors from those we received from backend so we don't modify the original below
      var availabeColorsRgb = JSON.parse(JSON.stringify(florescence.available_colors_rgb));

      // remove colors from unsaved pollinations
      for (var i = 0; i < this._new_pollinations.length; i++) {
        var pollination = this._new_pollinations[i];
        if (this._new_temp_pollination.florescenceId === pollination.florescenceId) {
          var iIndex = availabeColorsRgb.indexOf(pollination.labelColorRgb);
          if (iIndex >= 0) {
            availabeColorsRgb.splice(iIndex, 1);
          }
        }
      }
      return availabeColorsRgb;
    },
    onSelectionChangedPollenDonor: function _onSelectionChangedPollenDonor(oEvent) {
      var pollenDonor = oEvent.getParameter('listItem').getBindingContext('potentialPollenDonorsModel').getObject();
      this._new_temp_pollination.pollenDonorPlantName = pollenDonor.plant_name;
      this._new_temp_pollination.pollenDonorPlantId = pollenDonor.plant_id;
      this._new_temp_pollination.pollenType = pollenDonor.pollen_type;
      var oNewTempPollinationModel = this.getView().getModel("newTempPollinationModel");
      oNewTempPollinationModel.updateBindings(false);
    },
    _onDoneLoadPotentialPollenDonors: function _onDoneLoadPotentialPollenDonors(result) {
      var oModel = new JSONModel(result.potentialPollenDonorCollection);
      this.getView().setModel(oModel, "potentialPollenDonorsModel");
      this._reset_temp_pollination_pollen();
    },
    getPollenTypeGroup: function _getPollenTypeGroup(oContext) {
      //grouper for Pollen Type
      const text = oContext.getProperty('pollen_type') + ' Pollen';
      return text.toUpperCase().replace('_', ' ');
    },
    getFlorescenceStatusGroup: function _getFlorescenceStatusGroup(oContext) {
      return oContext.getProperty('florescence_status').toUpperCase().replace('_', ' ');
    },
    getPollinationStatusGroup: function _getPollinationStatusGroup(oContext) {
      // we can't change order here, only format the group text
      return oContext.getProperty('pollination_status').toUpperCase().replace('_', ' ');
    },
    getPollinationStatusComparator: function _getPollinationStatusComparator(a, b) {
      //receives the results of getPollinationStatusGroup for two items as inputs
      //return numbered output for custom sorting
      //cf sap.ui.model.Sorter.defaultComparator
      const orderMapping = {
        'ATTEMPT': 1,
        'SEED_CAPSULE': 2,
        'GERMINATED': 3
      };
      const scoreA = orderMapping[a];
      const scoreB = orderMapping[b];
      if (scoreA < scoreB) {
        return -1;
      } else {
        return 1;
      }
    },
    getGenusGroup: function _getGenusGroup(oContext) {
      return oContext.getProperty('genus');
    },
    onColorSelect: function _onColorSelect(oEvent) {
      this._new_temp_pollination.labelColorRgb = oEvent.getParameter('value');
      var oNewTempPollinationModel = this.getView().getModel("newTempPollinationModel");
      oNewTempPollinationModel.updateBindings(false);
    },
    onPressAddButton: function _onPressAddButton(oEvent) {
      var selectedFlorescenceItem = this.getView().byId('activeFlorescencesList').getSelectedItem();
      if (selectedFlorescenceItem === null || selectedFlorescenceItem === undefined) {
        MessageToast.show('Please select a florescence.');
        return;
      }
      var selectedFlorescence = selectedFlorescenceItem.getBindingContext('currentFlorescencesModel').getObject();
      var selectedPollenDonorItem = this.getView().byId('potentialPollenDonorsList').getSelectedItem();
      var selectedPollenDonor = selectedPollenDonorItem.getBindingContext('potentialPollenDonorsModel').getObject();

      // var oNewTempPollinationModel = this.getView().getModel("newTempPollinationModel");
      // var oNewTempPollination = oNewTempPollinationModel.getData();
      if (this._new_temp_pollination.florescencePlantName !== selectedFlorescence.plant_name || this._new_temp_pollination.pollenDonorPlantName !== selectedPollenDonor.plant_name) {
        MessageToast.show('Bad Plant Names.');
        return;
      }
      switch (this._new_temp_pollination.location) {
        case 'indoor_led':
          var locationText = 'indoor LED';
          break;
        case 'indoor':
          var locationText = 'indoor';
          break;
        case 'outdoor':
          var locationText = 'outdoor';
          break;
        default:
          MessageToast.show('Bad Location.');
          return;
      }
      if (!this._new_temp_pollination.labelColorRgb || this._new_temp_pollination.labelColorRgb === '' || this._new_temp_pollination.labelColorRgb === 'transparent') {
        MessageToast.show('Choose Color first.');
        return;
      }

      // add new pollination to the newPollinationsModel
      var oNewPollination = {
        florescenceId: this._new_temp_pollination.florescenceId,
        seedCapsulePlantName: selectedFlorescence.plant_name,
        seedCapsulePlantId: selectedFlorescence.plant_id,
        pollenDonorPlantName: selectedPollenDonor.plant_name,
        pollenDonorPlantId: selectedPollenDonor.plant_id,
        pollenType: this._new_temp_pollination.pollenType,
        pollinationTimestamp: this._new_temp_pollination.pollinationTimestamp,
        // '%Y-%m-%d %H:%M' without seconds
        location: this._new_temp_pollination.location,
        locationText: locationText,
        labelColorRgb: this._new_temp_pollination.labelColorRgb
      };
      this._new_pollinations.push(oNewPollination);
      this.getView().getModel("newPollinationsModel").updateBindings(false);

      // remove label color from available colors for this florescence
      this._new_temp_pollination.labelColorRgb = 'transparent';
      this._new_temp_pollination.availableColorsRgb = this._getAvailableColors(selectedFlorescence);
      this.getView().getModel("newTempPollinationModel").updateBindings(false);
    },
    _deleteNewPollination: function _deleteNewPollination(oNewPollination) {
      var index = this._new_pollinations.indexOf(oNewPollination);
      this._new_pollinations.splice(index, 1);
      this.getView().getModel("newPollinationsModel").updateBindings(false);
    },
    onPressDeleteNewPollinationButton: function _onPressDeleteNewPollinationButton(oEvent) {
      var oNewPollination = oEvent.getSource().getBindingContext("newPollinationsModel").getObject(); // todo type
      this._deleteNewPollination(oNewPollination);
    },
    onPressSaveNewPollinationButton: function _onPressSaveNewPollinationButton(oEvent) {
      var oNewPollination = oEvent.getSource().getBindingContext("newPollinationsModel").getObject(); // todo type
      var oNewPollinationsJson = JSON.stringify(oNewPollination);
      $.ajax({
        url: this.getServiceUrl('pollinations'),
        data: oNewPollinationsJson,
        context: this,
        async: true,
        type: 'POST',
        contentType: 'application/json'
      }).done(this._onDonePostNewPollination.bind(this, oNewPollination)).fail(this.onFail.bind(this, 'Save new pollinations'));
    },
    _onDonePostNewPollination: function _onDonePostNewPollination(oNewPollination) {
      // having posted a new pollination, re-read the ongoing pollinations list
      this._load_ongoing_pollinations();

      // also re-read the active florescences list
      this._load_active_florescences();

      // remove saved new pollination from new pollinations model 
      this.getView().getModel("newPollinationsModel");
      this._deleteNewPollination(oNewPollination);
    },
    onLiveChangeOngoingPollinationsFilter: function _onLiveChangeOngoingPollinationsFilter(oEvent) {
      // add filter to ongoing pollinations gridlist
      var aFilters = [];
      var sQuery = oEvent.getSource().getValue();
      if (sQuery && sQuery.length > 0) {
        // var filter = new Filter("seed_capsule_plant_name", FilterOperator.Contains, sQuery);
        // filter on multiple fields, connected with OR
        var filter = new Filter([new Filter("seed_capsule_plant_name", FilterOperator.Contains, sQuery), new Filter("pollen_donor_plant_name", FilterOperator.Contains, sQuery), new Filter("seed_capsule_plant_id", FilterOperator.EQ, sQuery), new Filter("pollen_donor_plant_id", FilterOperator.EQ, sQuery), new Filter("pollination_timestamp", FilterOperator.Contains, sQuery), new Filter("pollen_type", FilterOperator.Contains, sQuery)], false);
        aFilters.push(filter);
      }

      // update list binding
      var oList = this.byId("ongoingPollinationsList");
      var oBinding = oList.getBinding("items");
      oBinding.filter(aFilters, "Application");
    },
    onPressEditActiveFlorescence: function _onPressEditActiveFlorescence(oEvent) {
      // clone active florescence object for manipulation in the dialog
      var oCurrentFlorescence = oEvent.getSource().getBindingContext("currentFlorescencesModel").getObject();
      var oEditedFlorescence = JSON.parse(JSON.stringify(oCurrentFlorescence));

      // add some control attributes to allow for usage of sliders and keeping undefined values
      oEditedFlorescence.flowers_count_known = !!oEditedFlorescence.flowers_count;
      oEditedFlorescence.branches_count_known = !!oEditedFlorescence.branches_count;
      oEditedFlorescence.inflorescence_appearance_date_known = !!oEditedFlorescence.inflorescence_appearance_date;
      oEditedFlorescence.first_flower_opening_date_known = !!oEditedFlorescence.first_flower_opening_date;
      oEditedFlorescence.last_flower_closing_date_known = !!oEditedFlorescence.last_flower_closing_date;

      // // open dialog and bind model
      // this.applyToFragment('editFlorescence',(o)=>{asdf
      // 	var oEditedFlorescenceModel = new sap.ui.model.json.JSONModel(oEditedFlorescence);
      // 	this.getView().setModel(oEditedFlorescenceModel, "editedFlorescenceModel");
      // 	o.open();
      // }, undefined);

      // open dialog
      var oView = this.getView();
      var fn = oDialog => {
        oView.addDependent(oDialog); // required to bind fragment to view
        var oEditedFlorescenceModel = new JSONModel(oEditedFlorescence);
        oView.setModel(oEditedFlorescenceModel, "editedFlorescenceModel");
        oDialog.open();
      };
      if (!this.byId('editedFlorescenceModel')) {
        Fragment.load({
          name: "pollination.ui.view.fragments.EditFlorescence",
          id: oView.getId(),
          controller: this
        }).then(fn);
      } else {
        fn(this.byId('editedFlorescenceModel'));
      }
    },
    onAfterCloseEditFlorescenceDialog: function _onAfterCloseEditFlorescenceDialog(oEvent) {
      // destroy model and fragment, works for both regular closing and hitting ESC
      var oDialog = oEvent.getSource();
      oDialog.destroy();
      this.getView().getModel("editedFlorescenceModel").destroy();
    },
    onPressEditFlorescenceSetToday: function _onPressEditFlorescenceSetToday(dateField) {
      var oEditedFlorescenceModel = this.getView().getModel("editedFlorescenceModel");
      var oEditedFlorescence = oEditedFlorescenceModel.getData();
      oEditedFlorescence[dateField] = new Date().toISOString().substring(0, 10); // e.g. '2022-11-17';
      oEditedFlorescenceModel.updateBindings(false);
    },
    onPressSubmitEditFlorescence: function _onPressSubmitEditFlorescence(oEvent) {
      var oEditedFlorescenceModel = this.getView().getModel("editedFlorescenceModel");
      var oEditedFlorescence = oEditedFlorescenceModel.getData();

      // the inputs are bound to the model and might update undefined values to default values
      // we need to set them back to undefined
      if (!oEditedFlorescence.branches_count_known) {
        oEditedFlorescence.branches_count = undefined;
      }
      if (!oEditedFlorescence.flowers_count_known) {
        oEditedFlorescence.flowers_count = undefined;
      }
      if (!oEditedFlorescence.inflorescence_appearance_date_known) {
        oEditedFlorescence.inflorescence_appearance_date = undefined;
      }
      if (!oEditedFlorescence.first_flower_opening_date_known) {
        oEditedFlorescence.first_flower_opening_date = undefined;
      }
      if (!oEditedFlorescence.last_flower_closing_date_known) {
        oEditedFlorescence.last_flower_closing_date = undefined;
      }

      // depending on florescence status, we might set some dates to undefined
      // todo better validate and cancel with message
      if (oEditedFlorescence.florescence_status === "inflorescence_appeared") {
        oEditedFlorescence.first_flower_opening_date = undefined;
        oEditedFlorescence.last_flower_closing_date = undefined;
      } else if (oEditedFlorescence.florescence_status === "flowering") {
        oEditedFlorescence.last_flower_closing_date = undefined;
      } else if (oEditedFlorescence.florescence_status === "finished") {
        // nothing to do
      } else {
        throw new Error("Unknown florescence status: " + oEditedFlorescence.florescence_status);
      }
      var oEditedFlorescenceJson = JSON.stringify(oEditedFlorescence);
      $.ajax({
        url: this.getServiceUrl('active_florescences/' + oEditedFlorescence.id),
        data: oEditedFlorescenceJson,
        context: this,
        async: true,
        type: 'PUT',
        contentType: 'application/json'
      }).done(this._onDonePutFlorescence).fail(this.onFail.bind(this, 'Update florescence'));
    },
    _onDonePutFlorescence: function _onDonePutFlorescence() {
      this.applyToFragment('editFlorescence', o => {
        o.close();
      });
      this._load_active_florescences();
    },
    onPressDeleteFlorescence: function _onPressDeleteFlorescence(oEvent) {
      var florescence_id = this.getView().getModel("editedFlorescenceModel").getData().id;
      MessageBox.confirm("Really delete Florescence? This cannot be undone.", {
        onClose: this._onConfirmDeleteFlorescence.bind(this, florescence_id)
      });
    },
    _onConfirmDeleteFlorescence: function _onConfirmDeleteFlorescence(florescence_id, sAction) {
      if (sAction === "OK") {
        this._deleteFlorescence(florescence_id);
      } else {
        // do nothing
      }
    },
    _deleteFlorescence: function _deleteFlorescence(florescence_id) {
      $.ajax({
        url: this.getServiceUrl('florescences/' + florescence_id),
        context: this,
        async: true,
        type: 'DELETE',
        contentType: 'application/json'
      }).done(this._onDoneDeleteFlorescence).fail(this.onFail.bind(this, 'Delete florescences'));
    },
    _onDoneDeleteFlorescence: function _onDoneDeleteFlorescence() {
      this.applyToFragment('editFlorescence', o => {
        o.close();
      });
      this._load_active_florescences();
    },
    onPressEditOngoingPollination: function _onPressEditOngoingPollination(oEvent) {
      // clone ongoing pollination object for manipulation in the dialog
      var oOngoingPollination = oEvent.getSource().getBindingContext("ongoingPollinationsModel").getObject();
      var oEditedPollination = JSON.parse(JSON.stringify(oOngoingPollination));

      // add some control attributes to allow for usage of sliders and keeping undefined values
      oEditedPollination.pollination_timestamp_known = !!oEditedPollination.pollination_timestamp;
      oEditedPollination.harvest_date_known = !!oEditedPollination.harvest_date;

      // // open dialog and bind model
      // this.applyToFragment('editPollination',(o)=>{
      // 	var oEditedPollinationModel = new sap.ui.model.json.JSONModel(oEditedPollination);
      // 	this.getView().setModel(oEditedPollinationModel, "editedPollinationModel");
      // 	o.open();
      // });

      var oView = this.getView();
      var fn = o => {
        oView.addDependent(o); // required to bind fragment to view
        var oEditedPollinationModel = new JSONModel(oEditedPollination);
        oView.setModel(oEditedPollinationModel, "editedPollinationModel");
        o.open();
      };

      // open dialog
      if (!this.byId('editPollination')) {
        Fragment.load({
          name: "pollination.ui.view.fragments.EditPollination",
          id: this.getView().getId(),
          controller: this
        }).then(fn);
      } else {
        fn(this.byId('editPollination'));
      }
    },
    onAfterCloseEditPollinationDialog: function _onAfterCloseEditPollinationDialog(oEvent) {
      // destroy model and fragment, works for both regular closing and hitting ESC
      var oDialog = oEvent.getSource();
      oDialog.destroy();
      this.getView().getModel("editedPollinationModel").destroy();
    },
    onOpenColorPalettePopover: function _onOpenColorPalettePopover(oEvent) {
      const oButton = oEvent.getSource();
      // read colors from settings model
      var oSettingsModel = this.getView().getModel("settingsModel");
      var aColors = oSettingsModel.getProperty("/colors");

      // open popover and set colors
      if (!this._oColorPalettePopoverMinDefautButton) {
        this._oColorPalettePopoverMinDefautButton = new ColorPalettePopover("oColorPalettePopoverMinDef", {
          showMoreColorsButton: false,
          colors: aColors,
          colorSelect: this._onSelectColorInColorPalettePopover.bind(this)
        });
      }
      // @ts-ignore  typescript data definitions for sap.m.ColorPalette are missing .openBy()
      this._oColorPalettePopoverMinDefautButton.openBy(oButton);
    },
    _onSelectColorInColorPalettePopover: function _onSelectColorInColorPalettePopover(oEvent) {
      // update color in model
      var oEditedPollinationModel = this.getView().getModel("editedPollinationModel");
      oEditedPollinationModel.setProperty("/label_color_rgb", oEvent.getParameter("value"));
      oEditedPollinationModel.updateBindings(false);
    },
    onChangeInputCalcGerminationRate: function _onChangeInputCalcGerminationRate(oEvent) {
      // upon changing # seeds sown or # seeds germinated, re-calculates germination rate

      // apply our default validator for int input
      this.onChangeInputPreventNonInt(oEvent);

      // get values and calculate germination rate
      var oEditedPollinationModel = this.getView().getModel("editedPollinationModel");
      var iSeedsSown = oEditedPollinationModel.getProperty("/first_seeds_sown");
      var iSeedsGerminated = oEditedPollinationModel.getProperty("/first_seeds_germinated");
      if (iSeedsSown && iSeedsGerminated) {
        var fGerminationRate = iSeedsGerminated / iSeedsSown * 100;
        var iGerminationRate = Math.round(fGerminationRate);
        oEditedPollinationModel.setProperty("/germination_rate", iGerminationRate);
      }
      oEditedPollinationModel.updateBindings(false);
    },
    onPressSubmitEditPollinationAndFinish: function _onPressSubmitEditPollinationAndFinish(oEvent) {
      MessageBox.confirm("Finish Pollination? This will remove it from the list and cannot be undone.", {
        onClose: this._onConfirmSubmitEditPollinationAndFinish.bind(this)
      });
    },
    _onConfirmSubmitEditPollinationAndFinish: function _onConfirmSubmitEditPollinationAndFinish(sAction) {
      if (sAction === "OK") {
        this.onPressSubmitEditPollination(true);
      } else {
        // do nothing
      }
    },
    onPressSubmitEditPollination: function _onPressSubmitEditPollination(setFinished) {
      var oEditedPollinationModel = this.getView().getModel("editedPollinationModel");
      var oEditedPollination = oEditedPollinationModel.getData();

      // the inputs are bound to the model and might update undefined values to default values
      // we need to set them back to undefined
      if (!oEditedPollination.pollination_timestamp_known) {
        oEditedPollination.pollination_timestamp = undefined;
      }
      if (!oEditedPollination.harvest_date_known) {
        oEditedPollination.harvest_date = undefined;
      }

      // set finished if confirmed
      if (setFinished === true) {
        oEditedPollination.ongoing = false;
      }

      // todo validate status with certain inputs and cancel with message

      var oEditedPollinationJson = JSON.stringify(oEditedPollination);
      $.ajax({
        url: this.getServiceUrl('pollinations/' + oEditedPollination.id),
        data: oEditedPollinationJson,
        context: this,
        async: true,
        type: 'PUT',
        contentType: 'application/json'
      }).done(this._onDonePutPollination).fail(this.onFail.bind(this, 'Update pollination'));
    },
    _onDonePutPollination: function _onDonePutPollination() {
      this.applyToFragment('editPollination', o => {
        o.close();
      });
      this._load_active_florescences();
      this._load_ongoing_pollinations();
    },
    onPressDeletePollination: function _onPressDeletePollination(oEvent) {
      var pollination_id = this.getView().getModel("editedPollinationModel").getData().id;
      MessageBox.confirm("Really delete Pollination? This cannot be undone.", {
        onClose: this._onConfirmDeletePollination.bind(this, pollination_id)
      });
    },
    _onConfirmDeletePollination: function _onConfirmDeletePollination(pollination_id, sAction) {
      if (sAction === "OK") {
        this._deletePollination(pollination_id);
      } else {
        // do nothing
      }
    },
    _deletePollination: function _deletePollination(pollination_id) {
      $.ajax({
        url: this.getServiceUrl('pollinations/' + pollination_id),
        context: this,
        async: true,
        type: 'DELETE',
        contentType: 'application/json'
      }).done(this._onDoneDeletePollination).fail(this.onFail.bind(this, 'Delete pollination'));
    },
    _onDoneDeletePollination: function _onDoneDeletePollination() {
      this.applyToFragment('editPollination', o => {
        o.close();
      });
      this._load_active_florescences();
      this._load_ongoing_pollinations();
    },
    onPressOpenPollenContainersMaintenance: function _onPressOpenPollenContainersMaintenance(oEvent) {
      // query pollen containers from backend and open dialog for maintenance
      $.ajax({
        url: this.getServiceUrl('pollen_containers'),
        context: this,
        async: true,
        contentType: 'application/json'
      }).done(this._onDoneGetPollenContainers).fail(this.onFail.bind(this, 'Get pollen containers'));

      // // open dialog
      // this.applyToFragment('maintainPollenContainers',(o)=>{
      // 	o.open();			
      // } undefined)

      // open dialog
      var oView = this.getView();
      if (!this.byId('maintainPollenContainers')) {
        Fragment.load({
          name: "pollination.ui.view.fragments.MaintainPollenContainers",
          id: oView.getId(),
          controller: this
        }).then(oDialog => {
          oView.addDependent(oDialog);
          oDialog.open();
        });
      } else {
        this.byId('maintainPollenContainers').open();
      }
    },
    _onDoneGetPollenContainers: function _onDoneGetPollenContainers(result) {
      var oModel = new JSONModel(result);
      oModel.setSizeLimit(2000);
      this.getView().setModel(oModel, "pollenContainersModel");
    },
    onAfterClosemaintainPollenContainers: function _onAfterClosemaintainPollenContainers(oEvent) {
      var oDialog = oEvent.getSource();
      oDialog.destroy();
      this.getView().getModel("pollenContainersModel").destroy();
    },
    onPressSubmitPollenContainers: function _onPressSubmitPollenContainers(oEvent) {
      var oPollenContainersModel = this.getView().getModel("pollenContainersModel");
      var oPollenContainersFull = oPollenContainersModel.getData();

      //we only send the pollen containers, not the list of plants that have none
      var oPollenContainers = {
        "pollenContainerCollection": oPollenContainersFull.pollenContainerCollection
      };
      var oPollenContainersJson = JSON.stringify(oPollenContainers);
      $.ajax({
        url: this.getServiceUrl('pollen_containers'),
        data: oPollenContainersJson,
        context: this,
        async: true,
        type: 'POST',
        contentType: 'application/json'
      }).done(this._onDonePutPollenContainers).fail(this.onFail.bind(this, 'Maintained Pollen Containers'));
    },
    _onDonePutPollenContainers: function _onDonePutPollenContainers() {
      this.applyToFragment('maintainPollenContainers', o => {
        o.close();
      }, undefined);
      this._load_active_florescences();
    },
    onPressAddPlantForPollenContainer: function _onPressAddPlantForPollenContainer(oEvent) {
      var iCount = this.byId('newPlantPollenContainerCount').getValue();
      if (iCount <= 0) {
        MessageToast.show("Please enter a positive number");
        return;
      }
      var oPollenContainer = this.byId('newPlantPollenContainer');
      if (!oPollenContainer.getSelectedItem()) {
        MessageToast.show("Please select a plant");
        return;
      }
      var oPlant = oPollenContainer.getSelectedItem().getBindingContext('pollenContainersModel').getObject();
      var oNewPollenContainerItem = {
        plant_id: oPlant.plant_id,
        plant_name: oPlant.plant_name,
        genus: oPlant.genus,
        count_stored_pollen_containers: iCount
      };

      // insert into pollen containers list
      var oPollenContainersModel = this.getView().getModel("pollenContainersModel");
      var aPollenContainers = oPollenContainersModel.getData().pollenContainerCollection;
      aPollenContainers.push(oNewPollenContainerItem);

      // remove from plants list without pollen containers
      var aPlantsWithoutPollenContainers = oPollenContainersModel.getData().plantsWithoutPollenContainerCollection;
      var iIndex = aPlantsWithoutPollenContainers.indexOf(oPlant);
      aPlantsWithoutPollenContainers.splice(iIndex, 1);
      oPollenContainersModel.updateBindings(false);
      oPollenContainer.clearSelection();
    },
    onPressAddActiveFlorescence: function _onPressAddActiveFlorescence(oEvent) {
      // query plants to fill combobox for new florescence
      $.ajax({
        url: this.getServiceUrl('plants_for_new_florescence'),
        context: this,
        async: true,
        contentType: 'application/json'
      }).done(this._onDoneGetPlantsForNewFlorescence).fail(this.onFail.bind(this, 'Get plants for new florescence'));

      // create model for new florescence
      var oNewFlorescence = {
        plant_id: undefined,
        plant_name: undefined,
        florescence_status: 'inflorescence_appeared',
        inflorescence_appearance_date: undefined,
        comment: undefined
      };
      // var oNewFlorescenceModel = new sap.ui.model.json.JSONModel(oNewFlorescence);
      var oNewFlorescenceModel = new JSONModel(oNewFlorescence);
      this.getView().setModel(oNewFlorescenceModel, "newFlorescenceModel");

      // open dialog
      var oView = this.getView();
      if (!this.byId('addActiveFlorescence')) {
        Fragment.load({
          name: "pollination.ui.view.fragments.AddActiveFlorescence",
          id: oView.getId(),
          controller: this
        }).then(oDialog => {
          oView.addDependent(oDialog);
          oDialog.open();
        });
      } else {
        this.byId('addActiveFlorescence').open();
      }
    },
    _onDoneGetPlantsForNewFlorescence: function _onDoneGetPlantsForNewFlorescence(result) {
      var oModel = new JSONModel(result.plantsForNewFlorescenceCollection);
      oModel.setSizeLimit(2000);
      this.getView().setModel(oModel, "plantsForNewFlorescenceModel");
    },
    onPressSubmitNewFlorescence: function _onPressSubmitNewFlorescence() {
      var oNewFlorescenceModel = this.getView().getModel("newFlorescenceModel");
      var oNewFlorescence = oNewFlorescenceModel.getData();
      var oNewFlorescenceJson = JSON.stringify(oNewFlorescence);
      $.ajax({
        url: this.getServiceUrl('active_florescences'),
        data: oNewFlorescenceJson,
        context: this,
        async: true,
        type: 'POST',
        contentType: 'application/json'
      }).done(this._onDonePostNewFlorescence).fail(this.onFail.bind(this, 'Create new florescence'));
    },
    _onDonePostNewFlorescence: function _onDonePostNewFlorescence() {
      this.applyToFragment('addActiveFlorescence', o => {
        o.close();
      }, undefined);
      this._load_active_florescences();
    },
    onAfterCloseAddActiveFlorescence: function _onAfterCloseAddActiveFlorescence(oEvent) {
      var oDialog = oEvent.getSource();
      oDialog.destroy();
      this.getView().getModel("plantsForNewFlorescenceModel").destroy();
      this.getView().getModel("newFlorescenceModel").destroy();
    },
    onPressRetrainProbabilityModelPollinationToSeed: function _onPressRetrainProbabilityModelPollinationToSeed(oEvent) {
      $.ajax({
        url: this.getServiceUrl('retrain_probability_pollination_to_seed_model'),
        context: this,
        async: true,
        type: 'POST',
        contentType: 'application/json'
      }).done(this._onDoneRetrainPollinationModel).fail(this.onFail.bind(this, 'Retrain Pollination Model'));
    },
    _onDoneRetrainPollinationModel: function _onDoneRetrainPollinationModel(result) {
      var oSuccessMessageDialog = this._oSuccessMessageDialog;
      if (!this._oSuccessMessageDialog) {
        this._oSuccessMessageDialog = new Dialog({
          type: DialogType.Message,
          title: "Success",
          state: ValueState.Success,
          content: new Text({
            text: "Trained Model: " + result.model + "\n" + "Mean F1 Score: " + result.mean_f1_score
          }),
          beginButton: new Button({
            type: ButtonType.Emphasized,
            text: "OK",
            press() {
              oSuccessMessageDialog.close();
            } //.bind(this)
          })
        });
      }

      this._oSuccessMessageDialog.open();
    }
  });
  return App;
});
//# sourceMappingURL=App.controller.js.map