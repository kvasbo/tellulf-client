import { UPDATE_POWER_PRICES } from './actions';

export default function PowerPrices(state = {}, action: { type: string, data: object }) {
  switch (action.type) {
    case UPDATE_POWER_PRICES: {
      return { ...action.data };
    }
    default:
      return state;
  }
}