import axios, { AxiosError, AxiosResponse } from "axios";

export default async function refreshOnDemand(asyncCallback: () => Promise<AxiosResponse>) {
    try {
        //try executing request
        const result = await asyncCallback();
        return result;
    } catch (err) {
        //try refreshing token and repeat
        const error = err as AxiosError;
        if (error?.response?.status == 401) {
            await axios.post('/auth/refresh-token');
            return await asyncCallback();
        }
        else throw error;
    }
}
