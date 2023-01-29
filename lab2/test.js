const pbql = require("./hello.js");
const text = require("./text.js");

const deepEquals = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const shuffle = (a) => [...a].sort(() => Math.random() - 0.5);

class RunError extends Error {
    constructor(message, original, query) {
        super(message);
        this.name = "RunError";
        this.original = original;
        this.query = query;
    }

    toString() {
        return `${this.name}: ${this.message} in query '${this.query}'`;
    }
}

class PGQLTests {
    run(query) {
        try {
            pbql.phoneBook.clear();
            return pbql.run(query);
        } catch (e) {
            throw new RunError(e.message, e, query);
        }
    }

    fail(reason, query) {
        console.log(text.BgRed + " FAIL " + text.Reset);
        console.log("  " + reason);
        console.log("===========")
        console.log("Database:", pbql.phoneBook);
        console.log("======")
        console.log("Query:");
        console.log("======")
        console.log(query.replace(/;/g, ";\n"));
        console.log("============")
        this.failed = true;
    }

    expectRunToBe(query, expected) {
        const result = this.run(query);
        if (!deepEquals(result, expected)) {
            this.fail("Expected " + JSON.stringify(expected) + " but got " + JSON.stringify(result), query);
        }
    }

    expectParsingError(query, lineNumber, charNumber) {
        let result = null;
        try {
            result = this.run(query);
        } catch (e) {
            const match = /SyntaxError: Unexpected token at (\d+):(\d+)/.exec(e.message);
            if (!match) {
                this.fail("Expected syntax error but got " + e.message, query);
            }
            if (lineNumber && lineNumber !== parseInt(match[1])) {
                this.fail("Expected syntax error at line " + lineNumber + " but got " + match[1], query);
            }
            if (charNumber && charNumber !== parseInt(match[2])) {
                this.fail("Expected syntax error at char " + charNumber + " but got " + match[2], query);
            }
            // console.log(e);
            return;
        }
        throw new Error(
            `Expected parsing error on query ${query} but got ${result}`
        );
    }

    testParsingError() {
        this.expectParsingError("Привет;");
        this.expectParsingError("Покажи что нибудь;");
        this.expectParsingError("Покажи имя для контактов, где есть ий");
        this.expectParsingError("покажи имя для контактов, где есть Гр;");
        this.expectParsingError("Покжи имя для контактов, где есть Гр;");
        this.expectParsingError("Покажи  имя для контактов, где есть Гр;");
        this.expectParsingError("Удали телефон 55566677 для контакта Григорий;");
        this.expectParsingError("Покажи имя для контактов, где есть Гр");
    }

    testEmptyGetNameOnFresh() {
        this.expectRunToBe("Покажи имя для контактов, где есть ий;", []);
    }

    testGetNames() {
        this.expectRunToBe(
            "Создай контакт Григорий;" +
            "Создай контакт Василий;" +
            "Создай контакт Иннокентий;" +
            "Покажи имя для контактов, где есть ий;",
            ["Григорий", "Василий", "Иннокентий"]
        );
    }

    testGetNamesWithNoResult() {
        this.expectRunToBe(
            "Создай контакт Григорий;" +
            "Создай контакт Василий;" +
            "Создай контакт Иннокентий;" +
            "Покажи имя для контактов, где есть бий;",
            []
        );
    }

    testGetWithMultipleSameField() {
        this.expectRunToBe(
            "Создай контакт Григорий;" +
            "Создай контакт Василий;" +
            "Создай контакт Иннокентий;" +
            "Покажи имя и имя и имя для контактов, где есть ий;",
            [
                "Григорий;Григорий;Григорий",
                "Василий;Василий;Василий",
                "Иннокентий;Иннокентий;Иннокентий",
            ]
        );
    }

    testMultipleQueries() {
        this.expectRunToBe(
            "Создай контакт Григорий;" +
            "Создай контакт Василий;" +
            "Создай контакт Иннокентий;" +
            "Покажи имя для контактов, где есть ий;" +
            "Покажи имя для контактов, где есть бий;",
            ["Григорий", "Василий", "Иннокентий"]
        );
        this.expectRunToBe(
            "Создай контакт Григорий;" +
            "Покажи имя для контактов, где есть ий;" +
            "Покажи имя для контактов, где есть ий;",
            ["Григорий", "Григорий"]
        );
    }

