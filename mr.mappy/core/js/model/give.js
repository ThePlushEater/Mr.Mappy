/// <reference path="..\..\..\Scripts\typings\backbone\backbone.d.ts" />
/// <reference path="..\..\..\Scripts\typings\leaflet\leaflet.d.ts" />
/// <reference path="..\..\..\Scripts\typings\moment\moment.d.ts" />
/// <reference path="..\controller\setting.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ForagingMap;
(function (ForagingMap) {
    var Give = (function (_super) {
        __extends(Give, _super);
        function Give(attributes, options) {
            _super.call(this, attributes, options);
            this.url = "core/php/give.php";
            this.isSavable = true;
            var that = this;
            this.url = ForagingMap.Setting.BASE_URL + this.url;
            this.defaults = {
                "tid": 0,
                "gid": 0,
                "name": "",
                "desc": "",
                "amount": "",
                "date": moment(new Date()).format(FMS.getDateTimeFormat()),
                "update": moment(new Date()).format(FMS.getDateTimeFormat()),
            };
            that.off("change");
            that.on("change", function (model, options) {
                if (that.isSavable == false)
                    return;
                that.isSavable = false;
                model.save({}, {
                    success: function (model, response) {
                        model.isSavable = true;
                        FMC.fetchItems(FMV.getMapView().getMapBounds());
                        FMV.getMsgView().renderSuccess("'" + model.get("name") + "' " + FML.getViewUIDataSaveSuccessMsg());
                    },
                    error: function (error) {
                        FMV.getMsgView().renderError(FML.getViewUIInfoSaveErrorMsg());
                    },
                });
            });
        }
        Give.prototype.parse = function (response, options) {
            if (response.id != null) {
                response.id = parseInt(response.id);
            }
            response.tid = parseInt(response.tid);
            response.gid = parseInt(response.gid);
            response.amount = parseFloat(response.amount);
            response.date = moment(response.date).format(FMS.getDateTimeFormat());
            response.update = moment(response.update).format(FMS.getDateTimeFormat());
            return _super.prototype.parse.call(this, response, options);
        };
        Give.prototype.toJSON = function (options) {
            var clone = this.clone().attributes;
            if (this.id != null) {
                clone["id"] = this.id;
            }
            return clone;
        };
        Give.prototype.setIsSavable = function (isSavable) {
            this.isSavable = isSavable;
        };
        Give.prototype.getIsSavable = function () {
            return this.isSavable;
        };
        return Give;
    })(Backbone.Model);
    ForagingMap.Give = Give;
    var Gives = (function (_super) {
        __extends(Gives, _super);
        function Gives(models, options) {
            _super.call(this, models, options);
            this.url = "core/php/gives.php";
            this.model = Give;
            this.url = ForagingMap.Setting.BASE_URL + this.url;
        }
        return Gives;
    })(Backbone.Collection);
    ForagingMap.Gives = Gives;
})(ForagingMap || (ForagingMap = {}));
