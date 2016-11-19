/* eslint-disable no-unused-vars */
function addTransation() {
    'use strict';

    $.listConnection.create({
        name: 'Test payment',
        iban: 'BE68539007547034',
        amount: -100,
        description: 'Payment for Maikel'
    });
}

function getSalary() {
    'use strict';

    $.listConnection.create({
        name: 'Salary',
        iban: 'NL86INGB0002445588',
        amount: 1000,
        description: 'Salary'
    });
}

function clear() {
    'use strict';

    $.listConnection.clear();
}
/* eslint-enable no-unused-vars */

(function () {
    'use strict';

    $.listConnection.fetch();
    $.index.open();
}());
