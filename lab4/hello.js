/**
 * Возвращает новый emitter
 * @returns {Object}
 */
function getEmitter() {
    const eventsAr = {};

    return {

        /**
         * Подписаться на событие
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         */
        on: function (event, context, handler) {
            if (!eventsAr.hasOwnProperty(event)) {
                eventsAr[event] = [];
            }
            eventsAr[event].push({context: context, handler:handler});
            return this;
        },

        /**
         * Отписаться от события
         * @param {String} event
         * @param {Object} context
         */
        off: function (event, context) {
            for (let e in eventsAr) {
                if (e.startsWith(event + '.') || e === event) {
                    const i = eventsAr[e];
                    eventsAr[e] = i.filter(obj => obj.context !== context);
                }
            }
            return this;
        },


        /**
         * Уведомить о событии
         * @param {String} event
         */
        emit: function (event) {

            function getEvents(event) {
                const splitEvents = event.split(".");
                return splitEvents.reduce((acc, event) => {
                    if (acc.length === 0) {
                        acc = [event];
                    } else {
                        acc.unshift(acc[0] + "." + event);
                    }
                    return acc;
                }, [])
            }

            const events = getEvents(event);
            for (let e in events) {
                const i = events[e];
                for (let ind in eventsAr[i]) {
                    const ev = eventsAr[i][ind];
                    ev.handler.call(ev.context);
                }
            }
            return this;
        },

        /**
         * Подписаться на событие с ограничением по количеству полученных уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} times – сколько раз получить уведомление
         */
        several: function (event, context, handler, times) {
            if (times < 0) {
                this.on(event, context, handler);
            } else {
                let i = 0;
                const fu = function () {
                    if (i < times) {
                        handler.call(context);
                    }
                    i++;
                }
                this.on(event, context, fu);
            }
            return this;
        },

        /**
         * Подписаться на событие с ограничением по частоте получения уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} frequency – как часто уведомлять
         */
        through: function (event, context, handler, frequency) {
            if (frequency < 0) {
                this.on(event, context, handler);
            } else {
                let i = 0;
                const fu = function () {
                    if (i % frequency === 0) {
                        handler.call(context);
                    }
                    i++;
                }
                this.on(event, context, fu);
            }
            return this;
        }
    };
}

module.exports = {
    getEmitter
};