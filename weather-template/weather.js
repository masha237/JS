'use strict';

const fetch = require('node-fetch');
const API_KEY = require('./key.json');

/**
 * @typedef {object} TripItem Город, который является частью маршрута.
 * @property {number} geoid Идентификатор города
 * @property {number} day Порядковое число дня маршрута
 */

class TripBuilder {


  constructor(geoid) {
    this.geoid = geoid;
    this.weather = []
    this.maxDays = 7;
  }

  /**
   * Метод, добавляющий условие наличия в маршруте
   * указанного количества солнечных дней
   * Согласно API Яндекс.Погоды, к солнечным дням
   * можно приравнять следующие значения `condition`:
   * * `clear`;
   * * `partly-cloudy`.
   * @param {number} daysCount количество дней
   * @returns {object} Объект планировщика маршрута
   */
  sunny(daysCount) {
    for (let i = 0; i < daysCount; i++) {
      this.weather.push("sunny");
    }
    return this;
  }

  /**
   * Метод, добавляющий условие наличия в маршруте
   * указанного количества пасмурных дней
   * Согласно API Яндекс.Погоды, к солнечным дням
   * можно приравнять следующие значения `condition`:
   * * `cloudy`;
   * * `overcast`.
   * @param {number} daysCount количество дней
   * @returns {object} Объект планировщика маршрута
   */
  cloudy(daysCount) {
    for (let i = 0; i < daysCount; i++) {
      this.weather.push("cloudy");
    }
    return this;
  }

  /**
   * Метод, добавляющий условие максимального количества дней.
   * @param {number} daysCount количество дней
   * @returns {object} Объект планировщика маршрута
   */
  max(daysCount) {
    this.maxDays = daysCount;
    return this;
  }

  /**
   * Метод, возвращающий Promise с планируемым маршрутом.
   * @returns {Promise<TripItem[]>} Список городов маршрута
   */
  build() {
    function isEq(forecast, weatherElement) {
      if ((forecast === "partly-cloudy" || forecast === "clear")
        && weatherElement === "sunny")
        return true;
      return (forecast === "overcast" || forecast === "cloudy") && weatherElement === "cloudy";

    }

    function getPlan(cities, data, weather, maxDays, geoid) {
      if (cities.length === weather.length) {
        return cities;
      }

      for (let d of data) {
        let count = cities.filter(c => c.geoid === d.geoid);
        if (count.length === 0 || count.length < maxDays && cities[cities.length - 1].geoid === d.geoid) {
          if (isEq(d.forecasts[cities.length], weather[cities.length])) {
            let newC = cities;
            newC.push({ geoid: d.geoid, day: cities.length + 1 })
            const plan = getPlan(newC, data, weather, maxDays, geoid);
            if (plan) {
              return plan;
            }
          }
        }
      }
      return undefined;
    }

    return Promise.all(this.geoid.map(geoid => getWeather(geoid)))
        .then(data => {
          // console.log(data);

          const plan = getPlan([], data, this.weather, this.maxDays, this.geoid);
          if (plan) {
            return plan;
          } else {
            throw new Error("Не могу построить маршрут!");
          }
        })
  }
}

/**
 * Фабрика для получения планировщика маршрута.
 * Принимает на вход список идентификаторов городов, а
 * возвращает планировщик маршрута по данным городам.
 *
 * @param {number[]} geoids Список идентификаторов городов
 * @returns {TripBuilder} Объект планировщика маршрута
 * @see https://yandex.ru/dev/xml/doc/dg/reference/regions-docpage/
 */
function planTrip(geoids) {
  return new TripBuilder(geoids);
}



module.exports = {
  planTrip
};

const api = async (geoid) => {
  return await fetch(`https://api.weather.yandex.ru/v2/forecast?hours=false&limit=7&geoid=${geoid}`,
    {headers: {"X-Yandex-API-Key": API_KEY.key}})
    .then(response => response.json())
}

const getWeather = async (geoid) => {
  const json = await api(geoid).then((json => ({
    geoid: json['info']['geoid'],
    forecasts: json["forecasts"].map(day => day['parts']['day_short']['condition'])
  })))
  return json;
}
