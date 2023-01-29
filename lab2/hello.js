'use strict';

/**
 * Телефонная книга
 */
const phoneBook = new Map();
let line = 0;
let TIME = 0;
const phoneRus = "телефон";
const mailRu = "почту";


/**
 * Вызывайте эту функцию, если есть синтаксическая ошибка в запросе
 * @param {number} lineNumber – номер строки с ошибкой
 * @param {number} charNumber – номер символа, с которого запрос стал ошибочным
 */
function syntaxError(lineNumber, charNumber) {
    throw new Error(`SyntaxError: Unexpected token at ${lineNumber}:${charNumber}`);
}

function addContact(curQuery) {
    let name = curQuery.slice("Создай контакт ".length);
    if (name.length === 0 || name[name.length - 1] !== ';') {
        syntaxError(line, curQuery.length + 1);
    }
    name = name.slice(0, name.length - 1);
    if (name.length !== 0 && !phoneBook.has(name)) {
        phoneBook.set(name, {phone: [],
                            mail: [],
                            time: TIME,
                            phoneSet: new Set(),
                            mailSet: new Set()});
    }
}

function deleteContact(curQuery) {
    let name = curQuery.slice("Удали контакт ".length);
    if (name.length === 0 || name[name.length - 1] !== ';') {
        syntaxError(line, curQuery.length + 1);
    }
    name = name.slice(0, name.length - 1);
    if (name.length !== 0 && phoneBook.has(name)) {
        phoneBook.delete(name);
    }
}

function addPhoneOrMail(curQuery) {
    let query = curQuery.slice("Добавь ".length);
    let skip = "Добавь ".length;
    let phones = [];
    let mails = [];
    let need = false;
    let kol = 0;
    while (true) {
        if (query[0] === "т" && (need || kol === 0)) {
            kol++;
            need = false;
            let ind = 0;
            while (ind !== query.length && ind !== phoneRus.length && query[ind] === phoneRus[ind]) {
                ind++;
            }
            if (ind !== phoneRus.length) {
                syntaxError(line, skip + 1);
            }
            if (ind !== query.length && query[ind] === ";") {
                syntaxError(line, skip + phoneRus.length + 1);
            }
            if (ind !== query.length && query[ind] !== " ") {
                syntaxError(line, skip + 1);
            }
            if (ind === query.length) {
                syntaxError(line, curQuery.length + 1);
            }

            ind++;

            let newPhone = "";
            for (let i = 0; i < 10; i++, ind++) {
                if (query.length === ind) {
                    syntaxError(line, skip + phoneRus.length + 2);
                }
                if (!(query[ind] >= '0' && query[ind] <= '9')) {
                    syntaxError(line, skip + phoneRus.length + 2);
                }
                newPhone = newPhone.concat(query[ind])
            }
            phones.push(newPhone);

            if (query[ind] === ";") {
                syntaxError(line, skip + phoneRus.length + 2 + 10);
            }
            if (query[ind] !== " ") {
                syntaxError(line, skip + phoneRus.length + 2);
            }
            query = query.slice(ind + 1);
            skip += ind + 1;
        } else if (query[0] === "п" && (need || kol === 0)) {
            kol++;
            need = false;
            let ind = 0;
            while (ind !== query.length && ind !== mailRu.length && query[ind] === mailRu[ind]) {
                ind++;
            }
            if (ind !== mailRu.length) {
                syntaxError(line, skip + 1);
            }
            if (ind !== query.length && query[ind] === ";") {
                syntaxError(line, skip + mailRu.length + 1);
            }
            if (ind !== query.length && query[ind] !== " ") {
                syntaxError(line, skip + 1);
            }
            if (ind === query.length) {
                syntaxError(line, curQuery.length + 1);
            }


            ind++;

            let newMail = "";
            while (query.length !== ind && query[ind] !== " ") {
                newMail = newMail.concat(query[ind])
                ind++;
            }
            if (query.length === ind) {
                syntaxError(line, mailRu.length + 2 + skip);
            }

            mails.push(newMail);
            query = query.slice(ind + 1);
            skip += ind + 1;
        } else if (query[0] === "и" && (!need && kol !== 0)) {
            if (query.length === 1 || query[1] === ';') {
                syntaxError(line, 2 + skip);
            }
            if (query.length === 1 || query[1] !== ' ') {
                syntaxError(line, 1 + skip);
            }

            skip += 2;
            need = true;
            query = query.slice(2);
        } else {
            if (need) {
                syntaxError(line, skip + 1);
            }
            break;
        }
    }

    let str = "для контакта ";
    let ind = 0;
    let lastSkip = skip;
    while (ind !== str.length && ind !== query.length && query[ind] === str[ind]) {
        if (query[ind] === ' ') {
            skip = lastSkip + ind;
        }
        ind++;

    }
    if (ind !== str.length) {
        if (str[ind] === ' ' && query[ind] === ';') {
            syntaxError(line, 1 + skip + ind);
        }
        syntaxError(line, 2 + skip);
    }
    let name = query.slice(str.length);

    if (name.length === 0 || name[name.length - 1] !== ';') {
        syntaxError(line, curQuery.length + 1);
    }
    name = name.slice(0, name.length - 1);
    if (name.length === 0) {
        return
    }
    for (let phone of phones) {
        if (phoneBook.has(name) && !phoneBook.get(name).phoneSet.has(phone)) {
            phoneBook.get(name).phoneSet.add(phone);
            phoneBook.get(name).phone.push(phone);
        }
    }
    for (let mail of mails) {
        if (phoneBook.has(name) && !phoneBook.get(name).mailSet.has(mail)) {
            phoneBook.get(name).mailSet.add(mail);
            phoneBook.get(name).mail.push(mail);
        }
    }
}


