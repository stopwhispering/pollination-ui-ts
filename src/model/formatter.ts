import ManagedObject from "sap/ui/base/ManagedObject";
import Util from "../controller/custom/Util";
import { FlorescenceStatus, PollinationStatus } from "../interfaces/enums";
import { BPollinationAttempt } from "../interfaces/entities";
import List from "sap/m/List";

/**
 * @namespace pollination.ui.model
 */
export default class formatter extends ManagedObject {
    public html_for_count_stored_pollen_containers(iCount: int) {
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
    }

    html_for_active_florescence_dates(inflorescence_appeared_at: string, first_flower_opened_at: string, last_flower_closed_at: string, florescence_status: FlorescenceStatus) {
        // dates in format '%Y-%m-%d', e.g. '2022-11-16'
        switch (florescence_status) {
            case "inflorescence_appeared":
                var text = (inflorescence_appeared_at ? '🙢 ' + inflorescence_appeared_at.substr(5, 5) : '');
                break;
            case "flowering":
                var text = (first_flower_opened_at ? '✽ ' + first_flower_opened_at.substr(5, 5) : '');
                break;
            case "finished":
                var text = (last_flower_closed_at ? '۰ ' + last_flower_closed_at.substr(5, 5) : '');
                break;
            default:
                throw new Error("Unknown florescence status: " + florescence_status);
        }
        return text;
    }


    getImageUrlAvatarL(image_id: int | undefined){
        if(!image_id)
            return undefined;
        return Util.getImageUrl(image_id, 'rem', 5, 5);
    }

    // getImageUrlAvatarS(image_id: int | undefined){
    //     if(!image_id)
    //         return undefined;
    //     return Util.getImageUrl(image_id, 'rem', 3, 3);
    // }

    html_for_pollination_probability(probability_pollination_to_seed: float) {
        // dates in format '%Y-%m-%d', e.g. '2022-11-16'
        if (probability_pollination_to_seed == null) {
            return '';
        } else if (probability_pollination_to_seed == 0) {
            var color = "#FF0000";  // red
        } else if (probability_pollination_to_seed < 40) {
            color = "#FFA500";  // orange
        } else if (probability_pollination_to_seed < 70) {
            color = "#FDDA0D";  // orange/yellow
        } else {
            color = "#097969";  // cadmium green
        }
        return '<span style="color:' + color + '">' + probability_pollination_to_seed + '%</span>';
    }

    seed_ripening_progress_indicator_state(current_ripening_days: int, predicted_ripening_days: int){
        if (current_ripening_days/predicted_ripening_days > 1.15){
            return 'Error';
        } else if (current_ripening_days/predicted_ripening_days > 0.95){
            return 'Warning';
        } else {
            return 'None';
        }
    }

    germination_progress_indicator_state(current_germination_days: int, predicted_germination_days: int){
        if (current_germination_days/predicted_germination_days > 1.25){
            return 'Error';
        } else if (current_germination_days/predicted_germination_days > 0.95){
            return 'Warning';
        } else {
            return 'None';
        }
    }

    ellipsize(text1: string, text2: string, text3: string) {
        let text = text1 + ' ' + (text2 || '') + ' ' + (text3 || '');
        if (text.length > 38) {
            text = text.substring(0, 35) + '…';
        }
        return text;
    }
}