    testCreateDelete() {
        this.expectRunToBe(
            "Создай контакт Григорий;" +
            "Создай контакт Василий;" +
            "Создай контакт Иннокентий;" +
            "Удали контакт Василий;" +
            "Покажи имя для контактов, где есть ий;",
            ["Григорий", "Иннокентий"]
        );
        this.expectRunToBe(
            "Создай контакт Григорий;" +
            "Удали контакт Григорий;" +
            "Покажи имя для контактов, где есть ий;",
            []
        );
    }

    testAddPhone() {
        this.expectRunToBe(
            "Создай контакт Григорий;" +
            "Добавь телефон 1234567890 для контакта Григорий;" +
            "Покажи телефоны для контактов, где есть ий;",
            ["+7 (123) 456-78-90"]
        );
    }

    testBadPhone() {
        this.expectParsingError("Добавь телефон абоба для контакта Григорий;");
        this.expectParsingError("Добавь телефон 123456789 для контакта Григорий;");
        this.expectParsingError(
            "Добавь телефон +1234567890 для контакта Григорий;"
        );
    }

    testAddEmail() {
        this.expectRunToBe(
            "Создай контакт Григорий;" +
            "Добавь телефон 5556667787 для контакта Григорий;" +
            "Добавь телефон 5556667788 и почту grisha@example.com для контакта Григорий;" +
            "Покажи имя и телефоны и почты для контактов, где есть ий;",
            ["Григорий;+7 (555) 666-77-87,+7 (555) 666-77-88;grisha@example.com"]
        );
    }

    testRemovePhone() {
        this.expectRunToBe(
            "Создай контакт Григорий;" +
            "Добавь телефон 5556667788 для контакта Григорий;" +
            "Удали телефон 5556667788 для контакта Григорий;" +
            "Покажи имя и телефоны для контактов, где есть ий;",
            ["Григорий;"]
        );
    }

    testNameWithSpaces() {
        this.expectRunToBe(
            "Создай контакт Григорий Петров;" +
            "Покажи имя и имя для контактов, где есть ий;",
            ["Григорий Петров;Григорий Петров"]
        );
    }

    testCreateAccountTwice() {
        this.expectRunToBe(
            "Создай контакт Григорий;" +
            "Создай контакт Григорий;" +
            "Покажи имя для контактов, где есть ий;",
            ["Григорий"]
        );
    }

    testRemovePhoneForNonExistantAccount() {
        this.expectRunToBe(
            "Удали телефон 5556667788 для контакта Григорий;" +
            "Покажи имя и телефоны для контактов, где есть ий;",
            []
        );
    }

    testDeleteByEmptyWildcard() {
        this.expectRunToBe(
            "Создай контакт Григорий;" +
            "Добавь телефон 5556667788 для контакта Григорий;" +
            "Удали контакты, где есть ;" +
            "Покажи имя и телефоны для контактов, где есть ий;",
            ["Григорий;+7 (555) 666-77-88"]
        );
    }

    testGetEmptyWildcard() {
        this.expectRunToBe(
            "Создай контакт Григорий;" +
            "Добавь телефон 5556667788 для контакта Григорий;" +
            "Покажи имя и телефоны для контактов, где есть ;",
            []
        );
    }

    testAddPhoneForEmptyContact() {
        this.expectRunToBe(
            "Создай контакт Григорий;" +
            "Добавь телефон 5556667788 для контакта ;" +
            "Покажи имя и телефоны для контактов, где есть ий;",
            ["Григорий;"]
        );
    }

    testEmptyContact() {
        this.expectRunToBe(
            "Создай контакт ;" +
            "Покажи имя и имя для контактов, где есть ;",
            []
        );
    }