function phoneFormat(s) {
    return "+7 (" + s[0] + s[1] + s[2] + ") " + s[3] + s[4] + s[5] + "-" + s[6] + s[7] + "-" + s[8] + s[9];
}

function showContact(curQuery) {
    let query = curQuery.slice("Покажи ".length);
    let skip = "Покажи ".length;
    let types = [];
    let need = false;
    let kol = 0;
    while (true) {
        if (query[0] === 'д') {
            if (need) {
                syntaxError(line, skip + 1);
            }
            break;
        } else if (query[0] === 'п' && (need || kol === 0)) {
            need = false;
            kol++;
            let mail = "почты ";
            let ind = 0
            while (ind !== mail.length && ind !== query.length && query[ind] === mail[ind]) {
                ind++;
            }

            if (ind !== mail.length) {
                if (ind !== query.length && ind === mail.length - 1 && query[ind] === ';') {
                    syntaxError(line, skip + mail.length);
                }
                syntaxError(line, 1 + skip);
            }
            types.push("mail");
            skip += "почты ".length;
            query = query.slice("почты ".length);
        } else if (query[0] === 'т' && (need || kol === 0)) {
            kol++;
            need = false;
            let phone = "телефоны ";
            let ind = 0
            while (ind !== phone.length && ind !== query.length && query[ind] === phone[ind]) {
                ind++;
            }
            if (ind !== phone.length) {
                if (ind !== query.length && ind === phone.length - 1 && query[ind] === ';') {
                    syntaxError(line, skip + phone.length);
                }
                syntaxError(line, skip + 1);
            }

            types.push("phone");
            skip += "телефоны ".length;
            query = query.slice("телефоны ".length);
        } else if (query.length >= 2 && query[0] === 'и' && query[1] === 'м' && (need || kol === 0)) {
            kol++;
            need = false;
            if (query.length >= 4 && query[2] === 'я' && query[3] === ';') {
                syntaxError(line, skip + 4);
            }
            if (!(query.length >= 4 && query[2] === 'я' && query[3] === ' ')) {
                syntaxError(line, skip + 1);
            }
            types.push("name");
            skip += 4;
            query = query.slice(4);

        } else if (query.length >= 2 && query[0] === 'и' && query[1] === ' ' && (!need && kol !== 0)) {
            need = true;
            skip += 2;
            query = query.slice(2);
        } else if (query.length >= 2 && query[0] === 'и' && query[1] === ';') {
            syntaxError(line, skip + 2);
        } else {
            syntaxError(line, skip + 1);
        }
    }
    let str = "для контактов, где есть ";
    let ind = 0;
    let lastSkip = skip;
    while (ind !== str.length && ind !== query.length && query[ind] === str[ind]) {
        if (query[ind] === ' ') {
            skip = lastSkip + ind + 1;
        }
        ind++;
    }

    if (ind !== str.length) {
        if (str[ind] === ' ' && query[ind] === ';') {
            syntaxError(line, 1 + skip + ind);
        }
        syntaxError(line, 1 + skip);
    }
    query = query.slice(str.length);
    if (query.length === 0 || query[query.length - 1] !== ';') {
        syntaxError(line, curQuery.length + 1);
    }
    query = query.slice(0, query.length - 1);
    let find1 = find(query);
    let ans = [];

    for (let name of find1) {
        let cur = "";
        if (!phoneBook.has(name)) {
            for (let type of types) {
                cur += ";";
            }
        } else {
            for (let type of types) {
                if (type === 'name') {
                    cur += (name + ";");
                } else if (type === "mail") {
                    cur += (phoneBook.get(name).mail.join(",") + ";");
                } else if (type === "phone") {
                    cur += (phoneBook.get(name).phone.map(x => phoneFormat(x)).join(",") + ";");
                }
            }
        }

        if (cur.length > 0) {
            ans.push(cur.slice(0, cur.length - 1));
        } else {
            ans.push(cur);
        }

    }
    return ans;
}

