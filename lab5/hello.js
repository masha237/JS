'use strict';

function f(friends, filter, level = Infinity) {
    if (filter instanceof Filter) {
        let newPerson = friends.filter(p => p.best);
        let set = new Set();
        newPerson.forEach(p => set.add(p.name));

        let data = [];
        while (level > 0 && newPerson.length > 0) {
            data.push(...newPerson.sort((a, b) => a.name.localeCompare(b.name)));
            newPerson = newPerson.reduce((a, p) => a.concat(p.friends), [])
                .map(name => friends.find(f => f.name === name))
                .filter((friend, pos, arr) => {return !data.includes(friend) && arr.indexOf(friend) === pos})
                .sort((a, b) => a.name.localeCompare(b.name));

            level--;
        }


        //console.log(Array.from(set).map(f => f.name))

        return  data.filter(filter.predict);
    } else {
        throw new TypeError("filter");
    }
}

/**
 * Итератор по друзьям
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 */
function Iterator(friends, filter) {
    this.data = f(friends, filter)
}

Iterator.prototype.done = function () {
    return this.data.length === 0
}

Iterator.prototype.next = function () {
    if (this.data.length === 0) {
        return null;
    } else {
        return this.data.shift();
    }
}

/**
 * Итератор по друзям с ограничением по кругу
 * @extends Iterator
 * @constructor
 * @param {Object[]} friends
 * @param {Filter} filter
 * @param {Number} maxLevel – максимальный круг друзей
 */
function LimitedIterator(friends, filter, maxLevel) {
    this.data = f(friends, filter, maxLevel);
}
Object.setPrototypeOf(LimitedIterator.prototype, Iterator.prototype);


/**
 * Фильтр друзей
 * @constructor
 */
function Filter() {
    this.predict = () => true;
}

/**
 * Фильтр друзей
 * @extends Filter
 * @constructor
 */
function MaleFilter() {
    this.predict = person => person.gender === 'male';
}
Object.setPrototypeOf(MaleFilter.prototype, Filter.prototype);


/**
 * Фильтр друзей-девушек
 * @extends Filter
 * @constructor
 */
function FemaleFilter() {
    this.predict = person => person.gender === 'female';
}
Object.setPrototypeOf(FemaleFilter.prototype, Filter.prototype);

exports.Iterator = Iterator;
exports.LimitedIterator = LimitedIterator;

exports.Filter = Filter;
exports.MaleFilter = MaleFilter;
exports.FemaleFilter = FemaleFilter;