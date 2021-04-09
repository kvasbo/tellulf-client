import maxBy from 'lodash/maxBy';
import Moment from 'moment';
import React from 'react';
import { connect } from 'react-redux';
import store from 'store';
import { AppStore } from '../redux/reducers';
import { YrStore } from '../types/yr';
import { Event, EventDataSet } from '../types/calendar';
import { ForecastStore, HourForecast, WeatherDataSeries } from '../types/forecast';
import WeatherGraph from '../weather/WeatherGraph';
import {
  getUsableYrDataset,
  createForecastSummary,
  filterForecastData,
  parseYrDatasetToTellulf,
} from '../weather/weatherHelpers';
import HendelseFullDag from './HendelseFullDag';
import HendelseMedTid from './HendelseMedTid';

interface Props {
  dinner: EventDataSet;
  birthdays: EventDataSet;
  events: EventDataSet;
  date: Moment.Moment;
  forecast: ForecastStore;
  yr: YrStore;
}

interface State {
  sted: string;
}

// CHeck if we have a full dataset for the day
function showWeatherGraphForDay(day: Moment.Moment, data: WeatherDataSeries): boolean {
  const weather = Object.values(data);
  if (weather.length === 0) return false;
  const endOfDay = Moment(day).endOf('day');
  const lastKnown: HourForecast = maxBy(weather, 'time');
  const lastMoment = Moment(lastKnown.time);
  return lastMoment.isAfter(endOfDay);
}

function getDayHeader(date: Moment.Moment) {
  return date.format('dddd D.');
}

class Dag extends React.PureComponent<Props, State> {
  private togglePlace: () => void;

  public constructor(props: Props) {
    super(props);
    this.state = { sted: this.loadSted() };
    this.togglePlace = (): void => {
      const sted = this.loadSted();
      const nyttSted = sted === 'oslo' ? 'sandefjord' : 'oslo';
      store.set(`sted_${this.props.date}`, nyttSted);
      this.setState({ sted: nyttSted });
    };
  }

  private loadSted(): string {
    const sted = store.get(`sted_${this.props.date}`, 'oslo');
    return sted;
  }

  private getDinner() {
    try {
      if (!this.props.dinner || !this.props.dinner.events) return null;
      return (
        <div className="kalenderSubInfo">
          <img
            src="dinner.png"
            width={15}
            height={15}
            alt="Dinner"
            style={{ filter: 'invert(100%)', marginRight: 5 }}
          />
          {this.props.dinner.events[0].name}
        </div>
      );
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
      return null;
    }
  }

  private getBirthdays(): JSX.Element[] {
    if (!this.props.birthdays || !this.props.birthdays.events) return [];
    const out: JSX.Element[] = [];
    try {
      this.props.birthdays.events.forEach((b: Event) => {
        const matches = b.name.match(/\d+$/);
        // eslint-disable-next-line prefer-destructuring
        let name = b.name;
        if (matches) {
          const number = parseInt(matches[0], 10);
          const age = new Date().getFullYear() - number;
          name = name.substring(0, name.length - 5);
          name = `${name} (${age})`;
        }
        out.push(
          <div className="kalenderSubInfo" key={b.id}>
            <img
              src="kake.png"
              width={15}
              height={15}
              alt="Kake"
              style={{ filter: 'invert(100%)', marginRight: 5 }}
            />
            {name}
          </div>,
        );
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
    }
    return out;
  }

  private getEvents(): JSX.Element[] {
    if (!this.props.events || !this.props.events.events) return [];
    const out: JSX.Element[] = [];

    try {
      const events = this.props.events.events.sort((a: Event, b: Event) => {
        return a.start.isBefore(b.start) ? -1 : 1;
      });

      events.forEach((e: Event) => {
        if (e.fullDay) {
          out.push(<HendelseFullDag key={e.id} data={e} />);
        } else {
          out.push(<HendelseMedTid key={e.id} data={e} />);
        }
      });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
    }
    return out;
  }

  private filterForecast(
    date: Moment.Moment,
    sted: string,
    hoursBefore = 0,
    hoursAfter = 0,
  ): WeatherDataSeries {
    if (!this.props.forecast.data || !this.props.forecast.data[sted]) {
      return {};
    }

    return filterForecastData(
      date,
      this.props.forecast.data[sted].forecast,
      hoursBefore,
      hoursAfter,
    );
  }

  private getWeather(date: Moment.Moment, sted: string) {
    const fromStamp = Moment(date).startOf('day').valueOf(); //.add(6, 'hours');
    const toStamp = Moment(date).add(1, 'day').valueOf(); //.subtract(2, 'hours');

    const forecastDataYr = getUsableYrDataset(this.props.yr[this.state.sted], fromStamp, toStamp);
    const forecastData = parseYrDatasetToTellulf(forecastDataYr);

    if (!showWeatherGraphForDay(this.props.date, forecastData)) return null;

    const from = Moment(date).startOf('day'); //.add(6, 'hours');
    const to = Moment(date).add(1, 'day'); //.subtract(2, 'hours');

    return (
      <WeatherGraph
        date={this.props.date}
        weather={forecastData}
        from={from}
        to={to}
        sted={sted}
        showPlace={sted !== 'oslo'}
        onClick={this.togglePlace}
        limits={this.props.forecast.limits}
      />
    );
  }

  public render(): React.ReactNode {
    // New

    const stedToShow = this.state.sted !== 'oslo' ? this.state.sted.toLocaleUpperCase() : null;

    return (
      <div className="kalenderDag">
        <div className="kalenderDato">{getDayHeader(this.props.date)}</div>
        <div className="kalenderDato weatherSummary">
          {createForecastSummary(this.filterForecast(this.props.date, this.state.sted, 0, 0))}
        </div>
        <div className="weatherGraph">{this.getWeather(this.props.date, this.state.sted)}</div>
        <div className="kalenderSted">{stedToShow}</div>
        <div className="kalendarDayInfo">
          {this.getBirthdays()}
          {this.getDinner()}
          {this.getEvents()}
        </div>
      </div>
    );
  }
}

function mapStateToProps(state: AppStore) {
  return {
    forecast: state.Forecast,
    yr: state.Yr,
  };
}

// export default Dag;
export default connect(mapStateToProps)(Dag);