function find(query) {
    if (query.length === 0) {
        return [];
    }
    let ans = [];
    for (let value of phoneBook.keys()) {
        let key = phoneBook.get(value);
        if (value.includes(query)) {
            ans.push(value);
        } else {
            for (let phone of key.phone) {
                if (phone.includes(query)) {
                    ans.push(value);
                }
            }
            for (let mail of key.mail) {
                if (mail.includes(query)) {
                    ans.push(value);
                }
            }
        }
    }
    return ans.sort((a, b) => {return phoneBook.get(a).time - phoneBook.get(b).time});
}

function deleteContacts(curQuery) {
    let query = curQuery.slice("Удали контакты, где есть ".length);
    if (query.length === 0 || query[query.length - 1] !== ';') {
        syntaxError(line, curQuery.length + 1);
    }
    query = query.slice(0, query.length - 1);
     let del = find(query);
    for (let el of del) {
        phoneBook.delete(el);
    }
}

function deleteInfoForContact(curQuery) {
    let query = curQuery.slice("Удали ".length);
    let skip = "Удали ".length;
    let phones = [];
    let mails = [];
    let need = false;
    let kol = 0;
    while (true) {
        if (query[0] === "т" && (need || kol === 0)) {
            need = false;
            kol++;
            let ind = 0;
            while (ind !== query.length && ind !== phoneRus.length && query[ind] === phoneRus[ind]) {
                ind++;
            }

            if (ind !== phoneRus.length || ind !== query.length && query[ind] !== " ") {
                syntaxError(line, skip + 1);
            }
            if (ind === query.length) {
                syntaxError(line, curQuery.length + 1);
            }
            ind++;

            let newPhone = "";
            for (let i = 0; i < 10; i++, ind++) {
                if (query.length === ind) {
                    syntaxError(line, skip + phoneRus.length + 2);
                }
                if (!(query[ind] >= '0' && query[ind] <= '9')) {
                    syntaxError(line, skip + phoneRus.length + 2);
                }
                newPhone = newPhone.concat(query[ind])
            }
            phones.push(newPhone);
            if (query[ind] !== " ") {
                syntaxError(line, skip + phoneRus.length + 2);
            }
            query = query.slice(ind + 1);
            skip += ind + 1;
        } else if (query[0] === "п" && (need || kol === 0)) {
            kol++;
            need = false;
            let ind = 0;
            while (ind !== query.length && ind !== mailRu.length && query[ind] === mailRu[ind]) {
                ind++;
            }

            if (ind !== mailRu.length || ind !== query.length && query[ind] !== " ") {
                syntaxError(line, 1 + skip);
            }
            if (ind === query.length) {
                syntaxError(line, curQuery.length + 1);
            }
            ind++;

            let newMail = "";
            while (query.length !== ind && query[ind] !== " ") {
                newMail = newMail.concat(query[ind])
                ind++;
            }
            if (query.length === ind) {
                syntaxError(line, mailRu.length + 2 + skip);
            }

            mails.push(newMail);
            query = query.slice(ind + 1);
            skip += ind + 1;
        } else if (query[0] === "и" && (!need && kol !== 0)) {
            need = true;
            if (query.length === 1 || query[1] !== ' ') {
                syntaxError(line, 2 + skip);
            }
            skip += 2;
            query = query.slice(2);
        } else {
            if (need) {
                syntaxError(line, skip + 1);
            }
            break;
        }
    }

    let str = "для контакта ";
    let ind = 0;
    let lastSkip = skip;
    while (ind !== str.length && ind !== query.length && query[ind] === str[ind]) {
        if (query[ind] === ' ') {
            skip = lastSkip + ind + 1;
        }
        ind++;

    }
    if (ind !== str.length) {
        syntaxError(line, 1 + skip);
    }
    let name = query.slice(str.length);

    if (name.length === 0 || name[name.length - 1] !== ';') {
        syntaxError(line, curQuery.length + 1);
    }
    name = name.slice(0, name.length - 1);
    if (name.length === 0) {
        return
    }
    if (phoneBook.has(name)) {
        for (let phone of phones) {
            if (phoneBook.get(name).phoneSet.has(phone)) {
                phoneBook.get(name).phoneSet.delete(phone);
            }
        }
        let newPhones = []
        for (let phone of phoneBook.get(name).phone) {
            if (phoneBook.get(name).phoneSet.has(phone)) {
                newPhones.push(phone)
            }
        }
        phoneBook.get(name).phone = newPhones;

        for (let mail of mails) {
            if (phoneBook.get(name).mailSet.has(mail)) {
                phoneBook.get(name).mailSet.delete(mail);
            }
        }

        let newMails = []
        for (let mail of phoneBook.get(name).mail) {
            if (phoneBook.get(name).mailSet.has(mail)) {
                newMails.push(mail)
            }
        }
        phoneBook.get(name).mail = newMails;
    }


}

