Function.prototype.bind = Function.prototype.bind || function (target) {
    return (args: any) => {
        if (!(args instanceof Array)) {
            args = [args];
        }
        this.apply(target, args);
    };
};
