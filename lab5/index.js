const assert = require('assert');
const lib = require('./hello'); // Ваш файл с кодом задачи

const friends = [
    {
        name: 'Sam',
        friends: ['Mat', 'Sharon'],
        gender: 'male',
        best: true
    },
    {
        name: 'Sally',
        friends: ['Brad', 'Emily'],
        gender: 'male',
        best: true
    },
    {
        name: 'Mat',
        friends: ['Sam', 'Sharon'],
        gender: 'male'
    },
    {
        name: 'Sharon',
        friends: ['Sam', 'Itan', 'Mat'],
        gender: 'female'
    },
    {
        name: 'Brad',
        friends: ['Sally', 'Emily', 'Julia'],
        gender: 'male'
    },
    {
        name: 'Emily',
        friends: ['Sally', 'Brad'],
        gender: 'female'
    },
    {
        name: 'Itan',
        friends: ['Sharon', 'Julia'],
        gender: 'male'
    },
    {
        name: 'Julia',
        friends: ['Brad', 'Itan'],
        gender: 'female'
    }
];

function friend(name) {
    let len = friends.length;

    while (len--) {
        if (friends[len].name === name) {
            return friends[len];
        }
    }
}

const maleFilter = new lib.MaleFilter();
const femaleFilter = new lib.FemaleFilter();
const maleIterator = new lib.LimitedIterator(friends, maleFilter, 1);
const femaleIterator = new lib.Iterator(friends, femaleFilter);

const invitedFriends = [];

while (!maleIterator.done() && !femaleIterator.done()) {
    invitedFriends.push([
        maleIterator.next(),
        femaleIterator.next()
    ]);
}

while (!femaleIterator.done()) {
    invitedFriends.push(femaleIterator.next());
}



/*
assert.deepStrictEqual(invitedFriends, [

]);*/

function getCity() {
    console.log("kek")
    let resp = fetch(`https://raw.githubusercontent.com/mwgg/Airports/master/airports.json`).then(resp => console.log(resp));
    console.log(resp)
}

let names = getCity();
