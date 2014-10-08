

(function(){

    DI = window.DI = function(me, definition, run){
        DI.add(me, definition, run);
    };

    function DiItem(name, definition) {
        this.name = name;
        this.callback = definition;
        this.resolved = false;
    };

    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    var ARGUMENT_NAMES = /([^\s,]+)/g;

    DiItem.prototype = {

        _requirements: null,
        _instance: null,
        callback: null,
        name: null,
        resolved: false,

        getRequirements: function() {
            if (this._requirements === null) {
                var fnStr = this.callback.toString().replace(STRIP_COMMENTS, '')
                var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES)
                if (result === null) {
                    this._requirements = [];
                } else {
                    this._requirements = result;
                }
            }
            return this._requirements;
        },

        getInstance: function() {
            if (this.resolved === false) {
                this.resolved = null;
                this._instance = DI._run(this);
                this.resolved = true;
            } else if (this.resolved === null) {
                throw "Cyclic dependency detected: " + this.name;
            }
            return this._instance;
        },

        getName: function() {
            return this.name;
        }
    };
    

    DI.services = {};
    DI._unresolved = {};

    DI.add = function(me, definition, run) {
        if (typeof DI.services[me] === 'undefined') {
            DI.services[me] = new DiItem(me, definition);
            if (run) {
                DI._resolve(me, true);
            }
            DI._resolveUnresolved(me);
        } else {
            throw "Service already defined: "+me;
        }
    };

    DI._resolve = function(serviceName, resolveUnresolved) {
        var service = DI._get(serviceName);
        if (DI._isResolvable(service, resolveUnresolved)) {
            return service.getInstance();
        }
    };
    
    DI._resolveUnresolved = function(newServiceName) {
        if (typeof DI._unresolved[newServiceName] !== 'undefined') {
            var unArray = DI._unresolved[newServiceName];
            var count = unArray.length;
            for (var i = 0; i < count; i++) {
                DI._resolve(unArray[i], false);
            }
            delete DI._unresolved[newServiceName];
        }
    };

    DI._run = function(service) {
        var requirements = service.getRequirements();
        var count = requirements.length,
            requirement, requiredService,
            params = [];
        for (var i = 0; i < count; i++) {
            requirement = requirements[i];
            if (typeof DI.services[requirement] === 'undefined') {
                throw "Missing service: "+requirement;
            }
            requiredService = DI.services[requirement];
            params.push(requiredService.getInstance())
        }
        return service.callback.apply(DI, params);
    };

    DI._addToUnresolvedList = function(waitingFor, serviceName) {
        var unArray;
        if (typeof DI._unresolved[waitingFor] === 'undefined') {
            unArray = DI._unresolved[waitingFor] = [];
        } else {
            unArray = DI._unresolved[waitingFor];
        }
        unArray.push(serviceName);
    }

    DI._isResolvable = function(service, addToList) {
        var requirements = service.getRequirements();
        var count = requirements.length,
            requirement,
            foundAll = true;
        for (var i = 0; i < count; i++) {
            requirement = requirements[i];
            if (typeof DI.services[requirement] === 'undefined') {
                foundAll = false;
                if (addToList) {
                    DI._addToUnresolvedList(requirement, service.getName());
                }
            } 
        }
        return foundAll;
    };

    DI._get = function(serviceName) {
        if (typeof DI.services[serviceName] !== 'undefined') {
            return DI.services[serviceName];
        } else {
            throw "Service not defined: "+serviceName;
        }
    };

    DI.get = function(serviceName) {
        return DI._get(serviceName).getInstance();
    };

})();

