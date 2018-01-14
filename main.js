'use strict';

exports.load = function () {

};

exports.unload = function () {

};

exports.messages = {
    open () {
        Editor.Panel.open('clean');
        Editor.Metrics.trackEvent({
            category: 'Packages',
            label: 'clean',
            action: 'Panel Open'
        }, null);
    }
};