import ManagedObject from "sap/ui/base/ManagedObject";
import { FlorescenceStatus, PollinationStatus } from "../interfaces/enums";

/**
 * @namespace pollination.ui.model
 */
export default class formatter extends ManagedObject{
        public html_for_count_stored_pollen_containers(iCount: int) {
			if (!iCount || iCount == 0){
                return '';
            }
            if (iCount == 1){
                var color = '#FF0000';
                var text = '▊';
            } else if (iCount <= 3){
                color = '#FFA500';
                text = '▊▊';
            } else {
                color = '#7FFF00';
                text = '▊▊▊';
            }

            return '<span style="color:' + color + '">' + text + '</span>';
        }

        public html_for_pollination_status_indicator(pollination_status: PollinationStatus, ongoing: boolean, reverse: boolean){
            if (ongoing){
                var color = '#BB0000';  // dark red, equal to sap.ui.core.MessageType.Error
            } else {
                switch(pollination_status){
                    // case "attempt":
                    case PollinationStatus.ATTEMPT:
                        var color='#FFE599';  // beige
                        break;
                    // case "seed_capsule":
                    case PollinationStatus.SEED_CAPSULE:
                        color="#9FC5E8";  // blue
                        break;
                    // case "seed":
                    case PollinationStatus.SEED:
                        color="#BF9000";  // orange
                        break;
                    // case "germinated":
                    case PollinationStatus.GERMINATED:
                        color="#00AB41";  // green
                        break;
                    case PollinationStatus.UNKNOWN:
                        color = "#FF0000";  // red
                        break;
                    default:
                        throw new Error("Unknown pollination status: " + pollination_status);
                }
            }
            var text = (reverse ? '(⬤)' : '⬤');
            return '<span style="color:' + color + '">' + text + '</span>';
        }

        html_for_active_florescence_dates(inflorescence_appearance_date: string, first_flower_opening_date: string, last_flower_closing_date: string, florescence_status: FlorescenceStatus){
        // dates in format '%Y-%m-%d', e.g. '2022-11-16'
            switch(florescence_status){
                case "inflorescence_appeared":
                    var text = (inflorescence_appearance_date ? '🙢 ' + inflorescence_appearance_date.substr(5,5) : '');
                    break;
                case "flowering":
                    var text = (first_flower_opening_date ? '✽ ' + first_flower_opening_date.substr(5,5) : '');
                    break;
                case "finished":
                    var text = (last_flower_closing_date ? '۰ ' + last_flower_closing_date.substr(5,5) : '');
                    break;
                default:
                    throw new Error("Unknown florescence status: " + florescence_status);
            }
            return text;
        }

        html_for_pollination_probability(probability_pollination_to_seed: float){
        // dates in format '%Y-%m-%d', e.g. '2022-11-16'
            if (probability_pollination_to_seed == null){
                return '';
            } else if (probability_pollination_to_seed == 0){
                var color = "#FF0000";  // red
            } else if (probability_pollination_to_seed < 40){
                color = "#FFA500";  // orange
            } else if (probability_pollination_to_seed < 70){
                color = "#FDDA0D";  // orange/yellow
            } else {
                color = "#097969";  // cadmium green
            }
            return '<span style="color:' + color + '">' + probability_pollination_to_seed + '%</span>';
        }
}