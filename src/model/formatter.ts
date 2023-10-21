import ManagedObject from "sap/ui/base/ManagedObject";
import Util from "../controller/custom/Util";
import { FlorescenceStatus, PollinationStatus } from "../interfaces/enums";
import { BPollinationAttempt } from "../interfaces/entities";

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

    public html_for_pollination_status_indicator(pollination_status: PollinationStatus, ongoing: boolean, reverse: boolean) {
        switch (pollination_status) {
            // case "attempt":
            case PollinationStatus.ATTEMPT:
                var color = '#BB0000';  // red
                var icon = '🖌';
                break;
            // case "seed_capsule":
            case PollinationStatus.SEED_CAPSULE:
                color = '#BB0000';  // red
                icon = '⬮';
                break;
            // case "seed":
            case PollinationStatus.SEED:
                color = "#362312";  // brown
                icon = '⋮';
                break;
            // case "germinated":
            case PollinationStatus.GERMINATED:
                color = "#006400";  // green
                icon = '𖥸';
                break;
            case PollinationStatus.UNKNOWN:
                color = "#FFA500";  // orange
                icon = '⚠';
                break;
            default:
                throw new Error("Unknown pollination status: " + pollination_status);
        }
        if (ongoing && pollination_status != PollinationStatus.GERMINATED) {
            var color = '#D6B85A';  // yellow
        }
        const text = (reverse ? '(' + icon + ')' : icon);
        // var text = (reverse ? '(' + icon + ')' : '⬤');
        return '<span style="color:' + color + '">' + text + '</span>';
    }

    public tooltip_for_pollination_status_indicator(
        pollination_attempt: BPollinationAttempt) {

            
// status: {potentialPollenDonorsModel>pollination_status}, pollinated: {potentialPollenDonorsModel>pollination_at}, harvested: {potentialPollenDonorsModel>harvest_at}

        if (pollination_attempt.ongoing) {
            var msg = 'Ongoing';
        } else {
            msg = 'Finished';
        }

        msg += ' / Status "' + pollination_attempt.pollination_status + '"';

        msg += ' / Pollination on ' + pollination_attempt.pollination_at;

        return msg;
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

    getImageUrlAvatarXS(image_id: int | undefined){
        if(!image_id)
            return undefined;
        return Util.getImageUrl(image_id, 'rem', 2, 2);
    }

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
}