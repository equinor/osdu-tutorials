import {handleErrors} from "./handleErrors";
import {getAccessToken} from "./getAccessToken";
import {loadSchedules} from "./schedule.api";

export interface Activity {
    id: string,
    senderId: string,
    data: {
        EarlyStartDateTime: string,
        EarlyFinishDateTime: string,
        AllocatedHours: number,
    }
};

export interface LoadActivityResponse {
    results: Activity[];
};

export async function loadActivitiesByScheduleId(scheduldId: string): Promise<LoadActivityResponse> {
    const accessToken = await getAccessToken();

    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'data-partition-id': 'opendes',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            "kind": "osdu:wks:work-product-component--ResourceScheduleActivity:0.0.7",
            "query": `data.ParentScheduleID:("${scheduldId}")`,
            "returnedFields": [
                "id",
                "data.AllocatedHours",
                "data.EarlyStartDateTime",
                "data.EarlyFinishDateTime"
            ]
        })
    };

    return fetch("/api/search/v2/query", requestOptions)
        .then(handleErrors)
        .then(response => response.json());
}

export async function loadActivitiesByHeliportId(heliportId: string): Promise<LoadActivityResponse>{
    let schedules = await loadSchedules(heliportId);

    let activities: Activity[]= [];

    for (const s in schedules.results) {
        const acts = await loadActivitiesByScheduleId(schedules.results[s].id);
        acts.results.map(a => a.senderId = schedules.results[s].data.SenderID);
        activities.push(...acts.results);
    }

    const response: LoadActivityResponse = {results: activities};

    return response;
}