    testAbstractSyntax() {
        this.expectParsingError(
            "Создай контакт Григорий;" +
            "Добавь телефон 5556667788 для контакта Григорий;" +
            "Добавь телефон 5556667789 и почту"
        );
        this.expectRunToBe("Добавь для контакта Григорий;", []);
        this.expectRunToBe("Удали для контакта Григорий;", []);
        this.expectRunToBe("Покажи для контактов, где есть чтоугодно;", []);
    }

    testFirstAddThenFetch() {
        this.expectRunToBe(
            "Добавь телефон 5556667788 для контакта Григорий;" +
            "Создай контакт Григорий;" +
            "Покажи имя и телефоны для контактов, где есть ий;",
            ["Григорий;"]
        );
    }

    testRemoveNonExistantAccount() {
        this.expectRunToBe(
            "Удали контакт Григорий;" +
            "Покажи имя для контактов, где есть ий;",
            []
        );
        this.expectRunToBe(
            "Создай контакт Григорий;" +
            "Удали контакт Миша;" +
            "Покажи имя для контактов, где есть ий;",
            ["Григорий"]
        )
    }

    testAddMultiplePhones() {
        this.expectRunToBe(
            "Создай контакт Григорий;" +
            "Добавь телефон 5556667788 и телефон 1112223344 для контакта Григорий;" +
            "Покажи имя и телефоны для контактов, где есть ий;",
            ["Григорий;+7 (555) 666-77-88,+7 (111) 222-33-44"]
        );
    }

    testEmailField() {
        const createEmailQuery = (mail) => "Создай контакт Григорий;" +
            `Добавь почту ${mail} для контакта Григорий;` +
            "Покажи имя и почты для контактов, где есть ий;"
        this.expectRunToBe(
            createEmailQuery("абв@где.рф"),
            ["Григорий;абв@где.рф"]
        );
        this.expectParsingError(
            createEmailQuery("абв@г де")
        );
        this.expectRunToBe(
            createEmailQuery("1337@h4x0r"),
            ["Григорий;1337@h4x0r"]
        );
    }

    testCreateRandomOrderReturnsOrderInCreation() {
        const names = ["Григорийа", "Мишаа", "Васяа", "Петяа", "Коляа", "Сашаа"];
        const phones = ["5556667788", "1112223344", "7778889900", "3334445566", "9990001122", "5556667788"];
        const formatPhone = (phone) => "+7 (" + phone.slice(0, 3) + ") " + phone.slice(3, 6) + "-" + phone.slice(6, 8) + "-" + phone.slice(8, 10);
        for(let i = 0; i < 10; i++) {
            shuffle(names);
            shuffle(phones);
            const query = names.map((name, index) => `Создай контакт ${name};` +
                `Добавь телефон ${phones[index]} для контакта ${name};`).join("");
            this.expectRunToBe(
                query + "Покажи имя и телефоны для контактов, где есть а;",
                names.map((name, index) => `${name};${formatPhone(phones[index])}`)
            );
        }
    }

    testQuerySpaces() {
        this.expectRunToBe(
            "Создай контакт     ;" +
            "Добавь телефон 5556667788 для контакта     ;" +
            "Покажи имя и телефоны для контактов, где есть  ;",
            ["    ;+7 (555) 666-77-88"]
        );
    }

    testSamePhoneSameAccount() {
        this.expectRunToBe(
            "Создай контакт Григорий;" +
            "Добавь телефон 5556667788 для контакта Григорий;" +
            "Добавь телефон 5556667788 для контакта Григорий;" +
            "Добавь телефон 5556667788 для контакта Григорий;" +
            "Покажи имя и телефоны для контактов, где есть ий;",
            ["Григорий;+7 (555) 666-77-88"]
        );
    }

    testSamePhoneDifferentAccount() {
        this.expectRunToBe(
            "Создай контакт Григорий;" +
            "Добавь телефон 5556667788 для контакта Григорий;" +
            "Создай контакт Миша;" +
            "Добавь телефон 5556667788 для контакта Миша;" +
            "Покажи имя и телефоны для контактов, где есть и;",
            ["Григорий;+7 (555) 666-77-88", "Миша;+7 (555) 666-77-88"]
        );
    }

