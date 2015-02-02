var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="..\..\..\Scripts\typings\backbone\backbone.d.ts" />
/// <reference path="..\..\..\Scripts\typings\leaflet\leaflet.d.ts" />
/// <reference path="template.ts" />
var UIMode;
(function (UIMode) {
    UIMode[UIMode["NONE"] = 0] = "NONE";
    UIMode[UIMode["ADD"] = 1] = "ADD";
    UIMode[UIMode["INFO"] = 2] = "INFO";
    UIMode[UIMode["DATA"] = 3] = "DATA";
    UIMode[UIMode["PICTURE"] = 4] = "PICTURE";
    UIMode[UIMode["LAYER"] = 5] = "LAYER";
})(UIMode || (UIMode = {}));
var ForagingMap;
(function (ForagingMap) {
    var UIView = (function (_super) {
        __extends(UIView, _super);
        function UIView(options) {
            _super.call(this, options);
            this.setElement(options.el);
            this.setIsLocked(false);
            this.setMode(0 /* NONE */);
            this.resize();
            this.hide();
            this.createLayerCheckList();
            this.isLayerCollapsedIn = false;
        }
        UIView.prototype.createLayerCheckList = function () {
            this.layerHeaderList = new Array();
            this.layerHeaderList[1] = true; // event
            this.layerHeaderList[2] = true; // organization
            this.layerHeaderList[3] = true; // donor
            this.layerBodyList = new Array();
            this.layerBodyList[0] = true;
        };
        UIView.prototype.updateLayerCheckList = function () {
            var that = this;
            $.each(FMM.getLayers().models, function (index, model) {
                if (that.layerBodyList[parseInt(model.get("id"))] == null) {
                    that.layerBodyList[parseInt(model.get("id"))] = true;
                }
            });
        };
        UIView.prototype.updateLayer = function () {
            FMV.getMapView().getMarkersView().renderLayers(this.layerBodyList);
        };
        UIView.prototype.setMode = function (mode) {
            this.mode = mode;
            if (this.mode == 1 /* ADD */) {
                this.setIsLocked(true);
            }
            else {
                this.setIsLocked(false);
            }
        };
        UIView.prototype.getMode = function () {
            return this.mode;
        };
        UIView.prototype.resize = function () {
            if (FMV.getOrigWidth() < 540) {
                this.$el.css({ width: FMV.getOrigWidth() - 40 });
            }
        };
        UIView.prototype.show = function (mode) {
            this.setMode(mode);
            this.setIsOpen(true);
            this.$el.removeClass("hidden");
            this.render();
        };
        UIView.prototype.hide = function () {
            this.setMode(0 /* NONE */);
            this.setIsOpen(false);
            this.$el.addClass("hidden");
            this.setIsLocked(false);
            if (FMV.getMapView().getMap()) {
                FMV.getMapView().getMap().dragging.enable();
            }
        };
        UIView.prototype.setIsLocked = function (isLocked) {
            this.isLocked = isLocked;
        };
        UIView.prototype.getIsLocked = function () {
            return this.isLocked;
        };
        UIView.prototype.setIsOpen = function (isOpen) {
            this.isOpen = isOpen;
        };
        UIView.prototype.getIsOpen = function () {
            return this.isOpen;
        };
        UIView.prototype.getOuterWidth = function () {
            return this.$el.outerWidth();
        };
        UIView.prototype.render = function () {
            switch (this.mode) {
                case 0 /* NONE */:
                    break;
                case 2 /* INFO */:
                    this.renderUIInfo();
                    break;
                case 3 /* DATA */:
                    this.renderUIDataLayer();
                    break;
                case 1 /* ADD */:
                    this.renderUIAdd();
                    break;
                case 5 /* LAYER */:
                    this.renderUILayer();
                    break;
                case 4 /* PICTURE */:
                    this.renderUIPicture();
                default:
                    break;
            }
        };
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        UIView.prototype.renderUIAdd = function () {
            var that = this;
            var template = _.template(FMUIAddLayerTemplate);
            var data = {
                "header": FML.getViewUIAddHeader(),
                "name": FMC.getSelectedItem().get("name"),
                "desc": FMC.getSelectedItem().get("desc"),
                "type": FMC.getSelectedItem().get("type"),
                "sort": FMC.getSelectedItem().get("sort"),
                "date": FMC.getSelectedItem().get("date"),
                "lat": FMC.getSelectedItem().get("lat"),
                "lng": FMC.getSelectedItem().get("lng"),
                "sort1": FMM.getLayers().where({ type: 1 }),
                "sort2": FMM.getLayers().where({ type: 2 }),
                "sort3": FMM.getLayers().where({ type: 3 }),
            };
            that.$el.html(template(data));
            // render type selection
            that.$('#item-info-type').selectpicker();
            // remove event listeners
            that.$("#item-info-amount").off("change");
            that.$("#item-info-lat").off("change");
            that.$("#item-info-lng").off("change");
            that.$("#item-info-btn-edit").off("click");
            that.$("#item-info-btn-delete").off("click");
            that.$("#item-info-date-picker").off("dp.change");
            // add event listeners
            that.$("#item-info-lat").on("change", function () {
                FMC.getSelectedItem().set({ lat: parseFloat($(this).val()) });
                FMV.getMapView().getMarkersView().updateMarker(FMC.getSelectedItem());
            });
            that.$("#item-info-lng").on("change", function () {
                FMC.getSelectedItem().set({ lng: parseFloat($(this).val()) });
                FMV.getMapView().getMarkersView().updateMarker(FMC.getSelectedItem());
            });
            that.$('#item-info-type').on("change", function () {
                var optionSelected = $("option:selected", this);
                FMC.getSelectedItem().set({ type: parseInt(optionSelected.attr("data-type")) });
                FMC.getSelectedItem().set({ sort: parseInt(optionSelected.attr("data-sort")) });
            });
            that.$("#item-info-date-picker").datetimepicker({
                format: FMS.getDateTimeFormat(),
            });
            that.$("#item-info-date-picker").on("dp.change", function () {
                FMC.getSelectedItem().set({ date: $(this).data('date') });
                console.log(FMC.getSelectedItem().get("date"));
            });
            that.$("#item-info-btn-edit").on("click", function () {
                if (FMC.getSelectedItem().get("type") == 0 /* None */) {
                    FMV.getMsgView().renderError(FML.getViewUIAddTypeSelectError());
                }
                else {
                    FMC.getSelectedItem().setIsRemoved(true);
                    FMV.getMapView().getMarkersView().removeMarker(FMC.getSelectedItem());
                    FMC.getSelectedItem().save({
                        name: that.$("#item-info-name").val(),
                        desc: that.$("#item-info-desc").val(),
                    }, {
                        success: function (model, response) {
                            FMV.getMapView().getControlView().resetControls();
                            if (FMC.hasSelectedItem()) {
                                FMV.getUIView().hide();
                                FMV.getMapView().resize(false);
                                FMC.getSelectedItem().setIsRemoved(false);
                                FMV.getMapView().getMarkersView().render();
                                FMV.getMsgView().renderSuccess("'" + model.get("name") + "' " + FML.getViewUIInfoSaveSuccessMsg());
                            }
                        },
                        error: function (error) {
                            FMV.getMsgView().renderError(FML.getViewUIInfoSaveErrorMsg());
                        },
                    });
                }
            });
            that.$("#item-info-btn-delete").on("click", function () {
                FMV.getMapView().getControlView().resetControls();
                if (FMC.hasSelectedItem()) {
                    var item = FMC.removeItem(FMC.getSelectedItem());
                    item.setIsRemoved(true);
                    FMV.getMapView().getMarkersView().removeMarker(item);
                    FMC.setSelectedItem(null);
                    FMV.getUIView().hide();
                    FMV.getMapView().resize(false);
                }
            });
        };
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        UIView.prototype.renderUIInfo = function () {
            var that = this;
            var template = _.template(FMUIInfoLayerTemplate);
            var data = {
                "header": FML.getViewUIInfoHeader(),
                "id": FMC.getSelectedItem().get("id"),
                "name": FMC.getSelectedItem().get("name"),
                "desc": FMC.getSelectedItem().get("desc"),
                "amount": FMC.getSelectedItem().get("amount"),
                "type": FMC.getSelectedItem().get("type"),
                "sort": FMC.getSelectedItem().get("sort"),
                "lat": FMC.getSelectedItem().get("lat"),
                "lng": FMC.getSelectedItem().get("lng"),
                "date": FMC.getSelectedItem().get("date"),
                "update": FMC.getSelectedItem().get("update"),
                "sort1": FMM.getLayers().where({ type: 1 }),
                "sort2": FMM.getLayers().where({ type: 2 }),
                "sort3": FMM.getLayers().where({ type: 3 }),
            };
            that.$el.html(template(data));
            // render type selection
            that.$('#item-info-type').selectpicker();
            that.$('#item-info-type option').each(function () {
                if ((FMC.getSelectedItem().get("type") == $(this).attr("data-type")) && (FMC.getSelectedItem().get("sort") == $(this).attr("data-sort"))) {
                    that.$('#item-info-type').selectpicker("val", $(this).val());
                }
            });
            // remove event listeners
            that.$("#item-info-amount").off("change");
            that.$("#item-info-lat").off("change");
            that.$("#item-info-lng").off("change");
            that.$("#item-info-btn-edit").off("click");
            that.$("#item-info-btn-delete").off("click");
            that.$("#item-info-date-picker").off("dp.change");
            // add event listeners
            that.$("#item-info-amount").on("change", function () {
                FMC.getSelectedItem().save({
                    amount: parseFloat($(this).val()),
                }, {
                    success: function (model, response) {
                        FMV.getMapView().getMarkersView().updateMarker(FMC.getSelectedItem());
                        FMV.getMsgView().renderSuccess("'" + model.get("name") + "' " + FML.getViewUIInfoSaveSuccessMsg());
                    },
                    error: function (error) {
                        FMV.getMsgView().renderError(FML.getViewUIInfoSaveErrorMsg());
                    },
                });
            });
            that.$("#item-info-lat").on("change", function () {
                FMC.getSelectedItem().save({
                    lat: parseFloat($(this).val()),
                }, {
                    success: function (model, response) {
                        FMV.getMapView().getMarkersView().updateMarker(FMC.getSelectedItem());
                        FMV.getMsgView().renderSuccess("'" + model.get("name") + "' " + FML.getViewUIInfoSaveSuccessMsg());
                    },
                    error: function (error) {
                        FMV.getMsgView().renderError(FML.getViewUIInfoSaveErrorMsg());
                    },
                });
            });
            that.$("#item-info-lng").on("change", function () {
                FMC.getSelectedItem().save({
                    lng: parseFloat($(this).val()),
                }, {
                    success: function (model, response) {
                        FMV.getMapView().getMarkersView().updateMarker(FMC.getSelectedItem());
                        FMV.getMsgView().renderSuccess("'" + model.get("name") + "' " + FML.getViewUIInfoSaveSuccessMsg());
                    },
                    error: function (error) {
                        FMV.getMsgView().renderError(FML.getViewUIInfoSaveErrorMsg());
                    },
                });
            });
            that.$("#item-info-date-picker").datetimepicker({
                format: FMS.getDateTimeFormat(),
            });
            that.$("#item-info-date-picker").on("dp.change", function () {
                FMC.getSelectedItem().set({ date: $(this).data('date') });
                console.log(FMC.getSelectedItem().get("date"));
            });
            // save & delete
            that.$("#item-info-btn-edit").on("click", function () {
                var optionSelected = $("option:selected", that.$('#item-info-type'));
                if (parseInt(optionSelected.attr("data-type")) != 0 && parseInt(optionSelected.attr("data-sort")) != 0) {
                    FMV.getMapView().getMarkersView().removeMarker(FMC.getSelectedItem());
                    FMC.getSelectedItem().save({
                        id: that.$("#item-info-id").val(),
                        name: that.$("#item-info-name").val(),
                        desc: that.$("#item-info-desc").val(),
                        type: parseInt(optionSelected.attr("data-type")),
                        sort: parseInt(optionSelected.attr("data-sort")),
                        amount: that.$("#item-info-amount").val(),
                        lat: that.$("#item-info-lat").val(),
                        lng: that.$("#item-info-lng").val(),
                    }, {
                        success: function (model, response) {
                            FMV.getMapView().getMarkersView().render();
                            FMV.getMsgView().renderSuccess("'" + model.get("name") + "' " + FML.getViewUIInfoSaveSuccessMsg());
                        },
                        error: function (error) {
                            FMV.getMsgView().renderError(FML.getViewUIInfoSaveErrorMsg());
                        },
                    });
                }
                else {
                    FMV.getMsgView().renderError(FML.getViewUIAddTypeSelectError());
                }
            });
            that.$("#item-info-btn-delete").on("click", function () {
                var r = confirm(FML.getViewUIInfoDeleteConfirmMsg());
                if (r == true) {
                    FMC.getSelectedItem().destroy({
                        wait: true,
                        success: function (model, response) {
                            model.setIsRemoved(true);
                            FMM.getItems().remove(model);
                            FMV.getMapView().getMarkersView().removeMarker(model);
                            FMV.getMapView().getControlView().resetControls();
                            FMV.getUIView().hide();
                            FMV.getMapView().resize(false);
                            FMV.getMapView().getMarkersView().render();
                            FMV.getMsgView().renderSuccess("'" + model.get("name") + "' " + FML.getViewUIInfoDeleteSuccessMsg());
                        },
                        error: function (error) {
                            FMV.getMsgView().renderError(FML.getViewUIInfoDeleteErrorMsg());
                        },
                    });
                }
            });
        };
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        UIView.prototype.renderUIPicture = function () {
            FMC.fetchPictures(parseInt(FMC.getSelectedItem().get('id')));
            var that = this;
            var template = _.template(FMViewUILayerPictureTemplate);
            var data = {
                "header": FML.getViewUIPictureHeader(),
            };
            that.$el.html(template(data));
            // Grid instance for data
            var gridData = new Backgrid.Grid({
                columns: pictureColumn,
                collection: FMM.getPictures(),
                emptyText: FML.getViewUIDataNoDataMsg(),
            });
            gridData.render();
            gridData.sort("date", "descending");
            that.$(".ui-body").append(gridData.el);
            setTimeout(function () {
                gridData.sort("date", "descending");
            }, 3000);
            // Grid instance for add Picture
            var picture = new ForagingMap.Picture({ pid: parseInt(FMC.getSelectedItem().get("id")), date: moment(new Date()).format(FMS.getDateTimeFormat()), update: moment(new Date()).format(FMS.getDateTimeFormat()) });
            picture.setIsSavable(false);
            var pictures = new ForagingMap.Pictures();
            pictures.add(picture);
            var gridAddData = new Backgrid.Grid({
                columns: pictureAddColumn,
                collection: pictures,
                emptyText: FML.getViewUIDataNoDataMsg(),
            });
            that.$("#picture-add-panel").append(gridAddData.render().el);
        };
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        UIView.prototype.renderUILayer = function () {
            var that = this;
            var isIn = "";
            if (that.isLayerCollapsedIn) {
                isIn = "in";
            }
            var template = _.template(FMViewLayerTemplate);
            var data = {
                "header": FML.getViewUILayerHeader(),
                "isIn": isIn,
                "sort1": FMM.getLayers().where({ type: 1 }),
                "sort2": FMM.getLayers().where({ type: 2 }),
                "sort3": FMM.getLayers().where({ type: 3 }),
            };
            that.$el.html(template(data));
            that.updateLayerCheckList();
            if (that.layerHeaderList[1]) {
                $("#check-event-layer").prop({ "checked": true });
            }
            else {
                $("#check-event-layer").prop({ "checked": false });
            }
            if (that.layerHeaderList[2]) {
                $("#check-organization-layer").prop({ "checked": true });
            }
            else {
                $("#check-organization-layer").prop({ "checked": false });
            }
            if (that.layerHeaderList[3]) {
                $("#check-donor-layer").prop({ "checked": true });
            }
            else {
                $("#check-donor-layer").prop({ "checked": false });
            }
            $("#check-event-layer").click(function () {
                that.layerHeaderList[1] = $(this).prop("checked");
                if ($(this).prop("checked")) {
                    $('input[type="checkbox"][data-type="' + 1 + '"]', that.$el).each(function () {
                        $(this).prop({ "checked": true });
                        that.layerBodyList[parseInt($(this).attr("data-sort"))] = $(this).prop("checked");
                    });
                }
                else {
                    $('input[type="checkbox"][data-type="' + 1 + '"]', that.$el).each(function () {
                        $(this).prop({ "checked": false });
                        that.layerBodyList[parseInt($(this).attr("data-sort"))] = $(this).prop("checked");
                    });
                }
            });
            $("#check-organization-layer").click(function () {
                that.layerHeaderList[2] = $(this).prop("checked");
                if ($(this).prop("checked")) {
                    $('input[type="checkbox"][data-type="' + 2 + '"]', that.$el).each(function () {
                        $(this).prop({ "checked": true });
                        that.layerBodyList[parseInt($(this).attr("data-sort"))] = $(this).prop("checked");
                    });
                }
                else {
                    $('input[type="checkbox"][data-type="' + 2 + '"]', that.$el).each(function () {
                        $(this).prop({ "checked": false });
                        that.layerBodyList[parseInt($(this).attr("data-sort"))] = $(this).prop("checked");
                    });
                }
            });
            $("#check-donor-layer").click(function () {
                that.layerHeaderList[3] = $(this).prop("checked");
                if ($(this).prop("checked")) {
                    $('input[type="checkbox"][data-type="' + 3 + '"]', that.$el).each(function () {
                        $(this).prop({ "checked": true });
                        that.layerBodyList[parseInt($(this).attr("data-sort"))] = $(this).prop("checked");
                    });
                }
                else {
                    $('input[type="checkbox"][data-type="' + 3 + '"]', that.$el).each(function () {
                        $(this).prop({ "checked": false });
                        that.layerBodyList[parseInt($(this).attr("data-sort"))] = $(this).prop("checked");
                    });
                }
            });
            if (that.layerBodyList[0]) {
                $("#check-unassigned-layer").prop({ "checked": true });
            }
            else {
                $("#check-unassigned-layer").prop({ "checked": false });
            }
            $("#check-unassigned-layer").click(function () {
                that.layerBodyList[parseInt($(this).attr("data-sort"))] = $(this).prop("checked");
            });
            $('input[type="checkbox"]', that.$el).each(function (index, element) {
                if (that.layerBodyList[parseInt($(this).attr("data-sort"))]) {
                    $(this).prop({ "checked": true });
                }
                else {
                    $(this).prop({ "checked": false });
                }
            });
            $('input[type="checkbox"]', that.$el).click(function () {
                that.layerBodyList[parseInt($(this).attr("data-sort"))] = $(this).prop("checked");
                that.updateLayer();
            });
            // collapsed in
            that.$('button[data-target="#layer-add-panel"]').click(function () {
                that.isLayerCollapsedIn = !that.isLayerCollapsedIn;
            });
            // Grid instance for data
            layerColumn[0].cell = Backgrid.SelectCell.extend({
                optionValues: FMM.getTypes().toArray(),
            });
            var gridData = new Backgrid.Grid({
                columns: layerColumn,
                collection: FMM.getLayers(),
                emptyText: FML.getViewUIDataNoDataMsg(),
            });
            gridData.render();
            gridData.sort("name", "ascending");
            that.$(".ui-body #layer-list-grid").append(gridData.el);
            // Grid instance for adding
            layerAddColumn[0].cell = Backgrid.SelectCell.extend({
                optionValues: FMM.getTypes().toArray(),
            });
            var layer = new ForagingMap.Layer({ name: "", desc: "", type: 1 });
            layer.setIsSavable(false);
            var layers = new ForagingMap.Layers();
            layers.add(layer);
            var gridAddData = new Backgrid.Grid({
                columns: layerAddColumn,
                collection: layers,
                emptyText: FML.getViewUIDataNoDataMsg(),
            });
            that.$(".ui-body #layer-add-grid").append(gridAddData.render().el);
        };
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        ///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        UIView.prototype.renderUIDataLayer = function () {
            var that = this;
            if (parseInt(FMC.getSelectedItem().get("type")) != 3) {
                var template = _.template(FMViewUIDataTemplate);
                var data = {
                    "header": FML.getViewUIDataHeader(),
                };
                that.$el.html(template(data));
                // Grid instance for data
                var items = new ForagingMap.Items();
                items.add(FMM.getItems().where({ type: 2 }));
                items.add(FMM.getItems().where({ type: 3 }));
                dataColumn[0].cell = Backgrid.SelectCell.extend({
                    optionValues: items.toArray(),
                });
                var gridData = new Backgrid.Grid({
                    columns: dataColumn,
                    collection: new ForagingMap.Gives(FMM.getGives().where({ tid: FMC.getSelectedItem().get("id") })),
                    emptyText: FML.getViewUIDataNoDataMsg(),
                });
                gridData.render();
                gridData.sort("date", "descending");
                that.$(".ui-body").append(gridData.el);
                // Grid instance for adding
                dataAddColumn[0].cell = Backgrid.SelectCell.extend({
                    optionValues: items.toArray(),
                });
                var give = new ForagingMap.Give({ tid: FMC.getSelectedItem().get("id"), gid: 0, name: "", desc: "", amount: 0, date: moment(new Date()).format(FMS.getDateTimeFormat()), update: moment(new Date()).format(FMS.getDateTimeFormat()) });
                give.setIsSavable(false);
                var gives = new ForagingMap.Gives();
                gives.add(give);
                var gridAddData = new Backgrid.Grid({
                    columns: dataAddColumn,
                    collection: gives,
                    emptyText: FML.getViewUIDataNoDataMsg(),
                });
                that.$(".ui-body #data-add-panel").append(gridAddData.render().el);
            }
            else {
                var template = _.template(FMViewUIDataTemplateDonor);
                var data = {
                    "header": FML.getViewUIDataHeader(),
                };
                that.$el.html(template(data));
            }
        };
        return UIView;
    })(Backbone.View);
    ForagingMap.UIView = UIView;
})(ForagingMap || (ForagingMap = {}));
