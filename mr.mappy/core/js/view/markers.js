var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ForagingMap;
(function (ForagingMap) {
    var MarkersView = (function (_super) {
        __extends(MarkersView, _super);
        function MarkersView(options) {
            _super.call(this, options);
            var that = this;
            this.isSelectable = false;
            // initialize marker layer groups
            that.markerGroups = new Array();
            that.circleGroups = new Array();
            that.pathGroups = new Array();
            var circleGroup = new L.FeatureGroup();
            var markerGroup = new L.FeatureGroup();
            var pathGroup = new L.FeatureGroup();
            circleGroup.sid = 0;
            markerGroup.sid = 0;
            pathGroup.sid = 0;
            that.markerGroups.push(circleGroup);
            that.circleGroups.push(markerGroup);
            that.pathGroups.push(pathGroup);
            $.each(FMM.getLayers().models, function (index, model) {
                var circleGroup = new L.FeatureGroup();
                var markerGroup = new L.FeatureGroup();
                var pathGroup = new L.FeatureGroup();
                circleGroup.sid = parseInt(model.id);
                markerGroup.sid = parseInt(model.id);
                that.markerGroups.push(circleGroup);
                that.circleGroups.push(markerGroup);
                that.pathGroups.push(pathGroup);
            });
            $.each(that.markerGroups, function (index, iLayer) {
                iLayer.addTo(FMV.getMapView().getMap());
            });
            $.each(that.circleGroups, function (index, iLayer) {
                iLayer.addTo(FMV.getMapView().getMap());
            });
            $.each(that.pathGroups, function (index, iLayer) {
                iLayer.addTo(FMV.getMapView().getMap());
            });
            // intialize icon
            that.iconBlank = new L.Icon({
                iconUrl: ForagingMap.Setting.BASE_URL + FMS.getImageDir() + FMS.getImageMarkerBlank(),
                shadowUrl: ForagingMap.Setting.BASE_URL + FMS.getImageDir() + FMS.getImageMarkerShadow(),
                iconSize: new L.Point(40, 40),
                iconAnchor: new L.Point(20, 40),
                shadowAnchor: new L.Point(9, 38),
                popupAnchor: new L.Point(0, -40),
            });
            that.iconHeart = new L.Icon({
                iconUrl: ForagingMap.Setting.BASE_URL + FMS.getImageDir() + FMS.getImageMarkerHeart(),
                shadowUrl: ForagingMap.Setting.BASE_URL + FMS.getImageDir() + FMS.getImageMarkerShadow(),
                iconSize: new L.Point(40, 40),
                iconAnchor: new L.Point(20, 40),
                shadowAnchor: new L.Point(9, 38),
                popupAnchor: new L.Point(0, -40),
            });
            that.iconDollar = new L.Icon({
                iconUrl: ForagingMap.Setting.BASE_URL + FMS.getImageDir() + FMS.getImageMarkerDollar(),
                shadowUrl: ForagingMap.Setting.BASE_URL + FMS.getImageDir() + FMS.getImageMarkerShadow(),
                iconSize: new L.Point(40, 40),
                iconAnchor: new L.Point(20, 40),
                shadowAnchor: new L.Point(9, 38),
                popupAnchor: new L.Point(0, -40),
            });
            that.iconNew = new L.Icon({
                iconUrl: ForagingMap.Setting.BASE_URL + FMS.getImageDir() + FMS.getImageMarkerNew(),
                shadowUrl: ForagingMap.Setting.BASE_URL + FMS.getImageDir() + FMS.getImageMarkerShadow(),
                iconSize: new L.Point(40, 40),
                iconAnchor: new L.Point(20, 40),
                shadowAnchor: new L.Point(9, 38),
                popupAnchor: new L.Point(0, -40),
            });
        }
        MarkersView.prototype.render = function () {
            var that = this;
            $.each(FMM.getItems().models, function (index, item) {
                if (!item.getIsRemoved()) {
                    if (item.marker == null && item.circle == null) {
                        //console.log("create new marker with type: " + (item.get("type")));
                        if (item.get("type") == 0 /* None */) {
                            item.marker = new L.Marker(new L.LatLng(parseFloat(item.get("lat")), parseFloat(item.get("lng"))), {
                                icon: that.iconNew,
                                draggable: false,
                                riseOnHover: true,
                            }).bindPopup(item.get("name"), {
                                closeButton: false,
                            });
                            item.circle = new L.Circle(new L.LatLng(parseFloat(item.get("lat")), parseFloat(item.get("lng"))), parseFloat(item.get("amount")) * FMS.getCircleRadiusMultiplier(), {
                                color: FMS.getTempCircleColor(),
                                fillColor: FMS.getTempCircleColor(),
                                fillOpacity: FMS.getInactiveAlpha(),
                                weight: 1,
                            });
                        }
                        else if (item.get("type") == 1 /* Event */) {
                            item.marker = new L.Marker(new L.LatLng(parseFloat(item.get("lat")), parseFloat(item.get("lng"))), {
                                icon: that.iconBlank,
                                draggable: false,
                                riseOnHover: true,
                            }).bindPopup(item.get("name"), {
                                closeButton: false,
                            });
                            item.circle = new L.Circle(new L.LatLng(parseFloat(item.get("lat")), parseFloat(item.get("lng"))), parseFloat(item.get("amount")) * FMS.getCircleRadiusMultiplier(), {
                                color: FMS.getEventCircleColor(),
                                fillColor: FMS.getEventCircleColor(),
                                fillOpacity: FMS.getInactiveAlpha(),
                                weight: 1,
                            });
                        }
                        else if (item.get("type") == 2 /* Organization */) {
                            item.marker = new L.Marker(new L.LatLng(parseFloat(item.get("lat")), parseFloat(item.get("lng"))), {
                                icon: that.iconDollar,
                                draggable: false,
                                riseOnHover: true,
                            }).bindPopup(item.get("name"), {
                                closeButton: false,
                            });
                            item.circle = new L.Circle(new L.LatLng(parseFloat(item.get("lat")), parseFloat(item.get("lng"))), parseFloat(item.get("amount")) * FMS.getCircleRadiusMultiplier(), {
                                color: FMS.getOrganizationCircleColor(),
                                fillColor: FMS.getOrganizationCircleColor(),
                                fillOpacity: FMS.getInactiveAlpha(),
                                weight: 1,
                            });
                        }
                        else if (item.get("type") == 3 /* Donor */) {
                            item.marker = new L.Marker(new L.LatLng(parseFloat(item.get("lat")), parseFloat(item.get("lng"))), {
                                icon: that.iconHeart,
                                draggable: false,
                                riseOnHover: true,
                            }).bindPopup(item.get("name"), {
                                closeButton: false,
                            });
                            item.circle = new L.Circle(new L.LatLng(parseFloat(item.get("lat")), parseFloat(item.get("lng"))), parseFloat(item.get("amount")) * FMS.getCircleRadiusMultiplier(), {
                                color: FMS.getDonorCircleColor(),
                                fillColor: FMS.getDonorCircleColor(),
                                fillOpacity: FMS.getInactiveAlpha(),
                                weight: 1,
                            });
                        }
                        item.marker.setOpacity(FMS.getHalfAlpha());
                        var i = that.getIndexOfMarkerGroups(item);
                        that.markerGroups[i].addLayer(item.marker);
                        that.circleGroups[i].addLayer(item.circle);
                        // event listeners
                        that.removeEventListener(item);
                        that.addEventListener(item);
                    }
                    else {
                        // update marker
                        that.updateMarker(item);
                    }
                }
            });
            if (FMC.getSelectedItem() != null && FMC.getSelectedItem().marker != null) {
                FMC.getSelectedItem().marker.openPopup();
            }
        };
        MarkersView.prototype.getIndexOfMarkerGroups = function (item) {
            var that = this;
            if (item.id == undefined) {
                return 0;
            }
            var result = 0;
            $.each(that.markerGroups, function (index, iLayer) {
                if (iLayer.sid == parseInt(item.get("sort"))) {
                    result = index;
                    return result;
                }
            });
            return result;
        };
        MarkersView.prototype.getIndexOfMarkerGroups2 = function (id) {
            var that = this;
            var result = 0;
            $.each(that.markerGroups, function (index, iLayer) {
                if (iLayer.sid == id) {
                    result = index;
                    return result;
                }
            });
            return result;
        };
        MarkersView.prototype.createNewMarkerLayer = function (layer) {
            var that = this;
            var circleGroup = new L.FeatureGroup();
            var markerGroup = new L.FeatureGroup();
            var pathGroup = new L.FeatureGroup();
            circleGroup.sid = parseInt(layer.id);
            markerGroup.sid = parseInt(layer.id);
            pathGroup.sid = parseInt(layer.id);
            that.markerGroups.push(circleGroup);
            that.circleGroups.push(markerGroup);
            that.pathGroups.push(pathGroup);
        };
        MarkersView.prototype.updateMarker = function (item) {
            item.marker.setPopupContent(item.get("name"));
            var latlng = new L.LatLng(parseFloat(item.get("lat")), parseFloat(item.get("lng")));
            item.marker.setLatLng(latlng);
            item.circle.setLatLng(latlng);
            item.circle.setRadius(parseFloat(item.get("amount")) * FMS.getCircleRadiusMultiplier());
        };
        MarkersView.prototype.removeMarker = function (item) {
            var i = this.getIndexOfMarkerGroups(item);
            if (item.marker != null && this.markerGroups[i].hasLayer(item.marker)) {
                this.markerGroups[i].removeLayer(item.marker);
            }
            if (item.circle != null && this.circleGroups[i].hasLayer(item.circle)) {
                this.circleGroups[i].removeLayer(item.circle);
            }
            item.marker = null;
            item.circle = null;
        };
        MarkersView.prototype.removeEventListener = function (item) {
            item.marker.off("click");
            item.marker.off("popupclose");
            item.marker.off("popupopen");
            item.marker.off("dragstart");
            item.marker.off("drag");
            item.marker.off("dragend");
        };
        MarkersView.prototype.getIsSelectable = function () {
            return this.isSelectable;
        };
        MarkersView.prototype.setIsSelectable = function (isSelectable) {
            this.isSelectable = isSelectable;
        };
        MarkersView.prototype.addEventListener = function (item) {
            var that = this;
            item.marker.on("click", function () {
                if (that.isSelectable) {
                    if (!FMV.getUIView().getIsLocked() || item.get("type") == 0 /* None */) {
                        this.openPopup();
                        FMV.getUIView().render();
                    }
                }
            });
            item.marker.on("popupclose", function () {
            });
            item.marker.on("popupopen", function () {
                if (that.isSelectable) {
                    FMC.setSelectedItem(item);
                    that.render();
                    that.activateMarker(item);
                }
            });
            item.marker.on("dragstart", function (event) {
            });
            item.marker.on("drag", function (event) {
                item.circle.setLatLng(item.marker.getLatLng());
            });
            item.marker.on("dragend", function (event) {
                if (item.get("type") == 0 /* None */ || item.id == undefined) {
                    item.set({ lat: item.marker.getLatLng().lat, lng: item.marker.getLatLng().lng });
                }
                else {
                    item.save({ lat: item.marker.getLatLng().lat, lng: item.marker.getLatLng().lng }, {
                        success: function (model, response) {
                            FMV.getMsgView().renderSuccess("'" + model.get("name") + "' " + FML.getViewMarkerSaveSuccessMsg());
                        },
                        error: function (error) {
                            FMV.getMsgView().renderError(FML.getViewMarkerSaveErrorMsg());
                        }
                    });
                }
                that.renderPaths();
            });
        };
        MarkersView.prototype.activateMarker = function (item) {
            var that = this;
            $.each(FMM.getItems().models, function (index, item) {
                if (item.marker != null && item.circle != null) {
                    if (FMC.getSelectedItem() == item) {
                        FMV.getMapView().SetIsMapPanZoomAvailable(false);
                        item.marker.bounce({ duration: 200, height: 10 }, function () {
                            item.marker.setOpacity(FMS.getFullAlpha());
                            item.circle.setStyle({ fillOpacity: FMS.getActiveAlpha() });
                            var i = that.getIndexOfMarkerGroups(item);
                            that.markerGroups[i].bringToFront();
                            that.circleGroups[i].bringToFront();
                            FMV.getMapView().SetIsMapPanZoomAvailable(true);
                            item.marker.dragging.enable();
                            // double click for focus event
                            item.marker.off("dblclick");
                            item.marker.on("dblclick", function () {
                                if (FMC.getSelectedItem() == item) {
                                    FMC.getRouter().navigate('map/' + FMS.getLocateZoom() + "/" + parseFloat(item.get("lat")) + "/" + parseFloat(item.get("lng")), { trigger: true, replace: true });
                                }
                            });
                        });
                    }
                    else {
                        item.marker.off("dblclick");
                        item.marker.dragging.disable();
                        item.marker.setOpacity(FMS.getInactiveAlpha());
                        item.circle.setStyle({ fillOpacity: FMS.getInactiveAlpha() });
                    }
                }
            });
            that.renderPaths();
        };
        MarkersView.prototype.inactiveMarkers = function () {
            var that = this;
            if (FMC.getSelectedItem()) {
                FMC.getSelectedItem().marker.closePopup();
            }
            FMC.setSelectedItem(null);
            FMV.getUIView().hide();
            $.each(FMM.getItems().models, function (index, item) {
                if (item.marker != null && item.circle != null) {
                    item.marker.off("dblclick");
                    item.marker.dragging.disable();
                    item.marker.setOpacity(FMS.getInactiveAlpha());
                    item.circle.setStyle({ fillOpacity: FMS.getInactiveAlpha() });
                }
            });
            that.renderPaths();
        };
        MarkersView.prototype.renderLayers = function (layers) {
            var that = this;
            $.each(layers, function (index, value) {
                if (value != undefined) {
                    var i = that.getIndexOfMarkerGroups2(index);
                    if (value) {
                        FMV.getMapView().getMap().addLayer(that.circleGroups[i]);
                        FMV.getMapView().getMap().addLayer(that.markerGroups[i]);
                    }
                    else {
                        if (FMV.getMapView().getMap().hasLayer(that.circleGroups[i])) {
                            FMV.getMapView().getMap().removeLayer(that.circleGroups[i]);
                        }
                        if (FMV.getMapView().getMap().hasLayer(that.markerGroups[i])) {
                            FMV.getMapView().getMap().removeLayer(that.markerGroups[i]);
                        }
                    }
                }
            });
            that.renderPaths();
        };
        MarkersView.prototype.hidePaths = function () {
            var that = this;
            $.each(that.pathGroups, function (index, group) {
                group.clearLayers();
            });
        };
        MarkersView.prototype.renderPaths = function () {
            var that = this;
            that.hidePaths();
            $.each(FMM.getGives().models, function (index, model) {
                var giver = FMM.getItems().get(model.get("gid"));
                var taker = FMM.getItems().get(model.get("tid"));
                if (giver != null && taker != null) {
                    var giverLatLng = new L.LatLng(parseFloat(giver.get("lat")), parseFloat(giver.get("lng")));
                    var takerLatLng = new L.LatLng(parseFloat(taker.get("lat")), parseFloat(taker.get("lng")));
                    var i = that.getIndexOfMarkerGroups(taker);
                    if (FMV.getMapView().getMap().hasLayer(that.pathGroups[i])) {
                        if (taker == FMC.getSelectedItem()) {
                            var line = new L.Polyline([giverLatLng, takerLatLng], { weight: 4, color: "#34495e", opacity: 0.7 });
                            line.setText('  ►  ', { repeat: true, attributes: { fill: "#2c3e50", opacity: 1 } });
                        }
                        else if (giver == FMC.getSelectedItem()) {
                            var line = new L.Polyline([giverLatLng, takerLatLng], { weight: 4, color: "#34495e", opacity: 0.3 });
                            line.setText('  ►  ', { repeat: true, attributes: { fill: "#2c3e50", opacity: 0.5 } });
                        }
                        else {
                            var line = new L.Polyline([giverLatLng, takerLatLng], { weight: 4, color: "#34495e", opacity: 0.075 });
                            line.setText('  ►  ', { repeat: true, attributes: { fill: "#2c3e50", opacity: 0.075 } });
                        }
                        line.addTo(that.pathGroups[i]);
                    }
                }
            });
        };
        return MarkersView;
    })(Backbone.View);
    ForagingMap.MarkersView = MarkersView;
})(ForagingMap || (ForagingMap = {}));
