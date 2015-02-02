/// <reference path="..\..\..\Scripts\typings\jquery\jquery.d.ts" />
/// <reference path="..\..\..\Scripts\typings\leaflet\leaflet.d.ts" />
/// <reference path="router.ts" />
/// <reference path="..\view\view.ts" />
var ForagingMap;
(function (ForagingMap) {
    var Controller = (function () {
        function Controller() {
            // intialize router
            this.router = new ForagingMap.Router();
        }
        Controller.prototype.initialize = function () {
            // intialize view
            FMV = new ForagingMap.View({ el: $("#fm-view-main") });
            // intialize model
            FMM = new ForagingMap.Model();
            // fetch layer info
            FMC.fetchLayers();
            FMC.addKeyEventListener();
        };
        Controller.prototype.getRouter = function () {
            return this.router;
        };
        Controller.prototype.setSelectedItem = function (item) {
            this.selectedItem = item;
        };
        Controller.prototype.getSelectedItem = function () {
            return this.selectedItem;
        };
        Controller.prototype.hasSelectedItem = function () {
            if (this.selectedItem != null) {
                return true;
            }
            return false;
        };
        Controller.prototype.addKeyEventListener = function () {
            $(document).keyup(function (e) {
                if (e.keyCode == 27) {
                    if (FMV.getUIView().getMode() != 1 /* ADD */) {
                        FMV.getUIView().hide();
                        FMV.getMapView().resize(false);
                        FMV.getMapView().getMarkersView().inactiveMarkers();
                        FMV.getMapView().getControlView().resetControls();
                    }
                }
            });
        };
        Controller.prototype.fetchLayers = function () {
            FMM.getLayers().fetch({
                remove: false,
                processData: true,
                success: function (collection, response, options) {
                    //console.log("success fetch with " + collection.models.length + " layers");
                    // render view
                    FMV.render();
                    // start routing
                    Backbone.history.start();
                },
                error: function (collection, jqxhr, options) {
                },
            });
        };
        Controller.prototype.fetchItems = function (bounds) {
            var that = this;
            FMM.getItems().fetch({
                remove: false,
                processData: true,
                data: {
                    south: bounds.getSouthEast().lat,
                    north: bounds.getNorthEast().lat,
                    west: bounds.getSouthWest().lng,
                    east: bounds.getSouthEast().lng,
                },
                success: function (collection, response, options) {
                    //console.log("success fetch with " + collection.models.length + " items");
                    FMV.getMapView().getMarkersView().render();
                    that.fetchGives(FMM.getItems().getIdsToString());
                    /*
                    $.each(collection.models, function (index: number, model: Backbone.Model) {
                        console.log(model);
                    });
                    */
                },
                error: function (collection, jqxhr, options) {
                }
            });
        };
        Controller.prototype.createItem = function () {
            var item = new ForagingMap.Item({
                name: "New Item",
                desc: "",
                type: 0 /* None */,
                sort: 0,
                amount: 0,
                lat: FMV.getMapView().getMap().getCenter().lat,
                lng: FMV.getMapView().getMap().getCenter().lng,
                date: moment(new Date()).format(FMS.getDateTimeFormat()),
                update: moment(new Date()).format(FMS.getDateTimeFormat()),
            });
            FMM.getItems().add(item);
            return item;
        };
        Controller.prototype.removeItem = function (item) {
            FMM.getItems().remove(item);
            return item;
        };
        Controller.prototype.fetchPictures = function (pid) {
            FMM.getPictures().fetch({
                remove: true,
                processData: true,
                data: {
                    pid: pid,
                },
                success: function (collection, response, options) {
                    //console.log("success fetch with " + collection.models.length + " pictures");
                },
                error: function (collection, jqxhr, options) {
                }
            });
        };
        Controller.prototype.fetchGives = function (pids) {
            var that = this;
            FMM.getGives().fetch({
                remove: false,
                processData: true,
                data: {
                    pids: pids,
                },
                success: function (collection, response, options) {
                    //console.log("success fetch with " + collection.models.length + " gives");
                    FMV.getMapView().getMarkersView().renderPaths();
                    if (!FMV.getMapView().getMarkersView().getIsSelectable()) {
                        FMV.getMapView().getMarkersView().setIsSelectable(true);
                    }
                    //that.fetchThresholds(FMM.getItems().getIdsToString());
                },
                error: function (collection, jqxhr, options) {
                }
            });
        };
        return Controller;
    })();
    ForagingMap.Controller = Controller;
})(ForagingMap || (ForagingMap = {}));
