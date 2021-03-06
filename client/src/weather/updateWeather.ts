import axios from 'axios';
import { YrResponse } from '../types/yr';

export async function getNowCast(
  lat: number,
  lon: number,
): Promise<{ temp: number; rain: number }> {
  const url = `https://api.met.no/weatherapi/nowcast/2.0/complete?lat=${lat}&lon=${lon}`;
  const nResponse = await axios.get(url);
  if (nResponse.statusText === 'OK') {
    const temp = nResponse.data.properties?.timeseries[0]?.data?.instant?.details?.air_temperature;
    const rain =
      nResponse.data.properties?.timeseries[0]?.data?.next_1_hours?.details?.precipitation_amount;
    return { temp, rain };
  } else {
    return { temp: -999, rain: -1 };
  }
}

// Use the new shiny API!
export async function getYr(lat: number, lon: number): Promise<YrResponse> {
  const url = `https://api.met.no/weatherapi/locationforecast/2.0/complete?lat=${lat.toString()}&lon=${lon.toString()}`;
  const nResponse = await axios.get(url);
  if (nResponse.statusText !== 'OK') {
    throw Error('Could not fetch Yr data');
  }
  // The new API data set
  const nData: YrResponse = nResponse.data;
  return nData;
}