    testNoMatchForWildcard() {
        this.expectRunToBe(
            "Создай контакт Григорий;" +
            "Добавь телефон 5556667788 для контакта Григорий;" +
            "Покажи имя и телефоны для контактов, где есть ничего;",
            []
        );
    }

    testSpaceInPhone() {
        this.expectParsingError(
            "Создай контакт Григорий;" +
            "Добавь телефон 555 666 77 88 для контакта Григорий;" +
            "Покажи имя и телефоны для контактов, где есть и;"
        );
    }

    testSameEmailSameAccount() {
        this.expectRunToBe(
            "Создай контакт Григорий;" +
            "Добавь почту 1337@h4x0r для контакта Григорий;" +
            "Добавь почту 1337@h4x0r для контакта Григорий;" +
            "Добавь почту 1337@h4x0r для контакта Григорий;" +
            "Покажи имя и почты для контактов, где есть г;",
            ["Григорий;1337@h4x0r"]
        );
    }

    testSearchByMultipleFields() {
        this.expectRunToBe(
            "Создай контакт Григорий;" +
            "Добавь телефон 5556667788 для контакта Григорий;" +
            "Добавь почту aaa для контакта Григорий;" +
            "Создай контакт Миша;" +
            "Добавь телефон 1112223344 для контакта Миша;" +
            "Добавь почту bbb для контакта Миша;" +
            "Покажи имя для контактов, где есть 1;" +
            "Покажи имя и имя для контактов, где есть 5;" +
            "Покажи имя и имя и имя для контактов, где есть b;" +
            "Покажи имя и имя и имя и имя для контактов, где есть a;",
            ["Миша", "Григорий;Григорий", "Миша;Миша;Миша", "Григорий;Григорий;Григорий;Григорий"]
        );
    }

    testSearchByMultipleFieldsWithNoMatch() {
        this.expectRunToBe(
            "Создай контакт Григорий;" +
            "Добавь телефон 5556667788 для контакта Григорий;" +
            "Добавь почту aaa для контакта Григорий;" +
            "Создай контакт Миша;" +
            "Добавь телефон 1112223344 для контакта Миша;" +
            "Добавь почту bbb для контакта Миша;" +
            "Покажи имя для контактов, где есть c;",
            []
        );
    }

    testDeleteByWildcard() {
        this.expectRunToBe(
            "Создай контакт Григорий;" +
            "Добавь телефон 5556667788 для контакта Григорий;" +
            "Добавь почту aaa для контакта Григорий;" +
            "Удали контакты, где есть 5;" +
            "Покажи имя для контактов, где есть 5;",
            []
        ); // phone
        this.expectRunToBe(
            "Создай контакт Григорий;" +
            "Добавь телефон 5556667788 для контакта Григорий;" +
            "Добавь почту aaa для контакта Григорий;" +
            "Удали контакты, где есть a;" +
            "Покажи имя для контактов, где есть a;",
            []
        ); // email
        this.expectRunToBe(
            "Создай контакт Григорий;" +
            "Добавь телефон 5556667788 для контакта Григорий;" +
            "Добавь почту aaa для контакта Григорий;" +
            "Удали контакты, где есть о;" +
            "Покажи имя для контактов, где есть о;",
            []
        ); // name
    }

    runTest(name) {
        this.failed = false;
        console.log(text.BgYellow + " Running " + name + " " + text.Reset);
        this[name]();
        if (!this.failed) {
            console.log(text.BgGreen + " OK " + text.Reset);
        }
    }

    runAllTests() {
        let someFailed = false;
        for (let name of Object.getOwnPropertyNames(Object.getPrototypeOf(this))) {
            if (name.startsWith("test")) {
                this.runTest(name);
                if(this.failed) {
                    someFailed = true;
                }
            }
        }
        if(someFailed) {
            console.log(text.BgRed + " Some tests failed " + text.Reset);
        } else {
            console.log(text.BgGreen + " All tests passed " + text.Reset);
        }
    }
}

let tests = new PGQLTests();
tests.runAllTests();