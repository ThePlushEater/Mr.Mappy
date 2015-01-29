/// <reference path="..\..\..\Scripts\typings\backbone\backbone.d.ts" />
/// <reference path="..\..\..\Scripts\typings\leaflet\leaflet.d.ts" />
/// <reference path="..\..\..\Scripts\typings\moment\moment.d.ts" />
/// <reference path="..\controller\setting.ts" />

module ForagingMap {
    export class Give extends Backbone.Model {
        url: string = "core/php/give.php";
        isSavable: boolean = true;
        constructor(attributes?: any, options?: any) {
            super(attributes, options);
            var that: Give = this;
            this.url = Setting.BASE_URL + this.url;
            this.defaults = <any>{
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
                if (that.isSavable == false) return;
                that.isSavable = false;
                model.save(
                    {},
                    {
                        success: function (model: Give, response: any) {
                            model.isSavable = true;
                            FMC.fetchItems(FMV.getMapView().getMapBounds());
                            FMV.getMsgView().renderSuccess("'" + model.get("name") + "' " + FML.getViewUIDataSaveSuccessMsg());
                        },
                        error: function (error) {
                            FMV.getMsgView().renderError(FML.getViewUIInfoSaveErrorMsg());
                        },
                    }
                    );
            });
        }
        parse(response: any, options?: any): any {
            if (response.id != null) {
                response.id = parseInt(response.id);
            }
            response.tid = parseInt(response.tid);
            response.gid = parseInt(response.gid);
            response.amount = parseFloat(response.amount);
            response.date = moment(response.date).format(FMS.getDateTimeFormat());
            response.update = moment(response.update).format(FMS.getDateTimeFormat());
            return super.parse(response, options);
        }
        toJSON(options?: any): any {
            var clone = this.clone().attributes;
            if (this.id != null) {
                clone["id"] = this.id;
            }
            return clone;
        }
        setIsSavable(isSavable: boolean): void {
            this.isSavable = isSavable;
        }
        getIsSavable(): boolean {
            return this.isSavable;
        }
    }
    export class Gives extends Backbone.Collection<Give> {
        url: string = "core/php/gives.php";
        constructor(models?: Give[], options?: any) {
            super(models, options);
            this.model = Give;
            this.url = Setting.BASE_URL + this.url;
        }
        /*
        getCurrentBend(curDate: string): Give {
            var that: Gives = this;
            var curDateValue = moment(curDate).valueOf();
            if (that.models.length == 0) {
                return null;
            } else {
                var result: Give = that.models[0];
                $.each(that.models, function (index: number, model: Give) {
                    var dateValue = moment(model.get("date")).valueOf();
                    var resultValue = moment(result.get("date")).valueOf();
                    if (curDateValue >= dateValue && resultValue <= dateValue) {
                        result = model;
                    }
                });
                return result;
            }
        }
        */
    }
}