/**
 * Выполнение запроса на языке pbQL
 * @param {string} query
 * @returns {string[]} - строки с результатами запроса
 */
function run(query) {
    if (typeof query !== "string") {
        syntaxError(0, 0);
    }
    let index = 0
    let last = 0
    let result = []
    while (last !== query.length) {
        TIME++;
        line++;
        index = query.indexOf(";", last);
        let curQuery;
        if (index === -1) {
            curQuery = query.slice(last, query.length);
            index = query.length;
        } else {
            curQuery = query.slice(last, index + 1);
        }
        last = index + 1;

        if (curQuery.startsWith("Создай контакт ")) {
            addContact(curQuery);
        } else if (curQuery.startsWith("Удали контакт ")) {
            deleteContact(curQuery);
        } else if (curQuery.startsWith("Добавь ")) {
            addPhoneOrMail(curQuery);
        } else if (curQuery.startsWith("Покажи ")) {
            result = result.concat(showContact(curQuery));
        } else if (curQuery.startsWith("Удали контакты, где есть ")) {
            deleteContacts(curQuery);
        } else if (curQuery.startsWith("Удали ")) {
            deleteInfoForContact(curQuery);
        } else {
            if (curQuery === "Создай контакт;") {
                syntaxError(line, "Создай контакт;".length);
            } else if (curQuery === "Создай;") {
                syntaxError(line, "Создай;".length);
            } else if (curQuery === "Покажи;") {
                syntaxError(line, "Покажи;".length);
            } else if (curQuery === "Добавь;") {
                syntaxError(line, "Добавь;".length);
            } else if (curQuery === "Удали контакты, где есть;") {
                syntaxError(line, "Удали контакты, где есть;".length);
            } else if (curQuery === "Удали контакты, где;") {
                syntaxError(line, "Удали контакты, где;".length);
            } else if (curQuery === "Удали контакты;") {
                syntaxError(line, "Удали контакты;".length);
            } else if (curQuery === "Удали;") {
                syntaxError(line, "Удали;".length);
            }

            if (curQuery.startsWith("Создай ")) {
                syntaxError(line, "Создай ".length + 1);
            } else if (curQuery.startsWith("Удали контакты, где ")) {
                syntaxError(line, "Удали контакты, где ".length + 1);
            } else if (curQuery.startsWith("Удали контакты, ")) {
                syntaxError(line, "Удали контакты, ".length + 1);
            } else if (curQuery.startsWith("Удали ")) {
                syntaxError(line, "Удали ".length + 1);
            }
            syntaxError(line, 1);
        }
    }

    return result;
}

console.log(run("Удали для контакта <имя>;"))
module.exports = { phoneBook, run };