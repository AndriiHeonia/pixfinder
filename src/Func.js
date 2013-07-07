P.Func = {

    // see http://en.wikipedia.org/wiki/Currying
    curry: function (func) {

        var args = arguments, curryArgs = [];
     
        if (typeof func !== 'function') {
            throw new Error('First argument is not a function');
        }
     
        for (var i = 1; i < args.length; i++) {
            curryArgs[i - 1] = args[i];
        }
     
        return function () {
            // convert arguments to array
            var argsArr = Array.prototype.slice.call(arguments, 0);    
     
            curryArgs = curryArgs.concat(argsArr);
            return func.apply(this, curryArgs);
        }
    
    }

};