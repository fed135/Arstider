/**
 * Signal
 * 
 * @version 1.5
 * @author frederic charette <fredericcharette@gmail.com>
 */

/**
 * Defines the Signal module
 */
define("Arstider/Signal", [], /** @lends commons/Signal */ function(){

    /**
     * Signal constructor
     * Based on the implamentation of colorhook's JPE Signal implementation
     * https://github.com/colorhook/JPE/wiki/Signal
     * @class commons/Signal
     * @constructor
     */
    function Signal(){
        this.__bindings = null;
        this.__bindingsOnce = null;
    }

    Signal.prototype.add = function(listener) {
         return this.registerListener(listener);
    };

    Signal.prototype.addOnce = function(listener) {
        return this.registerListener(listener, true);
    };

    Signal.prototype.remove = function(listener) {
        var index = this.find(listener), oIndex = this.find(listener, this.__bindingsOnce);
        if(index >= 0) this.__bindings.splice(index, 1);
        if(oIndex >= 0) this.__bindingsOnce.splice(oIndex, 1);
    };

    Signal.prototype.removeAll = function() {
        this.__bindings = null;
        this.__bindingsOnce = null;
    };

    Signal.prototype.dispatch = function() {
        if(!this.__bindings) return;

        var 
            args = Array.prototype.slice.call(arguments),
            list = this.__bindings,
            copyList = list.concat(),
            listener
        ;

        for (var i = 0, l = copyList.length; i < l; i++) {
            listener = copyList[i];
            listener.apply(null, args);
            if (this.find(listener, this.__bindingsOnce) != -1) this.remove(listener);
        }
    };

    Signal.prototype.getNumListeners = function() {
        if(!this.__bindings) return 0;

        return this.__bindings.length;
    };

    Signal.prototype.registerListener = function(listener, once) {
        if(!this.__bindings) 
        {
            this.__bindings = [];
            this.__bindingsOnce = [];
        }

        var index = this.find(listener);
        if (index == -1 || !once) {
            this.__bindings.push(listener);
            if (once) this.__bindingsOnce.push(listener);
        }
    };

    Signal.prototype.find = function(listener, arr) {
        if(!this.__bindings) return -1;

        arr = arr || this.__bindings;
        if (arr.indexOf) return arr.indexOf(listener);
        for (var i = 0, l = arr.length; i < l; i++) {
            if (arr[i] === listener) return i;
        }
        return -1;
    };

    return Signal;
});