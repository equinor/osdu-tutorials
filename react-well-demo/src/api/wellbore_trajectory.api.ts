import {handleErrors} from "./handleErrors";
import {getAccessToken} from "./getAccessToken";

interface WellboreTrajectory {
    md: [],
    tvd: [],
    azimuth: [],
    inclination: [],
    loongitude: [],
    latitude: [],
};

/**
 * Return wellbore trajectory by a given id
 */
export async function FindWellboreTrajectoryById(wellboreId: string): Promise<any> {
    const accessToken = await getAccessToken();

    const requestOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'data-partition-id': 'opendes',
            'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
            "kind": "osdu:wks:work-product-component--WellboreTrajectory:1.1.0",
            "query": "data.WellboreID:(\"opendes:master-data--Wellbore:ad215042-05db-2b7e-e053-c818a488c79a\")",
            //"query": `data.WellboreID:(\"${wellboreId}\")`,
            "returnedFields": [
                "data.Datasets",
            ]
        })
    };

    fetch("/api/search/v2/query", requestOptions)
        .then(handleErrors)
        .then(response => );
}