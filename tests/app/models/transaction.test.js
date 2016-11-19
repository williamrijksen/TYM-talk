import assert from 'assert';
import sinon from 'sinon';
import {
  getModel,
  getCollection,
} from '../../testutils';

const getTransactionModel = () => (getModel('transaction')),
  getTransactionCollection = () => (getCollection('transaction'));

describe('transaction model', () => {
  describe('validate', () => {
    it('no attr is empty', () => {
      const invalidCallback = sinon.spy(),
        Model = getTransactionModel(),
        model = new Model();
      model.bind('invalid', invalidCallback);
      model.save({
        name: ''
      });
      assert.equal(invalidCallback.calledOnce, true);
      sinon.assert.calledWith(
        invalidCallback,
        model,
        [ { name: 'name', message: 'Please fill name field.' },
          { name: 'iban', message: 'Please fill iban field.' },
          { name: 'amount', message: 'Missing amount' },
          { name: 'description',
            message: 'Please fill description field.' } ]
      );
    });

    it('amount may not be 0', () => {
      const invalidCallback = sinon.spy(),
        Model = getTransactionModel(),
        model = new Model();
      model.bind('invalid', invalidCallback);
      model.save({
        name: 'Test payment',
        iban: 'BE68539007547034',
        amount: 0,
        description: 'Test',
      });
      assert.equal(invalidCallback.calledOnce, true);
      sinon.assert.calledWith(
        invalidCallback,
        model,
        [ { name: 'amount', message: 'Amount may not be 0' } ]
      );
    });

    it('amount may not be a string', () => {
      const invalidCallback = sinon.spy(),
        Model = getTransactionModel(),
        model = new Model();
      model.bind('invalid', invalidCallback);
      model.save({
        name: 'Test payment',
        iban: 'BE68539007547034',
        amount: '10',
        description: 'Test',
      });
      assert.equal(invalidCallback.calledOnce, true);
      sinon.assert.calledWith(
        invalidCallback,
        model,
        [ { name: 'amount', message: 'Amount must be a number' } ]
      );
    });
  });

  describe('validates iban on save', () => {
    it('triggers invalid event for wrong iban', () => {
      const successCallback = sinon.spy(),
        invalidCallback = sinon.spy(),
        Model = getTransactionModel(),
        model = new Model();

      model.bind('invalid', invalidCallback);
      model.bind('sync', successCallback);
      model.save({
        name: 'Test payment',
        iban: 'IBAN',
        amount: 100,
        description: 'Payment for Maikel',
      });

      assert.equal(successCallback.called, false);
      assert.equal(invalidCallback.calledOnce, true);
      sinon.assert.calledWith(
        invalidCallback,
        model,
        [{
          name: 'iban',
          message: 'Given iban invalid.',
        }],
        {validate: true}
      );
    });

    it('triggers success event for correct transaction', () => {
      const successCallback = sinon.spy(),
        invalidCallback = sinon.spy(),
        Model = getTransactionModel(),
        model = new Model();

      model.bind('sync', successCallback);
      model.bind('invalid', invalidCallback);
      model.save({
        name: 'Test payment',
        iban: 'BE68539007547034',
        amount: -100,
        description: 'Payment for Maikel',
      });

      assert.equal(successCallback.calledOnce, true);
      sinon.assert.calledWith(
        successCallback,
        model
      );
    });
  });

  describe('transforms with the right output', () => {
    var Model = getTransactionModel(),
      created = 1479547171869, // Saturday, November 19, 2016 10:19 AM
      model = new Model({
        name: 'Test payment',
        iban: 'BE68539007547034',
        amount: -100,
        description: 'Payment for Maikel',
        created
      });

    assert.equal(model.transform().ibanCaps, 'BE68 5390 0754 7034');
    assert.equal(model.transform().name, 'Test payment');
    assert.equal(model.transform().amountString, '€ -1,00');
    assert.equal(model.transform().description, 'Payment for Maikel');
    assert.equal(model.transform().createdFormatted, 'Saturday, November 19, 2016 10:19 AM');
  });
});

describe('transaction collection', () => {
  it('getBalance is 0 with zero transactions', () => {
    const Collection = getTransactionCollection(),
      collection = new Collection();
    assert.equal(collection.getBalance(), 0);
  });

  it('getBalance is -100 with one depreciation of 1 euro', () => {
    const Collection = getTransactionCollection(),
      collection = new Collection([{
        name: 'Test payment',
        iban: 'BE68539007547034',
        amount: -100,
        description: 'Payment for Maikel',
      }]);
    assert.equal(collection.getBalance(), -100);
  });

  it('getBalance is 100 with a salary of 1 euro', () => {
    const Collection = getTransactionCollection(),
      collection = new Collection([{
        name: 'My boss',
        iban: 'BE68539007547035',
        amount: 100,
        description: 'Thanks for your effort!',
      }]);
    assert.equal(collection.getBalance(), 100);
  });

  it('getBalance is 500 with a salary of 10 euros and one with one depreciation of 5 euros', () => {
    const Collection = getTransactionCollection(),
      collection = new Collection([{
        name: 'My boss',
        iban: 'BE68539007547035',
        amount: 1000,
        description: 'Thanks for your effort!',
      }, {
        name: 'Test payment',
        iban: 'BE68539007547034',
        amount: -500,
        description: 'Payment for Maikel',
      }]);
    assert.equal(collection.getBalance(), 500);
  });


  it('transform returns stringified keys', () => {
    const Collection = getTransactionCollection(),
      collection = new Collection([{
        name: 'My boss',
        iban: 'BE68539007547035',
        amount: 1000,
        description: 'Thanks for your effort!',
      }, {
        name: 'Test payment',
        iban: 'BE68539007547034',
        amount: -500,
        description: 'Payment for Maikel',
      }]);
    assert.deepEqual(collection.transform(), {
      balance: '€ 5,00',
      count: 2,
    });
  });

  it('clear removes all transactions', () => {
    const Collection = getTransactionCollection(),
      collection = new Collection([{
        name: 'My boss',
        iban: 'BE68539007547035',
        amount: 1000,
        description: 'Thanks for your effort!',
      }, {
        name: 'Test payment',
        iban: 'BE68539007547034',
        amount: -500,
        description: 'Payment for Maikel',
      }]);
    collection.clear();
    assert.equal(collection.length, 0);
  });
});
