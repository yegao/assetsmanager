var __reflect = this && this.__reflect || function (p, c, t) {
    p.__class__ = c, t ? t.push(c) : t = [c], p.__types__ = p.__types__ ? t.concat(p.__types__) : t;
};
var __extends = this && this.__extends || function __extends(t, e) {
    function r() {
        this.constructor = t;
    }
    for (var i in e)
        e.hasOwnProperty(i) && (t[i] = e[i]);
    r.prototype = e.prototype, t.prototype = new r();
};
var __decorate = this && this.__decorate || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === 'object' && typeof Reflect.decorate === 'function')
        r = Reflect.decorate(decorators, target, key, desc);
    else
        for (var i = decorators.length - 1; i >= 0; i--)
            if (d = decorators[i])
                r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var RES;
(function (RES) {
}(RES || (RES = {})));
var RES;
(function (RES) {
    RES.resourceNameSelector = function (p) {
        return p;
    };
    function getResourceInfo(path) {
        var result = RES.config.config.fileSystem.getFile(path);
        if (!result) {
            path = RES.resourceNameSelector(path);
            result = RES.config.config.fileSystem.getFile(path);
        }
        return result;
    }
    RES.getResourceInfo = getResourceInfo;
    var configItem;
    function setConfigURL(url, root) {
		console.log('​setConfigURL -> setConfigURL')
        var type;
        if (url.indexOf('.json') >= 0) {
            type = 'legacyResourceConfig';
        } else {
            type = 'resourceConfig';
        }
        configItem = {
            type: type,
            root: root,
            url: url,
            name: url
        };
    }
    RES.setConfigURL = setConfigURL;
    var ResourceConfig = function () {
        function ResourceConfig() {
        }
        ResourceConfig.prototype.init = function () {
			console.log('​ResourceConfig.prototype.init -> ResourceConfig.prototype.init')
            if (!this.config) {
                this.config = {
                    alias: {},
                    groups: {},
                    resourceRoot: configItem.root,
                    mergeSelector: null,
                    fileSystem: null,
                    loadGroup: []
                };
            }
            return RES.queue.pushResItem(configItem).catch(function (e) {
                console.log('​ResourceConfig.prototype.init -> RES.queue.pushResItem(configItem).catch')
                if (!RES.isCompatible) {
                    if (!e.__resource_manager_error__) {
                        if (e.error) {
                            console.error(e.error.stack);
                        } else {
                            console.error(e.stack);
                        }
                        e = new RES.ResourceManagerError(1002);
                    }
                }
                RES.host.remove(configItem);
                return Promise.reject(e);
            });
        };
        ResourceConfig.prototype.getGroupByName = function (name) {
            var group = this.config.groups[name];
            var result = [];
            if (!group) {
                return result;
            }
            for (var _i = 0, group_1 = group; _i < group_1.length; _i++) {
                var paramKey = group_1[_i];
                var tempResult = void 0;
                tempResult = RES.config.getResourceWithSubkey(paramKey);
                if (tempResult == null) {
                    continue;
                }
                var r = tempResult.r, key = tempResult.key;
                if (r == null) {
                    throw new RES.ResourceManagerError(2005, key);
                    continue;
                }
                if (result.indexOf(r) == -1) {
                    result.push(r);
                }
            }
            return result;
        };
        ResourceConfig.prototype.__temp__get__type__via__url = function (url_or_alias) {
            var url = this.config.alias[url_or_alias];
            if (!url) {
                url = url_or_alias;
            }
            if (RES.typeSelector) {
                var type = RES.typeSelector(url);
                if (!type) {
                    throw new RES.ResourceManagerError(2004, url);
                }
                return type;
            } else {
                console.warn('RES.mapConfig 并未设置 typeSelector');
                return 'unknown';
            }
        };
        ResourceConfig.prototype.getResourceWithSubkey = function (key) {
            key = this.getKeyByAlias(key);
            var index = key.indexOf('#');
            var subkey = '';
            if (index >= 0) {
                subkey = key.substr(index + 1);
                key = key.substr(0, index);
            }
            var r = this.getResource(key);
            if (!r) {
                return null;
            } else {
                return {
                    r: r,
                    key: key,
                    subkey: subkey
                };
            }
        };
        ResourceConfig.prototype.getKeyByAlias = function (aliasName) {
            if (this.config.alias[aliasName]) {
                return this.config.alias[aliasName];
            } else {
                return aliasName;
            }
        };
        ResourceConfig.prototype.getResource = function (path_or_alias) {
            var path = this.config.alias[path_or_alias];
            if (!path) {
                path = path_or_alias;
            }
            var r = getResourceInfo(path);
            if (!r) {
                return null;
            } else {
                return r;
            }
        };
        ResourceConfig.prototype.createGroup = function (name, keys, override) {
            if (override === void 0) {
                override = false;
            }
            if (!override && this.config.groups[name] || !keys || keys.length == 0) {
                return false;
            }
            var group = [];
            for (var _i = 0, keys_1 = keys; _i < keys_1.length; _i++) {
                var key = keys_1[_i];
                if (this.config.groups[key]) {
                    var groupInfo = this.config.groups[key];
                    group = group.concat(groupInfo);
                } else {
                    group.push(key);
                }
            }
            this.config.groups[name] = group;
            return true;
        };
        ResourceConfig.prototype.addSubkey = function (subkey, name) {
            this.addAlias(subkey, name + '#' + subkey);
        };
        ResourceConfig.prototype.addAlias = function (alias, key) {
            if (this.config.alias[key]) {
                key = this.config.alias[key];
            }
            this.config.alias[alias] = key;
        };
        ResourceConfig.prototype.addResourceData = function (data) {
            if (RES.hasRes(data.name)) {
                return;
            }
            if (!data.type) {
                data.type = this.__temp__get__type__via__url(data.url);
            }
            RES.config.config.fileSystem.addFile(data);
        };
        ResourceConfig.prototype.removeResourceData = function (data) {
            if (!RES.hasRes(data.name)) {
                return;
            }
            RES.config.config.fileSystem.removeFile(data.url);
            if (this.config.alias[data.name]) {
                delete this.config.alias[data.name];
            }
        };
        return ResourceConfig;
    }();
    RES.ResourceConfig = ResourceConfig;
    __reflect(ResourceConfig.prototype, 'RES.ResourceConfig');
}(RES || (RES = {})));
var RES;
(function (RES) {
    var ResourceLoader = function () {
        function ResourceLoader() {
            this.groupTotalDic = {};
            this.numLoadedDic = {};
            this.groupErrorDic = {};
            this.retryTimesDic = {};
            this.maxRetryTimes = 3;
            this.reporterDic = {};
            this.dispatcherDic = {};
            this.failedList = new Array();
            this.loadItemErrorDic = {};
            this.errorDic = {};
            this.itemListPriorityDic = {};
            this.itemLoadDic = {};
            this.promiseHash = {};
            this.lazyLoadList = new Array();
            this.loadingCount = 0;
            this.thread = 4;
        }
        ResourceLoader.prototype.pushResItem = function (resInfo) {
            console.log('​ResourceLoader.prototype.pushResItem -> ResourceLoader.prototype.pushResItem')
            if (this.promiseHash[resInfo.root + resInfo.name]) { // resource/default.res.json
                return this.promiseHash[resInfo.root + resInfo.name];
            }
            else{
                console.log("❌")
            }
            this.lazyLoadList.push(resInfo)
            console.log("🍃 🍃 🍃 🍃 🍃   " + JSON.stringify(this.lazyLoadList) + " ")
            this.itemListPriorityDic[Number.NEGATIVE_INFINITY] = this.lazyLoadList;
            this.updatelistPriority(this.lazyLoadList, Number.NEGATIVE_INFINITY);
            var dispatcher = new egret.EventDispatcher();
            this.dispatcherDic[resInfo.root + resInfo.name] = dispatcher;
            var promise = new Promise(function (resolve, reject) {
                dispatcher.addEventListener('complete', function (e) {
                    resolve(e.data);
                }, null);
                dispatcher.addEventListener('error', function (e) {
                    console.log("出错了")
                    reject(e.data);
                }, null);
            });
            this.promiseHash[resInfo.root + resInfo.name] = promise;
            this.loadNextResource();
            return promise;
        };
        ResourceLoader.prototype.pushResGroup = function (list, groupName, priority, reporter) {
            if (this.promiseHash[groupName]) {
                return this.promiseHash[groupName];
            }
            var total = list.length;
            for (var i = 0; i < total; i++) {
                var resInfo = list[i];
                if (!resInfo.groupNames) {
                    resInfo.groupNames = [];
                }
                resInfo.groupNames.push(groupName);
            }
            this.groupTotalDic[groupName] = list.length;
            this.numLoadedDic[groupName] = 0;
            this.updatelistPriority(list, priority);
            this.reporterDic[groupName] = reporter;
            var dispatcher = new egret.EventDispatcher();
            this.dispatcherDic[groupName] = dispatcher;
            var promise = new Promise(function (resolve, reject) {
                dispatcher.addEventListener('complete', resolve, null);
                dispatcher.addEventListener('error', function (e) {
                    reject(e.data);
                }, null);
            });
            this.promiseHash[groupName] = promise;
            this.loadNextResource();
            return promise;
        };
        ResourceLoader.prototype.updatelistPriority = function (list, priority) {
            if (this.itemListPriorityDic[priority] == undefined) {
                this.itemListPriorityDic[priority] = [];
            }
            for (var _i = 0, list_1 = list; _i < list_1.length; _i++) {
                var item = list_1[_i];
                if (this.itemLoadDic[item.root + item.name] == 1) {
                    continue;
                }
                var oldPriority = this.findPriorityInDic(item);
                if (oldPriority == undefined) {
                    this.itemListPriorityDic[priority].push(item);
                } else {
                    if (oldPriority < priority) {
                        this.itemListPriorityDic[priority].push(item);
                        var index = this.itemListPriorityDic[oldPriority].indexOf(item);
                        this.itemListPriorityDic[oldPriority].splice(index, 1);
                    }
                }
            }
        };
        ResourceLoader.prototype.findPriorityInDic = function (item) {
            for (var priority in this.itemListPriorityDic) {
                if (this.itemListPriorityDic[priority].indexOf(item) > -1)
                    return parseInt(priority);
            }
            return undefined;
        };
        ResourceLoader.prototype.loadNextResource = function () {
			console.log('​⬇️️️️️️️ ⬇️️️️️️️ ⬇️️️️️️️ ⬇️️️️️️️ ⬇️️️️️️️ ⬇️️️️️️️ ⬇️️️️️️️ ⬇️️️️️️️ ⬇️️️️️️️ ⬇️️️️️️️ ⬇️️️️️️️ ⬇️️️️️️️ ⬇️️️️️️️ ⬇️️️️️️️ ⬇️️️️️️️ ⬇️️️️️️️ ⬇️️️️️️️ ⬇️️️️️️️ ⬇️️️️️️️ ⬇️️️️️️️ ⬇️️️️️️️ ⬇️️️️️️️')
            while (this.loadingCount < this.thread) {
                console.log("⭕️ ️⭕️ ️⭕️ ️⭕️ ️⭕️ ️"+this.loadingCount)
                var isload = this.loadSingleResource();
                if (!isload) {
                    break;
                }
            }
        };
        ResourceLoader.prototype.loadSingleResource = function () {
			console.log('​🖕 🖕 🖕 ResourceLoader.prototype.loadSingleResource')
            var _this = this;
            var r = this.getOneResourceInfoInGroup();
            if (!r)
                return false;
            this.itemLoadDic[r.root + r.name] = 1;
            this.loadingCount++;
            console.log(JSON.stringify(r))
            this.loadResource(r).then(function (response) {
                console.log("✅ ✅ ✅ ")
                _this.loadingCount--;
                delete _this.itemLoadDic[r.root + r.name];
                RES.host.save(r, response);
                if (_this.promiseHash[r.root + r.name]) {
                    var dispatcher = _this.deleteDispatcher(r.root + r.name);
                    dispatcher.dispatchEventWith('complete', false, response);
                }
                var groupNames = r.groupNames;
                if (groupNames) {
                    delete r.groupNames;
                    for (var _i = 0, groupNames_1 = groupNames; _i < groupNames_1.length; _i++) {
                        var groupName = groupNames_1[_i];
                        if (_this.setGroupProgress(groupName, r)) {
                            _this.loadGroupEnd(groupName);
                        }
                    }
                }
                _this.loadNextResource();
            }).catch(function (error) {
                console.log("❎ ❎ ❎ ")
                if (!error) {
                    console.log("xxxxxx")
                    throw r.name + ' load fail';
                }
                if (!error.__resource_manager_error__) {
                    console.log("yyyyyy")
                    throw error;
                }
                console.log("zzzzzz")
                delete _this.itemLoadDic[r.root + r.name];
                _this.loadingCount--;
                delete RES.host.state[r.root + r.name];
                var times = _this.retryTimesDic[r.name] || 1;
                if (times > _this.maxRetryTimes) {
                    delete _this.retryTimesDic[r.name];
                    if (_this.promiseHash[r.root + r.name]) {
                        var dispatcher = _this.deleteDispatcher(r.root + r.name);
                        dispatcher.dispatchEventWith('error', false, {
                            r: r,
                            error: error
                        });
                    }
                    var groupNames = r.groupNames;
                    if (groupNames) {
                        delete r.groupNames;
                        for (var _i = 0, groupNames_2 = groupNames; _i < groupNames_2.length; _i++) {
                            var groupName = groupNames_2[_i];
                            if (!_this.loadItemErrorDic[groupName]) {
                                _this.loadItemErrorDic[groupName] = [];
                            }
                            if (_this.loadItemErrorDic[groupName].indexOf(r) == -1) {
                                _this.loadItemErrorDic[groupName].push(r);
                            }
                            _this.groupErrorDic[groupName] = true;
                            if (_this.setGroupProgress(groupName, r)) {
                                _this.loadGroupEnd(groupName, error);
                            } else {
                                _this.errorDic[groupName] = error;
                            }
                        }
                    }
                    _this.loadNextResource();
                } else {
                    _this.retryTimesDic[r.name] = times + 1;
                    _this.failedList.push(r);
                    _this.loadNextResource();
                    return;
                }
            });
            return true;
        };
        ResourceLoader.prototype.getOneResourceInfoInGroup = function () {
            if (this.failedList.length > 0)
                return this.failedList.shift();
            var maxPriority = Number.NEGATIVE_INFINITY;
            for (var p in this.itemListPriorityDic) {
                maxPriority = Math.max(maxPriority, p);
            }
            var list = this.itemListPriorityDic[maxPriority];
            if (!list) {
                return undefined;
            }
            if (list.length == 0) {
                delete this.itemListPriorityDic[maxPriority];
                return this.getOneResourceInfoInGroup();
            }
            return list.shift();
        };
        ResourceLoader.prototype.setGroupProgress = function (groupName, r) {
            var reporter = this.reporterDic[groupName];
            this.numLoadedDic[groupName]++;
            var current = this.numLoadedDic[groupName];
            var total = this.groupTotalDic[groupName];
            if (reporter && reporter.onProgress) {
                reporter.onProgress(current, total, r);
            }
            return current == total;
        };
        ResourceLoader.prototype.loadGroupEnd = function (groupName, lastError) {
            delete this.groupTotalDic[groupName];
            delete this.numLoadedDic[groupName];
            delete this.reporterDic[groupName];
            var dispatcher = this.deleteDispatcher(groupName);
            if (!lastError) {
                var groupError = this.groupErrorDic[groupName];
                delete this.groupErrorDic[groupName];
                if (groupError) {
                    var itemList = this.loadItemErrorDic[groupName];
                    delete this.loadItemErrorDic[groupName];
                    var error = this.errorDic[groupName];
                    delete this.errorDic[groupName];
                    dispatcher.dispatchEventWith('error', false, {
                        itemList: itemList,
                        error: error
                    });
                } else {
                    dispatcher.dispatchEventWith('complete');
                }
            } else {
                delete this.groupErrorDic[groupName];
                var itemList = this.loadItemErrorDic[groupName];
                delete this.loadItemErrorDic[groupName];
                dispatcher.dispatchEventWith('error', false, {
                    itemList: itemList,
                    lastError: lastError
                });
            }
        };
        ResourceLoader.prototype.deleteDispatcher = function (groupName) {
            delete this.promiseHash[groupName];
            var dispatcher = this.dispatcherDic[groupName];
            delete this.dispatcherDic[groupName];
            return dispatcher;
        };
        ResourceLoader.prototype.loadResource = function (r, p) {
            console.log('​🦋 🦋 🦋 ResourceLoader.prototype.loadResource')
            if (!p) {
                if (RES.FEATURE_FLAG.FIX_DUPLICATE_LOAD == 1) {
                    var s = RES.host.state[r.root + r.name];
                    if (s == 2) {
                        return Promise.resolve(RES.host.get(r));
                    }
                    if (s == 1) {
                        return r.promise;
                    }
                }
                p = RES.processor.isSupport(r);
            }
            if (!p) {
                throw new RES.ResourceManagerError(2001, r.name, r.type);
            }
            RES.host.state[r.root + r.name] = 1;
            var promise = p.onLoadStart(RES.host, r);
            r.promise = promise;
            return promise;
        };
        ResourceLoader.prototype.unloadResource = function (r) {
            var data = RES.host.get(r);
            if (!data) {
                console.warn('尝试释放不存在的资源:', r.name);
                return false;
            }
            var p = RES.processor.isSupport(r);
            if (p) {
                p.onRemoveStart(RES.host, r);
                RES.host.remove(r);
                if (r.extra == 1) {
                    RES.config.removeResourceData(r);
                }
                return true;
            } else {
                return true;
            }
        };
        return ResourceLoader;
    }();
    RES.ResourceLoader = ResourceLoader;
    __reflect(ResourceLoader.prototype, 'RES.ResourceLoader');
}(RES || (RES = {})));
var RES;
(function (RES) {
    RES.checkNull = function (target, propertyKey, descriptor) {
        var method = descriptor.value;
        descriptor.value = function () {
            var arg = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                arg[_i] = arguments[_i];
            }
            if (!arg[0]) {
                console.warn('方法' + propertyKey + '的参数不能为null');
                return null;
            } else {
                return method.apply(this, arg);
            }
        };
    };
    RES.FEATURE_FLAG = { FIX_DUPLICATE_LOAD: 1 };
    var upgrade;
    (function (upgrade) {
        var _level = 'warning';
        function setUpgradeGuideLevel(level) {
            _level = level;
        }
        upgrade.setUpgradeGuideLevel = setUpgradeGuideLevel;
    }(upgrade = RES.upgrade || (RES.upgrade = {})));
}(RES || (RES = {})));
var RES;
(function (RES) {
    function nameSelector(url) {
        return RES.path.basename(url).split('.').join('_');
    }
    RES.nameSelector = nameSelector;
    function typeSelector(path) {
        var ext = path.substr(path.lastIndexOf('.') + 1);
        var type;
        switch (ext) {
        case RES.ResourceItem.TYPE_XML:
        case RES.ResourceItem.TYPE_JSON:
        case RES.ResourceItem.TYPE_SHEET:
            type = ext;
            break;
        case 'png':
        case 'jpg':
        case 'gif':
        case 'jpeg':
        case 'bmp':
            type = RES.ResourceItem.TYPE_IMAGE;
            break;
        case 'fnt':
            type = RES.ResourceItem.TYPE_FONT;
            break;
        case 'txt':
            type = RES.ResourceItem.TYPE_TEXT;
            break;
        case 'mp3':
        case 'ogg':
        case 'mpeg':
        case 'wav':
        case 'm4a':
        case 'mp4':
        case 'aiff':
        case 'wma':
        case 'mid':
            type = RES.ResourceItem.TYPE_SOUND;
            break;
        case 'mergeJson':
        case 'zip':
        case 'pvr':
            type = ext;
            break;
        default:
            type = RES.ResourceItem.TYPE_BIN;
            break;
        }
        return type;
    }
    RES.typeSelector = typeSelector;
    function registerAnalyzer(type, analyzerClass) {
        throw new RES.ResourceManagerError(2002);
    }
    RES.registerAnalyzer = registerAnalyzer;
    function setIsCompatible(value) {
        RES.isCompatible = value;
    }
    RES.setIsCompatible = setIsCompatible;
    RES.isCompatible = false;
    function loadConfig(url, resourceRoot) {
        console.log("🚘 🚘 🚘 🚘 🚘 🚘 🚘 🚘 🚘 🚘 🚘 🚘 🚘 🚘 🚘 🚘 🚘 🚘 🚘 🚘 🚘 🚘 🚘 🚘 🚘 ")
        console.log('​loadConfig -> loadConfig')
        if (resourceRoot.indexOf('://') >= 0) {
            var temp = resourceRoot.split('://');
            resourceRoot = temp[0] + '://' + RES.path.normalize(temp[1] + '/');
            url = url.replace(resourceRoot, '');
        } else {
            resourceRoot = RES.path.normalize(resourceRoot + '/');
            url = url.replace(resourceRoot, '');
        }
        RES.setConfigURL(url, resourceRoot);
        if (!instance)
            instance = new Resource();
        return compatiblePromise(instance.loadConfig());
    }
    RES.loadConfig = loadConfig;
    function compatiblePromise(promise) {
        if (RES.isCompatible) {
            promise.catch(function (e) {
            }).then();
            return undefined;
        } else {
            return promise;
        }
    }
    function loadGroup(name, priority, reporter) {
        if (priority === void 0) {
            priority = 0;
        }
        return compatiblePromise(instance.loadGroup(name, priority, reporter));
    }
    RES.loadGroup = loadGroup;
    function isGroupLoaded(name) {
        return instance.isGroupLoaded(name);
    }
    RES.isGroupLoaded = isGroupLoaded;
    function getGroupByName(name) {
        return instance.getGroupByName(name).map(function (r) {
            return RES.ResourceItem.convertToResItem(r);
        });
    }
    RES.getGroupByName = getGroupByName;
    function createGroup(name, keys, override) {
        if (override === void 0) {
            override = false;
        }
        return instance.createGroup(name, keys, override);
    }
    RES.createGroup = createGroup;
    function hasRes(key) {
        return instance.hasRes(key);
    }
    RES.hasRes = hasRes;
    function getRes(key) {
        return instance.getRes(key);
    }
    RES.getRes = getRes;
    function getResAsync(key, compFunc, thisObject) {
        return compatiblePromise(instance.getResAsync.apply(instance, arguments));
    }
    RES.getResAsync = getResAsync;
    function getResByUrl(url, compFunc, thisObject, type) {
        if (type === void 0) {
            type = '';
        }
        return compatiblePromise(instance.getResByUrl(url, compFunc, thisObject, type));
    }
    RES.getResByUrl = getResByUrl;
    function destroyRes(name, force) {
        return instance.destroyRes(name, force);
    }
    RES.destroyRes = destroyRes;
    function setMaxLoadingThread(thread) {
        if (!instance)
            instance = new Resource();
        instance.setMaxLoadingThread(thread);
    }
    RES.setMaxLoadingThread = setMaxLoadingThread;
    function setMaxRetryTimes(retry) {
        instance.setMaxRetryTimes(retry);
    }
    RES.setMaxRetryTimes = setMaxRetryTimes;
    function addEventListener(type, listener, thisObject, useCapture, priority) {
        if (useCapture === void 0) {
            useCapture = false;
        }
        if (priority === void 0) {
            priority = 0;
        }
        if (!instance)
            instance = new Resource();
        instance.addEventListener(type, listener, thisObject, useCapture, priority);
    }
    RES.addEventListener = addEventListener;
    function removeEventListener(type, listener, thisObject, useCapture) {
        if (useCapture === void 0) {
            useCapture = false;
        }
        instance.removeEventListener(type, listener, thisObject, useCapture);
    }
    RES.removeEventListener = removeEventListener;
    function $addResourceData(data) {
        instance.addResourceData(data);
    }
    RES.$addResourceData = $addResourceData;
    function getVersionController() {
        if (!instance)
            instance = new Resource();
        return instance.vcs;
    }
    RES.getVersionController = getVersionController;
    function registerVersionController(vcs) {
        if (!instance)
            instance = new Resource();
        instance.registerVersionController(vcs);
    }
    RES.registerVersionController = registerVersionController;
    function getVirtualUrl(url) {
        if (instance.vcs) {
            return instance.vcs.getVirtualUrl(url);
        } else {
            return url;
        }
    }
    RES.getVirtualUrl = getVirtualUrl;
    var Resource = function (_super) {
        __extends(Resource, _super);
        function Resource() {
            var _this = _super.call(this) || this;
            _this.isVcsInit = false;
            _this.normalLoadConfig = function () {
				console.log('​_this.normalLoadConfig -> _this.normalLoadConfig')
                return RES.config.init().then(function (data) {
                    RES.ResourceEvent.dispatchResourceEvent(_this, RES.ResourceEvent.CONFIG_COMPLETE);
                }, function (error) {
                    RES.ResourceEvent.dispatchResourceEvent(_this, RES.ResourceEvent.CONFIG_LOAD_ERROR);
                    return Promise.reject(error);
                });
            };
            if (RES.VersionController) {
                _this.vcs = new RES.VersionController();
            }
            return _this;
        }
        Resource.prototype.registerVersionController = function (vcs) {
            this.vcs = vcs;
            this.isVcsInit = false;
        };
        Resource.prototype.loadConfig = function () {
			console.log('​Resource.prototype.loadConfig -> Resource.prototype.loadConfig')
            var _this = this;
            if (!this.isVcsInit && this.vcs) {
                this.isVcsInit = true;
                return this.vcs.init().then(function () {
                    return _this.normalLoadConfig();
                });
            } else {
                return this.normalLoadConfig();
            }
        };
        Resource.prototype.isGroupLoaded = function (name) {
            var resources = RES.config.getGroupByName(name);
            return resources.every(function (r) {
                return RES.host.get(r) != null;
            });
        };
        Resource.prototype.getGroupByName = function (name) {
            return RES.config.getGroupByName(name);
        };
        Resource.prototype.loadGroup = function (name, priority, reporter) {
            var _this = this;
            if (priority === void 0) {
                priority = 0;
            }
            var reporterDelegate = {
                onProgress: function (current, total, resItem) {
                    if (reporter && reporter.onProgress) {
                        reporter.onProgress(current, total, resItem);
                    }
                    RES.ResourceEvent.dispatchResourceEvent(_this, RES.ResourceEvent.GROUP_PROGRESS, name, resItem, current, total);
                }
            };
            return this._loadGroup(name, priority, reporterDelegate).then(function (data) {
                if (RES.config.config.loadGroup.indexOf(name) == -1) {
                    RES.config.config.loadGroup.push(name);
                }
                RES.ResourceEvent.dispatchResourceEvent(_this, RES.ResourceEvent.GROUP_COMPLETE, name);
            }, function (error) {
                if (RES.config.config.loadGroup.indexOf(name) == -1) {
                    RES.config.config.loadGroup.push(name);
                }
                if (error.itemList) {
                    var itemList = error.itemList;
                    var length_1 = itemList.length;
                    for (var i = 0; i < length_1; i++) {
                        var item = itemList[i];
                        delete item.promise;
                        RES.ResourceEvent.dispatchResourceEvent(_this, RES.ResourceEvent.ITEM_LOAD_ERROR, name, item);
                    }
                }
                if (RES.isCompatible) {
                    console.warn(error.error.message);
                }
                RES.ResourceEvent.dispatchResourceEvent(_this, RES.ResourceEvent.GROUP_LOAD_ERROR, name);
                return Promise.reject(error.error);
            });
        };
        Resource.prototype._loadGroup = function (name, priority, reporter) {
            if (priority === void 0) {
                priority = 0;
            }
            var resources = RES.config.getGroupByName(name);
            if (resources.length == 0) {
                return new Promise(function (resolve, reject) {
                    reject({ error: new RES.ResourceManagerError(2005, name) });
                });
            }
            return RES.queue.pushResGroup(resources, name, priority, reporter);
        };
        Resource.prototype.createGroup = function (name, keys, override) {
            if (override === void 0) {
                override = false;
            }
            return RES.config.createGroup(name, keys, override);
        };
        Resource.prototype.hasRes = function (key) {
            return RES.config.getResourceWithSubkey(key) != null;
        };
        Resource.prototype.getRes = function (resKey) {
            var result = RES.config.getResourceWithSubkey(resKey);
            if (result) {
                var r = result.r;
                var key = result.key;
                var subkey = result.subkey;
                var p = RES.processor.isSupport(r);
                if (p && p.getData && subkey) {
                    return p.getData(RES.host, r, key, subkey);
                } else {
                    return RES.host.get(r);
                }
            } else {
                return null;
            }
        };
        Resource.prototype.getResAsync = function (key, compFunc, thisObject) {
            var _this = this;
            var paramKey = key;
            var tempResult = RES.config.getResourceWithSubkey(key);
            if (tempResult == null) {
                if (compFunc) {
                    compFunc.call(thisObject, null, paramKey);
                }
                return Promise.reject(new RES.ResourceManagerError(2006, key));
            }
            var r = tempResult.r, subkey = tempResult.subkey;
            return RES.queue.pushResItem(r).then(function (value) {
                RES.host.save(r, value);
                var p = RES.processor.isSupport(r);
                if (p && p.getData && subkey) {
                    value = p.getData(RES.host, r, key, subkey);
                }
                if (compFunc) {
                    compFunc.call(thisObject, value, paramKey);
                }
                return value;
            }, function (error) {
                RES.host.remove(r);
                RES.ResourceEvent.dispatchResourceEvent(_this, RES.ResourceEvent.ITEM_LOAD_ERROR, '', r);
                if (compFunc) {
                    compFunc.call(thisObject, null, paramKey);
                    return Promise.reject(null);
                }
                return Promise.reject(error);
            });
        };
        Resource.prototype.getResByUrl = function (url, compFunc, thisObject, type) {
            var _this = this;
            if (type === void 0) {
                type = '';
            }
            var r = RES.config.getResource(url);
            if (!r) {
                if (!type) {
                    type = RES.config.__temp__get__type__via__url(url);
                }
                r = {
                    name: url,
                    url: url,
                    type: type,
                    root: '',
                    extra: 1
                };
                RES.config.addResourceData(r);
                r = RES.config.getResource(url);
                if (!r) {
                    throw 'never';
                }
            }
            return RES.queue.pushResItem(r).then(function (value) {
                RES.host.save(r, value);
                if (compFunc && r) {
                    compFunc.call(thisObject, value, r.url);
                }
                return value;
            }, function (error) {
                RES.host.remove(r);
                RES.ResourceEvent.dispatchResourceEvent(_this, RES.ResourceEvent.ITEM_LOAD_ERROR, '', r);
                if (compFunc) {
                    compFunc.call(thisObject, null, url);
                    return Promise.reject(null);
                }
                return Promise.reject(error);
            });
        };
        Resource.prototype.destroyRes = function (name, force) {
            if (force === void 0) {
                force = true;
            }
            var group = RES.config.getGroupByName(name);
            if (group && group.length > 0) {
                var index = RES.config.config.loadGroup.indexOf(name);
                if (index == -1) {
                    return false;
                }
                if (force || RES.config.config.loadGroup.length == 1 && RES.config.config.loadGroup[0] == name) {
                    for (var _i = 0, group_2 = group; _i < group_2.length; _i++) {
                        var item = group_2[_i];
                        RES.queue.unloadResource(item);
                    }
                    RES.config.config.loadGroup.splice(index, 1);
                } else {
                    var removeItemHash = {};
                    for (var _a = 0, _b = RES.config.config.loadGroup; _a < _b.length; _a++) {
                        var groupName = _b[_a];
                        for (var key in RES.config.config.groups[groupName]) {
                            var tmpname = RES.config.config.groups[groupName][key];
                            if (removeItemHash[tmpname]) {
                                removeItemHash[tmpname]++;
                            } else {
                                removeItemHash[tmpname] = 1;
                            }
                        }
                    }
                    for (var _c = 0, group_3 = group; _c < group_3.length; _c++) {
                        var item = group_3[_c];
                        if (removeItemHash[item.name] && removeItemHash[item.name] == 1) {
                            RES.queue.unloadResource(item);
                        }
                    }
                    RES.config.config.loadGroup.splice(index, 1);
                }
                return true;
            } else {
                var item = RES.config.getResource(name);
                if (item) {
                    return RES.queue.unloadResource(item);
                } else {
                    console.warn('在内存' + name + '资源不存在');
                    return false;
                }
            }
        };
        Resource.prototype.setMaxLoadingThread = function (thread) {
            if (thread < 1) {
                thread = 1;
            }
            RES.queue.thread = thread;
        };
        Resource.prototype.setMaxRetryTimes = function (retry) {
            retry = Math.max(retry, 0);
            RES.queue.maxRetryTimes = retry;
        };
        Resource.prototype.addResourceData = function (data) {
            data['root'] = '';
            RES.config.addResourceData(data);
        };
        __decorate([RES.checkNull], Resource.prototype, 'hasRes', null);
        __decorate([RES.checkNull], Resource.prototype, 'getRes', null);
        __decorate([RES.checkNull], Resource.prototype, 'getResAsync', null);
        __decorate([RES.checkNull], Resource.prototype, 'getResByUrl', null);
        return Resource;
    }(egret.EventDispatcher);
    RES.Resource = Resource;
    __reflect(Resource.prototype, 'RES.Resource');
    var instance;
}(RES || (RES = {})));
var RES;
(function (RES) {
    var path;
    (function (path_1) {
        function normalize(filename) {
            var arr = filename.split('/');
            return arr.filter(function (value, index) {
                return !!value || index == arr.length - 1;
            }).join('/');
        }
        path_1.normalize = normalize;
        function basename(filename) {
            return filename.substr(filename.lastIndexOf('/') + 1);
        }
        path_1.basename = basename;
        function dirname(path) {
            return path.substr(0, path.lastIndexOf('/'));
        }
        path_1.dirname = dirname;
    }(path = RES.path || (RES.path = {})));
}(RES || (RES = {})));
var RES;
(function (RES) {
    var NativeVersionController = function () {
        function NativeVersionController() {
        }
        NativeVersionController.prototype.init = function () {
            this.versionInfo = this.getLocalData('all.manifest');
            return Promise.resolve();
        };
        NativeVersionController.prototype.getVirtualUrl = function (url) {
            return url;
        };
        NativeVersionController.prototype.getLocalData = function (filePath) {
            if (egret_native.readUpdateFileSync && egret_native.readResourceFileSync) {
                var content = egret_native.readUpdateFileSync(filePath);
                if (content != null) {
                    return JSON.parse(content);
                }
                content = egret_native.readResourceFileSync(filePath);
                if (content != null) {
                    return JSON.parse(content);
                }
            }
            return null;
        };
        return NativeVersionController;
    }();
    RES.NativeVersionController = NativeVersionController;
    __reflect(NativeVersionController.prototype, 'RES.NativeVersionController', ['RES.IVersionController']);
    if (egret.Capabilities.runtimeType == egret.RuntimeType.NATIVE) {
        RES.VersionController = NativeVersionController;
    }
}(RES || (RES = {})));
var RES;
(function (RES) {
    var processor;
    (function (processor_1) {
        function isSupport(resource) {
            return processor_1._map[resource.type];
        }
        processor_1.isSupport = isSupport;
        function map(type, processor) {
            processor_1._map[type] = processor;
        }
        processor_1.map = map;
        function promisify(loader, resource) {
            var _this = this;
            return new Promise(function (resolve, reject) {
                var onSuccess = function () {
                    console.log("完成完成完成完成完成完成完成完成")
                    var texture = loader['data'] ? loader['data'] : loader['response'];
                    resolve(texture);
                };
                var onError = function () {
                    console.log("失败失败失败失败失败失败失败失败")
                    var e = new RES.ResourceManagerError(1001, resource.url);
                    reject(e);
                };
                loader.addEventListener(egret.Event.COMPLETE, onSuccess, _this);
                loader.addEventListener(egret.IOErrorEvent.IO_ERROR, onError, _this);
            });
        }
        function getRelativePath(url, file) {
            if (file.indexOf('://') != -1) {
                return file;
            }
            url = url.split('\\').join('/');
            var params = url.match(/#.*|\?.*/);
            var paramUrl = '';
            if (params) {
                paramUrl = params[0];
            }
            var index = url.lastIndexOf('/');
            if (index != -1) {
                url = url.substring(0, index + 1) + file;
            } else {
                url = file;
            }
            return url + paramUrl;
        }
        processor_1.getRelativePath = getRelativePath;
        processor_1.ImageProcessor = {
            onLoadStart: function (host, resource) {
				console.log('​🐰 🐰 🐰 🐰 🐰 🐰 onLoadStart')
                var loader = new egret.ImageLoader();
                loader.load(RES.getVirtualUrl(resource.root + resource.url));
                return promisify(loader, resource).then(function (bitmapData) {
                    var texture = new egret.Texture();
                    texture._setBitmapData(bitmapData);
                    var r = host.resourceConfig.getResource(resource.name);
                    if (r && r.scale9grid) {
                        var list = r.scale9grid.split(',');
                        texture['scale9Grid'] = new egret.Rectangle(parseInt(list[0]), parseInt(list[1]), parseInt(list[2]), parseInt(list[3]));
                    }
                    return texture;
                });
            },
            onRemoveStart: function (host, resource) {
                var texture = host.get(resource);
                texture.dispose();
            }
        };
        processor_1.BinaryProcessor = {
            onLoadStart: function (host, resource) {
                console.log('​🐂 🐂 🐂 🐂 🐂 🐂 🐂 ')
                var request = new egret.HttpRequest();
                request.responseType = egret.HttpResponseType.ARRAY_BUFFER;
                request.open(RES.getVirtualUrl(resource.root + resource.url), 'get');
                request.send();
                return promisify(request, resource);
            },
            onRemoveStart: function (host, resource) {
            }
        };
        processor_1.TextProcessor = {
            onLoadStart: function (host, resource) {
                console.log('​🐩 🐩 🐩 🐩 🐩 🐩 🐩')
                var request = new egret.HttpRequest();
                console.log(request);
                request.responseType = egret.HttpResponseType.TEXT;
                let url = RES.getVirtualUrl(resource.root + resource.url)
                console.log("🐖 🐖 🐖 🐖 🐖 🐖 " + url)
                request.open(url, 'get');
                request.send();
                return promisify(request, resource);
            },
            onRemoveStart: function (host, resource) {
                return true;
            }
        };
        processor_1.JsonProcessor = {
            onLoadStart: function (host, resource) {
                console.log('​🐈 🐈 🐈 🐈 🐈 🐈 🐈 ')
                return host.load(resource, 'text').then(function (text) {
                    var data = JSON.parse(text);
                    return data;
                });
            },
            onRemoveStart: function (host, request) {
            }
        };
        processor_1.XMLProcessor = {
            onLoadStart: function (host, resource) {
                console.log('​🐭 🐭 🐭 🐭 🐭 🐭 🐭 onLoadStart')
                return host.load(resource, 'text').then(function (text) {
                    var data = egret.XML.parse(text);
                    return data;
                });
            },
            onRemoveStart: function (host, resource) {
                return true;
            }
        };
        processor_1.CommonJSProcessor = {
            onLoadStart: function (host, resource) {
                console.log('​🐑 🐑 🐑 🐑 🐑 🐑 🐑 onLoadStart')
                return host.load(resource, 'text').then(function (text) {
                    var f = new Function('require', 'exports', text);
                    var require = function () {
                    };
                    var exports = {};
                    try {
                        f(require, exports);
                    } catch (e) {
                        throw new RES.ResourceManagerError(2003, resource.name, e.message);
                    }
                    return exports;
                });
            },
            onRemoveStart: function (host, resource) {
            }
        };
        processor_1.SheetProcessor = {
            onLoadStart: function (host, resource) {
                console.log('​🐲 🐲 🐲 🐲 🐲 🐲 🐲 onLoadStart')
                return host.load(resource, 'json').then(function (data) {
                    var r = host.resourceConfig.getResource(RES.nameSelector(data.file));
                    if (!r) {
                        var imageName = getRelativePath(resource.url, data.file);
                        r = {
                            name: imageName,
                            url: imageName,
                            type: 'image',
                            root: resource.root
                        };
                    }
                    return host.load(r).then(function (bitmapData) {
                        var frames = data.frames;
                        var spriteSheet = new egret.SpriteSheet(bitmapData);
                        spriteSheet['$resourceInfo'] = r;
                        for (var subkey in frames) {
                            var config = frames[subkey];
                            var texture = spriteSheet.createTexture(subkey, config.x, config.y, config.w, config.h, config.offX, config.offY, config.sourceW, config.sourceH);
                            if (config['scale9grid']) {
                                var str = config['scale9grid'];
                                var list = str.split(',');
                                texture['scale9Grid'] = new egret.Rectangle(parseInt(list[0]), parseInt(list[1]), parseInt(list[2]), parseInt(list[3]));
                            }
                        }
                        host.save(r, bitmapData);
                        return spriteSheet;
                    }, function (e) {
                        host.remove(r);
                        throw e;
                    });
                });
            },
            getData: function (host, resource, key, subkey) {
                var data = host.get(resource);
                if (data) {
                    return data.getTexture(subkey);
                } else {
                    return null;
                }
            },
            onRemoveStart: function (host, resource) {
                var sheet = host.get(resource);
                var r = sheet['$resourceInfo'];
                sheet.dispose();
                host.unload(r);
            }
        };
        var fontGetTexturePath = function (url, fntText) {
            var file = '';
            var lines = fntText.split('\n');
            var pngLine = lines[2];
            var index = pngLine.indexOf('file="');
            if (index != -1) {
                pngLine = pngLine.substring(index + 6);
                index = pngLine.indexOf('"');
                file = pngLine.substring(0, index);
            }
            url = url.split('\\').join('/');
            var index = url.lastIndexOf('/');
            if (index != -1) {
                url = url.substring(0, index + 1) + file;
            } else {
                url = file;
            }
            return url;
        };
        processor_1.FontProcessor = {
            onLoadStart: function (host, resource) {
                console.log('​processor_1.FontProcessor -> onLoadStart')
                return host.load(resource, 'text').then(function (data) {
                    var config;
                    try {
                        config = JSON.parse(data);
                    } catch (e) {
                        config = data;
                    }
                    var imageName;
                    if (typeof config === 'string') {
                        imageName = fontGetTexturePath(resource.url, config);
                    } else {
                        imageName = getRelativePath(resource.url, config.file);
                    }
                    var r = host.resourceConfig.getResource(RES.nameSelector(imageName));
                    if (!r) {
                        r = {
                            name: imageName,
                            url: imageName,
                            type: 'image',
                            root: resource.root
                        };
                    }
                    return host.load(r).then(function (texture) {
                        var font = new egret.BitmapFont(texture, config);
                        font['$resourceInfo'] = r;
                        host.save(r, texture);
                        return font;
                    }, function (e) {
                        host.remove(r);
                        throw e;
                    });
                });
            },
            onRemoveStart: function (host, resource) {
                var font = host.get(resource);
                var r = font['$resourceInfo'];
                host.unload(r);
            }
        };
        processor_1.SoundProcessor = {
            onLoadStart: function (host, resource) {
                console.log('​processor_1.SoundProcessor -> onLoadStart')
                var sound = new egret.Sound();
                sound.load(RES.getVirtualUrl(resource.root + resource.url));
                return promisify(sound, resource).then(function () {
                    return sound;
                });
            },
            onRemoveStart: function (host, resource) {
            }
        };
        processor_1.MovieClipProcessor = {
            onLoadStart: function (host, resource) {
                console.log('​processor_1.MovieClipProcessor -> onLoadStart')
                var mcData;
                var imageResource;
                return host.load(resource, 'json').then(function (value) {
                    mcData = value;
                    var jsonPath = resource.name;
                    var imagePath = jsonPath.substring(0, jsonPath.lastIndexOf('.')) + '.png';
                    imageResource = host.resourceConfig.getResource(imagePath);
                    if (!imageResource) {
                        throw new RES.ResourceManagerError(1001, imagePath);
                    }
                    return host.load(imageResource);
                }).then(function (value) {
                    host.save(imageResource, value);
                    var mcTexture = value;
                    var mcDataFactory = new egret.MovieClipDataFactory(mcData, mcTexture);
                    return mcDataFactory;
                });
            },
            onRemoveStart: function (host, resource) {
                var mcFactory = host.get(resource);
                mcFactory.clearCache();
                mcFactory.$spriteSheet.dispose();
                var jsonPath = resource.name;
                var imagePath = jsonPath.substring(0, jsonPath.lastIndexOf('.')) + '.png';
                var imageResource = host.resourceConfig.getResource(imagePath);
                if (imageResource) {
                    host.unload(imageResource);
                }
            }
        };
        processor_1.MergeJSONProcessor = {
            onLoadStart: function (host, resource) {
                console.log('​processor_1.MergeJSONProcessor -> onLoadStart')
                return host.load(resource, 'json').then(function (data) {
                    for (var key in data) {
                        RES.config.addSubkey(key, resource.name);
                    }
                    return data;
                });
            },
            getData: function (host, resource, key, subkey) {
                var data = host.get(resource);
                if (data) {
                    return data[subkey];
                } else {
                    console.error('missing resource :' + resource.name);
                    return null;
                }
            },
            onRemoveStart: function (host, resource) {
            }
        };
        processor_1.LegacyResourceConfigProcessor = {
            onLoadStart: function (host, resource) {
                console.log('​processor_1.LegacyResourceConfigProcessor -> onLoadStart')
                return host.load(resource, 'json').then(function (data) {
                    var resConfigData = RES.config.config;
                    var root = resource.root;
                    var fileSystem = resConfigData.fileSystem;
                    if (!fileSystem) {
                        fileSystem = {
                            fsData: {},
                            getFile: function (filename) {
                                return fsData[filename];
                            },
                            addFile: function (data) {
                                if (!data.type)
                                    data.type = '';
                                if (root == undefined) {
                                    data.root = '';
                                }
                                fsData[data.name] = data;
                            },
                            profile: function () {
                                console.log(fsData);
                            },
                            removeFile: function (filename) {
                                delete fsData[filename];
                            }
                        };
                        resConfigData.fileSystem = fileSystem;
                    }
                    var groups = resConfigData.groups;
                    for (var _i = 0, _a = data.groups; _i < _a.length; _i++) {
                        var g = _a[_i];
                        if (g.keys == '') {
                            groups[g.name] = [];
                        } else {
                            groups[g.name] = g.keys.split(',');
                        }
                    }
                    var alias = resConfigData.alias;
                    var fsData = fileSystem['fsData'];
                    var _loop_1 = function (resource_1) {
                        fsData[resource_1.name] = resource_1;
                        fsData[resource_1.name].root = root;
                        if (resource_1.subkeys) {
                            resource_1.subkeys.split(',').forEach(function (subkey) {
                                alias[subkey] = resource_1.name + '#' + subkey;
                                alias[resource_1.name + '.' + subkey] = resource_1.name + '#' + subkey;
                            });
                        }
                    };
                    for (var _b = 0, _c = data.resources; _b < _c.length; _b++) {
                        var resource_1 = _c[_b];
                        _loop_1(resource_1);
                    }
                    host.save(resource, data);
                    return data;
                });
            },
            onRemoveStart: function () {
            }
        };
        processor_1._map = {
            'image': processor_1.ImageProcessor,
            'json': processor_1.JsonProcessor,
            'text': processor_1.TextProcessor,
            'xml': processor_1.XMLProcessor,
            'sheet': processor_1.SheetProcessor,
            'font': processor_1.FontProcessor,
            'bin': processor_1.BinaryProcessor,
            'commonjs': processor_1.CommonJSProcessor,
            'sound': processor_1.SoundProcessor,
            'movieclip': processor_1.MovieClipProcessor,
            'mergeJson': processor_1.MergeJSONProcessor,
            'legacyResourceConfig': processor_1.LegacyResourceConfigProcessor
        };
    }(processor = RES.processor || (RES.processor = {})));
}(RES || (RES = {})));
var RES;
(function (RES) {
    var ResourceEvent = function (_super) {
        __extends(ResourceEvent, _super);
        function ResourceEvent(type, bubbles, cancelable) {
            if (bubbles === void 0) {
                bubbles = false;
            }
            if (cancelable === void 0) {
                cancelable = false;
            }
            var _this = _super.call(this, type, bubbles, cancelable) || this;
            _this.itemsLoaded = 0;
            _this.itemsTotal = 0;
            _this.groupName = '';
            return _this;
        }
        ResourceEvent.dispatchResourceEvent = function (target, type, groupName, resItem, itemsLoaded, itemsTotal) {
            if (groupName === void 0) {
                groupName = '';
            }
            if (resItem === void 0) {
                resItem = undefined;
            }
            if (itemsLoaded === void 0) {
                itemsLoaded = 0;
            }
            if (itemsTotal === void 0) {
                itemsTotal = 0;
            }
            var event = egret.Event.create(ResourceEvent, type);
            event.groupName = groupName;
            if (resItem) {
                event.resItem = RES.ResourceItem.convertToResItem(resItem);
            }
            event.itemsLoaded = itemsLoaded;
            event.itemsTotal = itemsTotal;
            var result = target.dispatchEvent(event);
            egret.Event.release(event);
            return result;
        };
        ResourceEvent.ITEM_LOAD_ERROR = 'itemLoadError';
        ResourceEvent.CONFIG_COMPLETE = 'configComplete';
        ResourceEvent.CONFIG_LOAD_ERROR = 'configLoadError';
        ResourceEvent.GROUP_PROGRESS = 'groupProgress';
        ResourceEvent.GROUP_COMPLETE = 'groupComplete';
        ResourceEvent.GROUP_LOAD_ERROR = 'groupLoadError';
        return ResourceEvent;
    }(egret.Event);
    RES.ResourceEvent = ResourceEvent;
    __reflect(ResourceEvent.prototype, 'RES.ResourceEvent');
}(RES || (RES = {})));
var RES;
(function (RES) {
    var ResourceItem;
    (function (ResourceItem) {
        ResourceItem.TYPE_XML = 'xml';
        ResourceItem.TYPE_IMAGE = 'image';
        ResourceItem.TYPE_BIN = 'bin';
        ResourceItem.TYPE_TEXT = 'text';
        ResourceItem.TYPE_JSON = 'json';
        ResourceItem.TYPE_SHEET = 'sheet';
        ResourceItem.TYPE_FONT = 'font';
        ResourceItem.TYPE_SOUND = 'sound';
        function convertToResItem(r) {
            var name = r.name;
            if (!RES.config.config) {
                name = r.url;
            } else {
                for (var aliasName in RES.config.config.alias) {
                    if (RES.config.config.alias[aliasName] == r.url) {
                        name = aliasName;
                    }
                }
            }
            var result = {
                name: name,
                url: r.url,
                type: r.type,
                data: r,
                root: r.root
            };
            return result;
        }
        ResourceItem.convertToResItem = convertToResItem;
    }(ResourceItem = RES.ResourceItem || (RES.ResourceItem = {})));
}(RES || (RES = {})));
var RES;
(function (RES) {
    var NewFileSystem = function () {
        function NewFileSystem(data) {
            this.data = data;
        }
        NewFileSystem.prototype.profile = function () {
            console.log(this.data);
        };
        NewFileSystem.prototype.addFile = function (filename, type) {
            if (!type)
                type = '';
            filename = RES.path.normalize(filename);
            var basefilename = RES.path.basename(filename);
            var folder = RES.path.dirname(filename);
            if (!this.exists(folder)) {
                this.mkdir(folder);
            }
            var d = this.resolve(folder);
            d[basefilename] = {
                url: filename,
                type: type
            };
        };
        NewFileSystem.prototype.getFile = function (filename) {
            var result = this.resolve(filename);
            if (result) {
                result.name = filename;
            }
            return result;
        };
        NewFileSystem.prototype.resolve = function (dirpath) {
            if (dirpath == '') {
                return this.data;
            }
            dirpath = RES.path.normalize(dirpath);
            var list = dirpath.split('/');
            var current = this.data;
            for (var _i = 0, list_2 = list; _i < list_2.length; _i++) {
                var f = list_2[_i];
                if (current) {
                    current = current[f];
                } else {
                    return current;
                }
            }
            return current;
        };
        NewFileSystem.prototype.mkdir = function (dirpath) {
            dirpath = RES.path.normalize(dirpath);
            var list = dirpath.split('/');
            var current = this.data;
            for (var _i = 0, list_3 = list; _i < list_3.length; _i++) {
                var f = list_3[_i];
                if (!current[f]) {
                    current[f] = {};
                }
                current = current[f];
            }
        };
        NewFileSystem.prototype.exists = function (dirpath) {
            if (dirpath == '')
                return true;
            dirpath = RES.path.normalize(dirpath);
            var list = dirpath.split('/');
            var current = this.data;
            for (var _i = 0, list_4 = list; _i < list_4.length; _i++) {
                var f = list_4[_i];
                if (!current[f]) {
                    return false;
                }
                current = current[f];
            }
            return true;
        };
        return NewFileSystem;
    }();
    RES.NewFileSystem = NewFileSystem;
    __reflect(NewFileSystem.prototype, 'RES.NewFileSystem');
}(RES || (RES = {})));
var RES;
(function (RES) {
    var __tempCache = {};
    function profile() {
        RES.config.config.fileSystem.profile();
        console.log(__tempCache);
        var totalImageSize = 0;
        for (var key in __tempCache) {
            var img = __tempCache[key];
            if (img instanceof egret.Texture) {
                totalImageSize += img.$bitmapWidth * img.$bitmapHeight * 4;
            }
        }
        console.log('gpu size : ' + (totalImageSize / 1024).toFixed(3) + 'kb');
    }
    RES.profile = profile;
    RES.host = {
        state: {},
        get resourceConfig() {
            return RES.config;
        },
        load: function (r, processorName) {
            console.log("☁️ ☁️ ☁️ ☁️ ☁️")
            var processor = typeof processorName == 'string' ? RES.processor._map[processorName] : processorName;
            return RES.queue['loadResource'](r, processor);
        },
        unload: function (r) {
            return RES.queue.unloadResource(r);
        },
        save: function (resource, data) {
            RES.host.state[resource.root + resource.name] = 2;
            delete resource.promise;
            __tempCache[resource.root + resource.name] = data;
        },
        get: function (resource) {
            return __tempCache[resource.root + resource.name];
        },
        remove: function (resource) {
            delete RES.host.state[resource.root + resource.name];
            delete __tempCache[resource.root + resource.name];
        }
    };
    RES.config = new RES.ResourceConfig();
    RES.queue = new RES.ResourceLoader();
    var ResourceManagerError = function (_super) {
        __extends(ResourceManagerError, _super);
        function ResourceManagerError(code, replacer, replacer2) {
            var _this = _super.call(this) || this;
            _this.__resource_manager_error__ = true;
            _this.name = code.toString();
            _this.message = ResourceManagerError.errorMessage[code].replace('{0}', replacer).replace('{1}', replacer2);
            return _this;
        }
        ResourceManagerError.errorMessage = {
            1001: '文件加载失败:{0}',
            1002: 'ResourceManager 初始化失败\uFF1A配置文件加载失败',
            2001: '{0}解析失败,不支持指定解析类型:\'{1}\'\uFF0C请编写自定义 Processor \uFF0C更多内容请参见 https://github.com/egret-labs/resourcemanager/blob/master/docs/README.md#processor',
            2002: 'Analyzer 相关API 在 ResourceManager 中不再支持\uFF0C请编写自定义 Processor \uFF0C更多内容请参见 https://github.com/egret-labs/resourcemanager/blob/master/docs/README.md#processor',
            2003: '{0}解析失败,错误原因:{1}',
            2004: '无法找到文件类型:{0}',
            2005: 'RES加载了不存在或空的资源组:"{0}"',
            2006: '资源配置文件中无法找到特定的资源:{0}'
        };
        return ResourceManagerError;
    }(Error);
    RES.ResourceManagerError = ResourceManagerError;
    __reflect(ResourceManagerError.prototype, 'RES.ResourceManagerError');
}(RES || (RES = {})));