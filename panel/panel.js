
'use strict';

const Fs = require('fs');
const FFs = require('fire-fs');
const Path = require('path');
const cp = require('child_process');

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
            input: "",
            items: [],
            ignore: null,
            type: ['sprite-frame'],
        },
        watch: {
            resources() {
                this.refresh();
            },
        },
        methods: {

            refresh() {
                let adb = Editor.assetdb;
                let customIgnore = this.splitInput(this.input);

                this.items.length = 0;
                this.items = [];

                let callback = (objs, results) => {
                    objs.forEach(
                        (obj) => {
                            if (this.ignore.prefab.indexOf(obj.url) != -1) {
                                console.log('Creator\'s prefab.');
                                return;
                            }

                            let text = FFs.readFileSync(obj.path, 'utf-8');
                            results.forEach(function (result) {
                                if (result.url.indexOf('/default_') !== -1) {
                                    result.contain = true;
                                    return;
                                }

                                for (let i = 0; i < customIgnore.length; i++) {
                                    if (result.url.indexOf(customIgnore[i]) !== -1) {
                                        result.contain = true;
                                        return;
                                    }
                                }

                                if (
                                    this.resources &&
                                    result.url.indexOf('db://assets/resources') !== -1
                                ) {
                                    result.contain = true;
                                    return;
                                }

                                if (
                                    (typeof text) === 'string' &&
                                    this.searchBf(text, result.url)
                                ) {
                                    result.contain = true;
                                    return;
                                }

                                if (
                                    text['__type__'] === 'cc.AnimationClip' &&
                                    this.searchClip(text, result.uuid)
                                ) {
                                    result.contain = true;
                                    return;
                                }


                                result.contain =
                                    result.contain ?
                                        true :
                                        this.search(text, result.uuid);
                            });
                        });

                    results.forEach(function (result) {
                        result.contain == true ? '' : this.items.push({
                            url: result.url,
                            uuid: result.uuid
                        });
                    });
                };

                adb.queryAssets(
                    null,
                    ['scene', 'prefab', 'animation-clip', 'bitmap-font'],
                    function (err, objs) {
                        adb.queryAssets(
                            null,
                            this.type,
                            function (err, results) {
                                callback(objs, results);
                            }
                        );
                    }
                );
            },

            /** 
             * Recursive
             * @argument {JSON | Array}     json
             * @argument {String}           uuid
             */
            search(json, uuid) {

                if (json instanceof Array) {
                    for (let i = 0; i < json.length; i++) {
                        if (this.search(json[i], uuid)) {
                            return true;
                        }
                    }
                }
                else if (json instanceof Object) {
                    if (json['__type__'] === 'cc.Sprite' && json._spriteFrame) {
                        return json._spriteFrame.__uuid__ == uuid;
                    }
                    else if (json['__type__'] === 'cc.Button') {
                        return this.searchButton(json, uuid);
                    }
                    else if (json['__type__'] && json['__type__'].length > 20) {
                        if (Editor.Utils.UuidUtils.isUuid(
                            Editor.Utils.UuidUtils.decompressUuid(json['__type__'])
                        )) {
                            return this.searchScript(json, uuid);
                        }
                    }
                }
            },

            searchButton(json, uuid) {
                return (json.pressedSprite && json.pressedSprite.__uuid__ == uuid) ||
                    (json.hoverSprite && json.hoverSprite.__uuid__ == uuid) ||
                    (json._N$normalSprite && json._N$normalSprite.__uuid__ == uuid) ||
                    (json._N$disabledSprite && json._N$disabledSprite.__uuid__ == uuid);
            },

            /** 
             * Recursive
             * 
             * Search for the script (cc.Class) in the scene file (.fire).
             * 
             * @argument {JSON}     json    cc.Class
             * @argument {String}   uuid    target.uuid
             */
            searchScript(json, uuid) {
                let result = [];

                for (let i in json) {
                    if (json[i] && json[i].__uuid__ && json[i].__uuid__ == uuid) {
                        return true;
                    }
                }

                return false;
            },

            /** 
             * Recursive
             * 
             * Search for the animation clip (cc.Animation).
             * 
             * @argument {JSON}     json    cc.Animation
             * @argument {String}   uuid    target.uuid
             */
            searchClip(json, uuid) {

                let spriteFrame = [];
                let paths = this.getValue(json, 'paths');
                if (paths) {
                    for (let i in paths) {
                        spriteFrame = this.getValue(paths[i], 'spriteFrame');
                        if (spriteFrame) {
                            for (let i = 0; i < spriteFrame.length; i++) {
                                if (spriteFrame[i] && spriteFrame[i].value && spriteFrame[i].value.__uuid__ && spriteFrame[i].value.__uuid__ === uuid) {
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
                            if (spriteFrame[i].value && spriteFrame[i].value.__uuid__ === uuid) {
                                return true;
                            }
                        }
                    }
                }

                return false;
            },

            searchBf(str, url) {
                let start = url.lastIndexOf('/') + 1;
                let textureName = url.slice(start, url.length);

                if (str.indexOf(textureName) == -1) {
                    return false;
                }

                return true;
            },

            /**
             * ..
             * @param {JSON} json 
             * @param {String} key  
             * @param {Boolean} pan 泛查询开关，因为这样叫比较酷
             */
            getValue(json, key, pan) {
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

            /**
             * 
             * @param {String} str 
             */
            splitInput(str) {
                if (!str) {
                    return [];
                }
                return str.split(',');
            },

            goHub() {
                cp.exec('start https://github.com/shpz/CreatorClean/blob/master/README.MD');
            },

            deleteRes(url, items) {

                let adb = Editor.assetdb;
                if (url.length > 1) {
                    this.refresh();
                }
                else {
                    let index = items.findIndex(function (item, index, array) {
                        return this.getPicUrl(item.url) == url[0];
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