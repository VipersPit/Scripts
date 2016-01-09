(function () {
    var currentVersion = 1,
        file = "channeldata.json";

    var defaultValues = {
        creator: '',
        topic: '',
        setBy: '',
        members: {},
        auth: {},
        mutes: {},
        bans: {},
        bots: true,
        isPublic: true
    };

    var fields = ["creator", "topic", "setBy", "members", "auth", "mutes", "bans", "bots", "isPublic"];

    function ChannelManager() {
        this.data = {};
        this.version = currentVersion;

        if (sys.fileExists(file)) {
            this.data = JSON.parse(sys.getFileContent(file));
        } else {
            sys.writeToFile(file, "{}");
        }

        if (!this.data.hasOwnProperty('__meta__')) {
            this.data.__meta__ = {version: this.version};
        }

        // Channels can't have a double dash.
        this.version = this.data.__meta__.version || currentVersion;
        return this;
    }

    ChannelManager.prototype.find = function (cname) {
        cname = cname.toLowerCase();
        return this.data[cname];
    };

    ChannelManager.prototype.get = function (cname, key) {
        var chan = this.find(cname);
        if (!chan) {
            return null;
        }
        return chan[key] || defaultValues[key];
    };

    // Expects a SESSION object
    ChannelManager.prototype.populate = function (chan) {
        var name = chan.name.toLowerCase(),
            obj = this.find(name);
        if (!obj) {
            return false;
        }

        var field, len, i;
        for (i = 0, len = fields.length; i < len; i += 1) {
            field = fields[i];
            if (obj.hasOwnProperty(field)) {
                chan[field] = obj[field];
            }
        }

        return true;
    };

    // Expects a SESSION object.
    ChannelManager.prototype.absorb = function (chan) {
        var name = chan.name.toLowerCase(),
            data = (this.data[name] || (this.data[name] = {}));

        var field, len, i;
        for (i = 0, len = fields.length; i < len; i += 1) {
            field = fields[i];
            if (chan.hasOwnProperty(field)) {
                data[field] = chan[field];
            }
        }

        return this;
    };

    ChannelManager.prototype.update = function (cname, key, value) {
        cname = cname.toLowerCase();
        if (!(cname in this.data)) {
            this.data[cname] = {};
        }

        this.data[cname][key] = value;
        return this;
    };

    // Expects a SESSION object
    ChannelManager.prototype.sync = function (chan, key) {
        var cname = chan.name.toLowerCase();
        if (!this.data.hasOwnProperty(cname)) {
            this.data[cname] = {};
        }

        this.data[cname][key] = chan[key];
        return this;
    };

    ChannelManager.prototype.unregister = function (cname) {
        delete this.data[cname.toLowerCase()];
        return this;
    };

    ChannelManager.prototype.save = function () {
        sys.writeToFile(file, JSON.stringify(this.data));
        return this;
    };

    ChannelManager.prototype.dump = function () {
        var dataKeys = Object.keys(this.data);
        return [
            "ChannelManager dump @ " + (new Date()).toUTCString(),
            "Version " + this.version,
            (dataKeys.length - 1) + " channels.", // Exclude __meta__
            dataKeys.length + " keys, being:",
            dataKeys.join(", ")
        ].join("\n");
    };

    exports.ChannelManager = ChannelManager;
    exports.manager = new ChannelManager();
    module.reload = function () {
        module.exports.manager = new ChannelManager();
        return true;
    };
}());
