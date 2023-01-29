'use strict';
global.fetch = require('node-fetch');

const weather = require('./weather');

/**
 * Как выбрать geoid для тестирования функции:
 * Заходим на https://yandex.ru/pogoda, в поиске вводим желаемый город
 * Получаем урл вида https://yandex.ru/pogoda/10451 - 10451 это geoid
 */
const geoids = [10451, 10];

async function main() {
  const path = await weather
    .planTrip(geoids)
    .sunny(2)
    .cloudy(1)
    .build();

  console.info(path);
}

main().catch(console.error);
