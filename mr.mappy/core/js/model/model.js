var ForagingMap;
(function (ForagingMap) {
    var Model = (function () {
        function Model() {
            this.layers = new ForagingMap.Layers();
            this.items = new ForagingMap.Items();
            this.gives = new ForagingMap.Gives();
            this.pictures = new ForagingMap.Pictures();
            this.types = new ForagingMap.Types();
            this.types.add(new ForagingMap.Type({ name: "Event", type: 1 }));
            this.types.add(new ForagingMap.Type({ name: "Organization", type: 2 }));
            this.types.add(new ForagingMap.Type({ name: "Donor", type: 3 }));
        }
        Model.prototype.getTypes = function () {
            return this.types;
        };
        Model.prototype.getLayers = function () {
            return this.layers;
        };
        Model.prototype.getItems = function () {
            return this.items;
        };
        Model.prototype.getPictures = function () {
            return this.pictures;
        };
        Model.prototype.getGives = function () {
            return this.gives;
        };
        return Model;
    })();
    ForagingMap.Model = Model;
})(ForagingMap || (ForagingMap = {}));
