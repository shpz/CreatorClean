
'use strict';

const Fs = require('fs');
const FFs = require('fire-fs');
const Path = require('path');

var PATH = {
    html: Editor.url('packages://Clean/panel/panel.html'),
    style: Editor.url('packages://Clean/panel/less.css'),
    ignore: Editor.url('packages://Clean/panel/ignore.json')
};

var createVM = function (elem) {
    return new Vue({
        el: elem,
        data: {
            items: [],
            ignore: null,
        },
        watch: {

        },
        methods: {

            refresh() {
                let adb = Editor.assetdb;
                let self = this;

                this.items.length = 0;
                this.items = [];

                let callback = function (objs, results) {
                    objs.forEach(function (obj) {
                        if (self.ignore.prefab.indexOf(obj.url) != -1) {
                            return;
                        }
                        var json = FFs.readJsonSync(obj.path);

                        results.forEach(function (result) {
                            if (result.url.indexOf('default_') != -1 || result.url.indexOf('anim') != -1 || result.url.indexOf('Anim') != -1 || result.url.indexOf('atlas') != -1 || result.url.indexOf('Poker') != -1) {
                                result.contain = true;
                                return;
                            }
                            result.contain = result.contain ? true : self.search(json, result.uuid);
                        });
                    });

                    results.forEach(function (result) {
                        result.contain == true ? '' : self.items.push({
                            url: result.url,
                            uuid: result.uuid
                        });
                    });
                };

                adb.queryAssets(null, ['scene', 'prefab'], function (err, objs) {
                    adb.queryAssets(
                        null,
                        'sprite-frame',
                        function (err, results) {
                            callback(objs, results);
                        }
                    );
                });
            },

            /** 
             * Recursive
             * @argument {JSON | Array}     json
             * @argument {String}           uuid
             */
            search(json, uuid) {
                let self = this;

                if (json instanceof Array) {
                    for (let i = 0; i < json.length; i++) {
                        if (self.search(json[i], uuid)) {
                            return true;
                        }
                    }
                }
                else if (json instanceof Object) {
                    if (json['__type__'] == 'cc.Sprite' && json._spriteFrame) {
                        return json._spriteFrame.__uuid__ == uuid;
                    }
                }
            },

            searchClip(json, uuid) {
                let self = this;
                let sf = [];
                this.getSpriteFrame(json, 'spriteFrame', sf);
                for (let i = 0; i < sf.length; i++) {
                    if (sf[i].value.__uuid__ == true) {
                        return true;
                    }
                }
                return false;
            },

            getSpriteFrame(json, key, sf) {
                if (json && typeof json == 'object') {
                    for (let i in json) {
                        if (i == key) {
                            sf = json[key];
                            return;
                        }
                        else {
                            this.getSpriteFrame(json[i], key, sf);
                        }
                    }
                }
            },

            jumpRes(uuid) {
                Editor.Ipc.sendToAll('assets:hint', uuid);
            },

            onDeleteClick(url) {
                let picUrl = this.getPicUrl(url);
                this.deleteRes([picUrl], this.items);
            },

            onDeleteAllClick() {
                let urlArr = [];
                for (let i = 0; i < this.items.length; i++) {
                    let picUrl = this.getPicUrl(this.items[i].url);
                    Editor.assetdb.remote.exists(picUrl) ? urlArr.push(picUrl) : '';
                }
                this.deleteRes(urlArr, this.items);
                Editor.log("删除全部成功！");
            },

            getPicUrl(url) {
                let adb = Editor.assetdb;
                let meta = adb.remote.loadMeta(url);
                let picUrl = adb.remote.uuidToUrl(meta.rawTextureUuid);
                return picUrl;
            },

            deleteRes(url, items) {
                let self = this;
                let adb = Editor.assetdb;
                adb.delete(url);
                if (url.length > 1) {
                    items.length = 0;
                    items = [];
                    console.log("isArr");
                }
                else {
                    items.splice(items.findIndex(function (item, index, array) {
                        return self.getPicUrl(item.url) == url[0];
                    }), 1);
                }
                // this.refresh();
            },
        }
    });
};

Editor.Panel.extend({
    template: Fs.readFileSync(PATH.html, 'utf-8'),
    style: Fs.readFileSync(PATH.style, 'utf-8'),

    $: {
        'warp': '#warp'
    },

    ready() {
        this.vm = createVM(this.$warp);
        this.vm.ignore = FFs.readJsonSync(PATH.ignore);
        this.vm.refresh();
    },

    // ipc
    messages: {
        'scene:ready'() {
        }
    }
});
