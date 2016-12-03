/* eslint-disable no-unused-vars */
function addTransation() {
    'use strict';

    Alloy.createController('scan', {
        listConnection: $.listConnection
    }).getView().open();
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
