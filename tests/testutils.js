import backbone from 'backbone';
import proxyquire from 'proxyquire';
import underscore from 'underscore';
import moment from 'moment';
import iban from '../app/vendor/iban';

proxyquire.noCallThru();
const getModule = name => (proxyquire(`../app/models/${name}`,
    {
        'alloy/underscore': underscore,
        'alloy/moment': moment,
        iban,
    })
  ),
    getModel = name => (
    getModule(name).definition.extendModel(backbone.Model.extend({
        sync: function sync(method, model, options) {
            const self = this;
            options.success(self, self.toJSON(), options);
            model.trigger('sync', model, self.toJSON(), options);
        },
    }))
  ),
    getCollection = name => (
    getModule(name).definition.extendCollection(backbone.Collection.extend({
        model: getModel(name),
    }))
  );

export {
  getModel,
  getCollection,
};
