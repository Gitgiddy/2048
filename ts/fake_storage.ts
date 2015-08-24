class FakeStorage {
    private _data: {};

    setItem(id: string, val: any) {
        return (<any>this._data)[id] = String(val);
    };

    getItem(id: string) {
        return this._data.hasOwnProperty(id) ? (<any>this._data)[id] : undefined;
    };

    removeItem(id: string) {
        return delete (<any>this._data)[id];
    };

    clear() {
        return this._data = {};
    };
};