import {authProvider} from "../authProvider";

export function getAccessToken() {
    return authProvider.getAccessToken().then(res => res.accessToken);
};