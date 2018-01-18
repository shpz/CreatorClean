
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
            resources: true,
            items: [],
            ignore: null,
            type: ['sprite-frame'],
            SpriteFrame: true,
            AnimationClip: false,
        },
        watch: {
            resources() {
                this.refresh();
            },
            SpriteFrame() {
                if (this.SpriteFrame) {
                    this.type.push('sprite-frame');
                }
                else {
                    this.type.splice(this.type.indexOf('sprite-frame'));
                }
                this.refresh();
            },
            // AnimationClip() {
            //     if (this.AnimationClip) {
            //         this.type.push('animation-clip');
            //     }
            //     else {
            //         this.type.splice(this.type.indexOf('animation-clip'));
            //     }
            //     this.refresh();
            // }
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
                            let sf = [];
                            if (json['__type__'] == 'cc.AnimationClip') {
                                if (self.searchClip(json, result.uuid)) {
                                    result.contain = true;
                                    return;
                                }
                            }
                            if (result.url.indexOf('default_') != -1) {
                                result.contain = true;
                                return;
                            }

                            if (self.resources && result.url.indexOf('resources') != -1) {
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

                adb.queryAssets(null, ['scene', 'prefab', 'animation-clip'], function (err, objs) {
                    adb.queryAssets(
                        null,
                        self.type,
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

            /** 
             * Recursive
             * @argument {JSON}     json    JSON.parse(cc.Animation)
             * @argument {String}   uuid    target.uuid
             */
            searchClip(json, uuid) {
                let self = this;
                let spriteFrame = [];
                let paths = this.getValue(json, 'paths');
                if (paths) {
                    for (let i in paths) {
                        spriteFrame = this.getValue(paths[i], 'spriteFrame');
                        if (spriteFrame) {
                            for (let i = 0; i < spriteFrame.length; i++) {
                                if (spriteFrame[i].value.__uuid__ === uuid) {
                                    return true;
                                }
                            }
                        }
                    }
                }
                else {
                    spriteFrame = this.getValue(json, 'spriteFrame');
                    if (spriteFrame) {
                        for (let i = 0; i < spriteFrame.length; i++) {
                            if (spriteFrame[i].value.__uuid__ === uuid) {
                                return true;
                            }
                        }
                    }
                }

                return false;
            },

            compare(json) {

            },

            getValue(json, key) {
                key = key ? key : 'spriteFrame';
                if (typeof json !== 'object') {
                    return null;
                }

                for (let i in json) {
                    if (i === key) {
                        return json[i];
                    }
                    else {
                        let value = this.getValue(json[i], key);
                        if (value) {
                            return value;
                        }
                    }

                }
                return null;
            },

            jumpRes(uuid) {
                Editor.Ipc.sendToAll('assets:hint', uuid);
                Editor.Selection.select('asset', uuid, true);
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
                if (url.length > 1) {
                    this.refresh();
                }
                else {
                    let index = items.findIndex(function (item, index, array) {
                        return self.getPicUrl(item.url) == url[0];
                    });
                    index == -1 ? '' : items.splice(index, 1);
                }
                adb.delete(url);
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