sap.ui.define(["sap/ui/core/Fragment", "sap/ui/core/mvc/Controller", "sap/m/MessageToast", "../Constants"], function (Fragment, Controller, MessageToast, __Constants) {
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const Constants = _interopRequireDefault(__Constants);
  /**
   * @namespace pollination.ui.controller
   */
  const BaseController = Controller.extend("pollination.ui.controller.BaseController", {
    getServiceUrl: function _getServiceUrl(sUrl) {
      return Constants.base_url + sUrl;
    },
    applyToFragment: function _applyToFragment(sId, fn, fnInit) {
      //create fragment singleton and apply supplied function to it (e.g. open, close)
      // if stuff needs to be done only once, supply fnInit where first usage happens

      //example usages:
      // this.applyToFragment('dialogAddTag', _onOpenAddTagDialog.bind(this));
      // this.applyToFragment('dialogFindSpecies', (o)=>o.close());
      // this.applyToFragment('dialogFindSpecies', (o)=>{doA; doB; doC;}, fnMyInit);

      //fragment id to fragment file path
      var sIdToFragment = {
        editFlorescence: 'pollination.ui.view.fragments.EditFlorescence',
        editPollination: 'pollination.ui.view.fragments.EditPollination',
        maintainPollenContainers: 'pollination.ui.view.fragments.MaintainPollenContainers',
        addActiveFlorescence: 'pollination.ui.view.fragments.AddActiveFlorescence'
      };
      var oView = this.getView();
      if (oView.byId(sId)) {
        fn(oView.byId(sId));
      } else {
        Fragment.load({
          name: sIdToFragment[sId],
          id: oView.getId(),
          controller: this
        }).then(function (oFragment) {
          oView.addDependent(oFragment);
          if (fnInit) {
            fnInit(oFragment);
          }
          fn(oFragment);
        });
      }
    },
    onCancelDialog: function _onCancelDialog(dialogId) {
      // generic handler for fragments to be closed
      this.applyToFragment(dialogId, o => o.close());
    },
    onChangeInputPreventNonFloat: function _onChangeInputPreventNonFloat(oEvent) {
      // prevent non-float (i.e. non-numerical) input
      var newValue = oEvent.getParameter('newValue');
      if (isNaN(Number(newValue))) {
        var sPath = oEvent.getSource().getBindingPath('value'); // e.g. '/seed_capsule_length'
        var oModel = oEvent.getSource().getBindingInfo('value').binding.getModel();
        oModel.setProperty(sPath, undefined);
        oModel.updateBindings();
      }
    },
    onChangeInputPreventNonInt: function _onChangeInputPreventNonInt(oEvent) {
      // prevent non-integer (i.e. non-numerical or decimal) input
      var newValue = oEvent.getParameter('newValue');
      if (isNaN(Number(newValue)) || !Number.isInteger(Number(newValue))) {
        var sPath = oEvent.getSource().getBindingPath('value'); // e.g. '/seed_capsule_length'
        var oModel = oEvent.getSource().getBindingInfo('value').binding.getModel();
        oModel.setProperty(sPath, undefined);
        oModel.updateBindings();
      }
    },
    onSetToday: function _onSetToday(sModel, sDateField) {
      // set today's date in a date field of a model; must be a simple object model, no collection
      var oModel = this.getView().getModel(sModel);
      var oData = oModel.getData();
      oData[sDateField] = new Date().toISOString().substring(0, 10); // e.g. '2022-11-17';
      oModel.updateBindings();
    },
    format_timestamp: function _format_timestamp(d) {
      // convert date object to 'yyyy-MM-dd HH:mm' formatted string
      var iso = d.toISOString(); // '2022-11-15T22:29:30.457Z'
      var formatted = iso.replace('T', ' ').substr(0, 16); // '2022-11-15 22:29'
      return formatted;
    },
    onFail: function _onFail(trigger, status) {
      if (!!status && !!status.responseJSON && !!status.responseJSON.detail) {
        var message = status.responseJSON.detail.message;
      } else {
        message = 'Error at "' + trigger + '" - See console.';
      }
      MessageToast.show(message);
    }
  });
  return BaseController;
});
//# sourceMappingURL=BaseController.js.map