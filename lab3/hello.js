'use strict';

const DAYS = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
const dayIndex = {
    "ПН": 0,
    "ВТ": 1,
    'СР': 2,
    'ЧТ': 3,
    'ПТ': 4,
    'СБ': 5,
    'ВС':6
}


/**
 * @param {Object} schedule Расписание Банды
 * @param {number} duration Время на ограбление в минутах
 * @param {Object} workingHours Время работы банка
 * @param {string} workingHours.from Время открытия, например, "10:00+5"
 * @param {string} workingHours.to Время закрытия, например, "18:00+5"
 * @returns {Object}
 */
function getAppropriateMoment(schedule, duration, workingHours) {
    const allTimes = getAllTimes(schedule, duration, workingHours)
    const hasTime = (findTime(allTimes) !== null);
    let firstTime = findTime(allTimes);

    function parseTime(time) {
        const reg = /^(\d\d):(\d\d)\+(\d)$/;
        const reg2 = /^(\d\d):(\d\d)\+(\d)$/;
        const p = reg.exec(time)
        if (p === null) {
            return reg2.exec(time);
        }
        return p;
    }

    function getMinute(from) {
        const time = parseTime(from);
        return parseInt(time[1]) * 60 + parseInt(time[2]);
    }

    function getZone(parsTFromElement, zone) {
        return 60 * (-parseInt(parsTFromElement) + parseInt(zone));
    }

    function getAllTimes(schedule, duration, workingHours) {
        const allTimes = {}
        const parseTime2 = parseTime(workingHours.from);
        const zone = parseTime2[3];
        for (let i = 0; i < 3; i++) {
            allTimes[DAYS[i]] = []
        }
        for (let i = getMinute(workingHours.from); i <= getMinute(workingHours.to) - duration; i++) {
            const first = i;
            const end = i + duration;
            for (let day = 0; day < 3; day++) {
                let FLAG = 1;
                for (let person in schedule) {
                    let fl = 1;
                    const times = schedule[person]
                    for (let timeInd in times) {
                        const time = times[timeInd]
                        const [dayFrom, tFrom] = time.from.split(' ')
                        const parsTFrom = parseTime(tFrom);
                        let indexFrom = dayIndex[dayFrom];
                        const [dayTo, tTo] = time.to.split(' ')
                        let indexTo = dayIndex[dayTo];

                        let begin = getMinute(tFrom) + getZone(parsTFrom[3], zone);
                        const endT = getMinute(tTo) + getZone(parsTFrom[3], zone);

                        if (begin < 0) {
                            indexFrom--;
                        }
                        if (endT > 24 * 60) {
                            indexTo++;
                        }

                        if (!((day < indexFrom || day === indexFrom &&  first < begin && end <= begin) ||
                            (day > indexTo || day === indexTo && first >= endT && end > endT))) {
                            fl = 0;
                            break;
                        }
                    }
                    if (fl === 0) {
                        FLAG = 0;
                        break
                    }
                }
                if (FLAG === 1) {
                    allTimes[DAYS[day]].push(i);
                }
            }
        }
        return allTimes;
    }

    function findTime() {
        for (let i = 0; i < 3; i++) {
            if (allTimes[DAYS[i]].length) {
                return {day: i, time: allTimes[DAYS[i]][0]};
            }
        }
        return null;
    }


    function timeFormat(number) {
        const str = number.toString();
        if (str.length === 1) {
            return "0" + str;
        }
        return str;
    }

    function findNext() {
        if (firstTime === null) {
            return false;
        }
        for (let i = firstTime.day; i < 3; i++) {
            for (let j in allTimes[DAYS[i]]) {
                if (i !== firstTime.day || allTimes[DAYS[i]][j] >= firstTime.time + 30) {
                    firstTime.time = allTimes[DAYS[i]][j];
                    firstTime.day = i;
                    return true;
                }
            }
        }
        return false;
    }

    return {
        /**
         * Найдено ли время
         * @returns {boolean}
         */
        exists() {
            return hasTime;
        },

        /**
         * Возвращает отформатированную строку с часами
         * для ограбления во временной зоне банка
         *
         * @param {string} template
         * @returns {string}
         *
         * @example
         * ```js
         * getAppropriateMoment(...).format('Начинаем в %HH:%MM (%DD)') // => Начинаем в 14:59 (СР)
         * ```
         */
        format(template) {
            if (firstTime === null) {
                return "";
            }
            return template.replace("%DD", DAYS[firstTime.day])
                .replace("%HH", timeFormat(parseInt(firstTime.time / 60)))
                .replace("%MM", timeFormat(firstTime.time % 60));
        },

        /**
         * Попробовать найти часы для ограбления позже [*]
         * @note Не забудь при реализации выставить флаг `isExtraTaskSolved`
         * @returns {boolean}
         */
        tryLater() {
            return findNext();
        }
    };
}

module.exports = {
    getAppropriateMoment
};