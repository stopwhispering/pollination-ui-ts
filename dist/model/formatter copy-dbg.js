sap.ui.define([], function () {
  "use strict";

  return {
    html_for_count_stored_pollen_containers: function (iCount) {
      if (!iCount || iCount == 0) {
        return '';
      }
      if (iCount == 1) {
        var color = '#FF0000';
        var text = '▊';
      } else if (iCount <= 3) {
        color = '#FFA500';
        text = '▊▊';
      } else {
        color = '#7FFF00';
        text = '▊▊▊';
      }
      return '<span style="color:' + color + '">' + text + '</span>';
    },
    html_for_pollination_status_indicator: function (pollination_status, ongoing, reverse) {
      if (ongoing) {
        var color = '#BB0000'; // dark red, equal to sap.ui.core.MessageType.Error
      } else {
        switch (pollination_status) {
          case "attempt":
            var color = '#FFE599'; // beige
            break;
          case "seed_capsule":
            color = "#9FC5E8"; // blue
            break;
          case "seed":
            color = "#BF9000"; // orange
            break;
          case "germinated":
            color = "#00AB41"; // green
            break;
          case "unknown":
            color = "#FF0000"; // red
            break;
          default:
            throw new Error("Unknown pollination status: " + pollination_status);
        }
      }
      var text = reverse ? '(⬤)' : '⬤';
      return '<span style="color:' + color + '">' + text + '</span>';
    },
    html_for_active_florescence_dates: function (inflorescence_appearance_date, first_flower_opening_date, last_flower_closing_date, florescence_status) {
      // dates in format '%Y-%m-%d', e.g. '2022-11-16'
      switch (florescence_status) {
        case "inflorescence_appeared":
          var text = inflorescence_appearance_date ? '🙢 ' + inflorescence_appearance_date.substr(5, 5) : '';
          break;
        case "flowering":
          var text = first_flower_opening_date ? '✽ ' + first_flower_opening_date.substr(5, 5) : '';
          break;
        case "finished":
          var text = last_flower_closing_date ? '۰ ' + last_flower_closing_date.substr(5, 5) : '';
          break;
        default:
          throw new Error("Unknown florescence status: " + florescence_status);
      }
      return text;
    },
    html_for_pollination_probability: function (probability_pollination_to_seed) {
      // dates in format '%Y-%m-%d', e.g. '2022-11-16'
      if (probability_pollination_to_seed == null) {
        return '';
      } else if (probability_pollination_to_seed == 0) {
        var color = "#FF0000"; // red
      } else if (probability_pollination_to_seed < 40) {
        color = "#FFA500"; // orange
      } else if (probability_pollination_to_seed < 70) {
        color = "#FDDA0D"; // orange/yellow
      } else {
        color = "#097969"; // cadmium green
      }

      return '<span style="color:' + color + '">' + probability_pollination_to_seed + '%</span>';
    }
  };
});
//# sourceMappingURL=formatter copy.js.map