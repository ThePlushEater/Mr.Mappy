///#source 1 1 /core/js/controller/app.js
/// <reference path="..\..\..\Scripts\typings\jquery\jquery.d.ts" />
/// <reference path="controller.ts" />
/// <reference path="router.ts" />
/// <reference path="setting.ts" />
/// <reference path="localization.ts" />
var FMC;
var FMS;
var FML;
var FMV;
var FMM;
$(document).ready(function () {
    var url = window.location;
    FMC = new ForagingMap.Controller();
    FMS = new ForagingMap.Setting(url.origin + window.location.pathname);
    FML = new ForagingMap.Localization();
    FMS.fetch(FMC.initialize);
});

///#source 1 1 /core/js/controller/controller.js
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

///#source 1 1 /core/js/controller/router.js
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="..\..\..\Scripts\typings\backbone\backbone.d.ts" />
var ForagingMap;
(function (ForagingMap) {
    var Router = (function (_super) {
        __extends(Router, _super);
        function Router(options) {
            this.routes = {
                "": "home",
                "map/:zoom/:lat/:lon": "map",
            };
            _super.call(this, options);
        }
        Router.prototype.initialize = function () {
        };
        Router.prototype.home = function () {
            //console.log("we have loaded the home page");
            this.navigate("map/" + FMS.getDefaultZoom() + "/" + FMS.getDefaultLat() + "/" + FMS.getDefaultLng(), { trigger: true, replace: true });
        };
        Router.prototype.map = function (zoom, lat, lng) {
            //console.log("we have loaded the map page with zoom: " + zoom + " | lat: " + lat + " | lng: " + lng);
            FMV.getMapView().renderMap(lat, lng, zoom);
        };
        return Router;
    })(Backbone.Router);
    ForagingMap.Router = Router;
})(ForagingMap || (ForagingMap = {}));

///#source 1 1 /core/js/controller/localization.js
var ForagingMap;
(function (ForagingMap) {
    var Localization = (function () {
        function Localization() {
            this.url = "core/json/localization.json" + "?" + moment();
            this.error = "N/A";
        }
        Localization.prototype.fetch = function (callback) {
            var that = this;
            $.getJSON(ForagingMap.Setting.BASE_URL + this.url, {
                cache: false,
            }).done(function (data) {
                that.data = data.en;
                callback();
            });
        };
        Localization.prototype.getViewTitle = function () {
            if (this.data.view.title) {
                return this.data.view.title;
            }
            return this.error;
        };
        Localization.prototype.getViewCreator = function () {
            if (this.data.view.creator) {
                return this.data.view.creator;
            }
            return this.error;
        };
        Localization.prototype.getViewList = function () {
            if (this.data.view.list) {
                return this.data.view.list;
            }
            return this.error;
        };
        Localization.prototype.getViewMap = function () {
            if (this.data.view.map) {
                return this.data.view.map;
            }
            return this.error;
        };
        Localization.prototype.getViewLogIn = function () {
            if (this.data.view.login) {
                return this.data.view.login;
            }
            return this.error;
        };
        Localization.prototype.getViewSignUp = function () {
            if (this.data.view.signup) {
                return this.data.view.signup;
            }
            return this.error;
        };
        Localization.prototype.getViewMenu = function () {
            if (this.data.view.menu) {
                return this.data.view.menu;
            }
            return this.error;
        };
        Localization.prototype.getViewUIItemNotSelectedErrorMsg = function () {
            try {
                return this.data.view.ui.itemNotSelectedErrorMsg;
            }
            catch (error) {
                return this.error;
            }
        };
        Localization.prototype.getViewUILocateSuccessMsg = function () {
            try {
                return this.data.view.ui.locate.successMsg;
            }
            catch (error) {
                return this.error;
            }
        };
        Localization.prototype.getViewUILocateErrorMsg = function () {
            try {
                return this.data.view.ui.locate.errorMsg;
            }
            catch (error) {
                return this.error;
            }
        };
        Localization.prototype.getViewUIInfoHeader = function () {
            try {
                return this.data.view.ui.info.header;
            }
            catch (error) {
                return this.error;
            }
        };
        Localization.prototype.getViewUIInfoSaveSuccessMsg = function () {
            try {
                return this.data.view.ui.info.saveSuccessMsg;
            }
            catch (error) {
                return this.error;
            }
        };
        Localization.prototype.getViewUIInfoSaveErrorMsg = function () {
            try {
                return this.data.view.ui.info.saveErrorMsg;
            }
            catch (error) {
                return this.error;
            }
        };
        Localization.prototype.getViewUIInfoDeleteConfirmMsg = function () {
            try {
                return this.data.view.ui.info.deleteConfirmMsg;
            }
            catch (error) {
                return this.error;
            }
        };
        Localization.prototype.getViewUIInfoDeleteSuccessMsg = function () {
            try {
                return this.data.view.ui.info.deleteSuccessMsg;
            }
            catch (error) {
                return this.error;
            }
        };
        Localization.prototype.getViewUIInfoDeleteErrorMsg = function () {
            try {
                return this.data.view.ui.info.deleteErrorMsg;
            }
            catch (error) {
                return this.error;
            }
        };
        Localization.prototype.getViewUIAddHeader = function () {
            try {
                return this.data.view.ui.add.header;
            }
            catch (error) {
                return this.error;
            }
        };
        Localization.prototype.getViewUIAddTypeSelectError = function () {
            try {
                return this.data.view.ui.add.typeSelectError;
            }
            catch (error) {
                return this.error;
            }
        };
        Localization.prototype.getViewUIDataHeader = function () {
            try {
                return this.data.view.ui.data.header;
            }
            catch (error) {
                return this.error;
            }
        };
        Localization.prototype.getViewUIDataSaveSuccessMsg = function () {
            try {
                return this.data.view.ui.data.saveSuccessMsg;
            }
            catch (error) {
                return this.error;
            }
        };
        Localization.prototype.getViewUIDataSaveErrorMsg = function () {
            try {
                return this.data.view.ui.data.saveErrorMsg;
            }
            catch (error) {
                return this.error;
            }
        };
        Localization.prototype.getViewUIDataDonorNoAccessMsg = function () {
            try {
                return this.data.view.ui.data.donorNoAccessMsg;
            }
            catch (error) {
                return this.error;
            }
        };
        Localization.prototype.getViewUIDataDeleteConfirmMsg = function () {
            try {
                return this.data.view.ui.data.deleteConfirmMsg;
            }
            catch (error) {
                return this.error;
            }
        };
        Localization.prototype.getViewUIDataDeleteSuccessMsg = function () {
            try {
                return this.data.view.ui.data.deleteSuccessMsg;
            }
            catch (error) {
                return this.error;
            }
        };
        Localization.prototype.getViewUIDataDeleteErrorMsg = function () {
            try {
                return this.data.view.ui.data.deleteErrorMsg;
            }
            catch (error) {
                return this.error;
            }
        };
        Localization.prototype.getViewUIDataNoDataMsg = function () {
            try {
                return this.data.view.ui.data.noDataMsg;
            }
            catch (error) {
                return this.error;
            }
        };
        Localization.prototype.getViewUIPictureHeader = function () {
            try {
                return this.data.view.ui.picture.header;
            }
            catch (error) {
                return this.error;
            }
        };
        Localization.prototype.getViewUIThresholdHeader = function () {
            try {
                return this.data.view.ui.threshold.header;
            }
            catch (error) {
                return this.error;
            }
        };
        Localization.prototype.getViewMarkerSaveSuccessMsg = function () {
            try {
                return this.data.view.map.marker.saveSuccessMsg;
            }
            catch (error) {
                return this.error;
            }
        };
        Localization.prototype.getViewMarkerSaveErrorMsg = function () {
            try {
                return this.data.view.map.marker.saveErrorMsg;
            }
            catch (error) {
                return this.error;
            }
        };
        Localization.prototype.getViewUILayerHeader = function () {
            try {
                return this.data.view.ui.layer.header;
            }
            catch (error) {
                return this.error;
            }
        };
        return Localization;
    })();
    ForagingMap.Localization = Localization;
})(ForagingMap || (ForagingMap = {}));

///#source 1 1 /core/js/controller/setting.js
var ForagingMap;
(function (ForagingMap) {
    var Setting = (function () {
        function Setting(base) {
            this.url = "core/json/setting.json";
            Setting.BASE_URL = base;
        }
        Setting.prototype.fetch = function (callback) {
            var that = this;
            $.getJSON(Setting.BASE_URL + this.url, {}).done(function (data) {
                that.data = data.setting;
                FML.fetch(callback);
            });
        };
        Setting.prototype.getMaxZoom = function () {
            return parseInt(this.data.maxZoom);
        };
        Setting.prototype.getDefaultZoom = function () {
            return parseInt(this.data.defaultZoom);
        };
        Setting.prototype.getDefaultLat = function () {
            return parseFloat(this.data.defaultLat);
        };
        Setting.prototype.getDefaultLng = function () {
            return parseFloat(this.data.defaultLng);
        };
        Setting.prototype.getTileMapAddress = function () {
            return this.data.tileMapAddress;
        };
        Setting.prototype.getMsgTimeout = function () {
            return parseInt(this.data.msgTimeout);
        };
        Setting.prototype.getDateTimeFormat = function () {
            return this.data.dateTimeFormat;
        };
        Setting.prototype.getImageDir = function () {
            return this.data.imageDir;
        };
        Setting.prototype.getImageMarkerBlank = function () {
            return this.data.imageMarkerBlank;
        };
        Setting.prototype.getImageMarkerHeart = function () {
            return this.data.imageMarkerHeart;
        };
        Setting.prototype.getImageMarkerDollar = function () {
            return this.data.imageMarkerDollar;
        };
        Setting.prototype.getImageMarkerNew = function () {
            return this.data.imageMarkerNew;
        };
        Setting.prototype.getImageMarkerShadow = function () {
            return this.data.imageMarkerShadow;
        };
        Setting.prototype.getCircleRadiusMultiplier = function () {
            return this.data.circleRadiusMultiplier;
        };
        Setting.prototype.getTempCircleColor = function () {
            return this.data.tempCircleColor;
        };
        Setting.prototype.getFruitCircleColor = function () {
            return this.data.fruitCircleColor;
        };
        Setting.prototype.getStationCircleColor = function () {
            return this.data.stationCircleColor;
        };
        Setting.prototype.getZeroAlpha = function () {
            return this.data.zeroAlpha;
        };
        Setting.prototype.getInactiveAlpha = function () {
            return this.data.inactiveAlpha;
        };
        Setting.prototype.getHalfAlpha = function () {
            return this.data.halfAplha;
        };
        Setting.prototype.getActiveAlpha = function () {
            return this.data.activeAlpha;
        };
        Setting.prototype.getFullAlpha = function () {
            return this.data.fullAlpha;
        };
        Setting.prototype.getLocateZoom = function () {
            return this.data.locateZoom;
        };
        Setting.prototype.getPictureDir = function () {
            return this.data.pictureDir;
        };
        Setting.prototype.getBaseUrl = function () {
            return Setting.BASE_URL;
        };
        Setting.prototype.getMapRefreshRate = function () {
            return this.data.mapRefreshRate;
        };
        Setting.prototype.getEventCircleColor = function () {
            return this.data.eventCircleColor;
        };
        Setting.prototype.getOrganizationCircleColor = function () {
            return this.data.organizationCircleColor;
        };
        Setting.prototype.getDonorCircleColor = function () {
            return this.data.donorCircleColor;
        };
        return Setting;
    })();
    ForagingMap.Setting = Setting;
})(ForagingMap || (ForagingMap = {}));

///#source 1 1 /core/js/controller/uploader.js
var files;
function prepareUpload(event) {
    files = event.target.files;
    //console.log(files);
}

function uploadFiles(event, model) {
    event.stopPropagation(); // Stop stuff happening
    event.preventDefault(); // Totally stop stuff happening

    // START A LOADING SPINNER HERE

    // Create a formdata object and add the files
    var data = new FormData();
    $.each(files, function (key, value) {
        data.append(key, value);
    });

    $.ajax({
        url: FMS.getBaseUrl() + 'core/php/upload.php?files',
        type: 'POST',
        data: data,
        cache: false,
        dataType: 'json',
        processData: false, // Don't process the files
        contentType: false, // Set content type to false as jQuery will tell the server its a query string request
        success: function (data, textStatus, jqXHR) {
            if (typeof data.error === 'undefined') {
                // Success so call function to process the form
                submitForm(event, data, model);
            } else {
                // Handle errors here
                console.log('ERRORS: ' + data.error);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            // Handle errors here
            console.log('ERRORS: ' + textStatus);
            // STOP LOADING SPINNER
        }
    });
}

function submitForm(event, data, model) {
    // Create a jQuery object from the form
    $form = $(event.target);

    // Serialize the form data
    var formData = $form.serialize();

    // You should sterilise the file names
    $.each(data.files, function (key, value) {
        formData = formData + '&filenames[]=' + value;
    });

    $.ajax({
        url: FMS.getBaseUrl() + 'core/php/upload.php',
        type: 'POST',
        data: formData,
        cache: false,
        dataType: 'json',
        success: function (data, textStatus, jqXHR) {
            if (typeof data.error === 'undefined') {
                // Success so call function to process the form
                //console.log('SUCCESS: ' + data.success);
                model.save(
                    { url: data.formData.filenames[0].replace('../../content/picture/', '') },
                    {
                        success: function (model, response) {
                            FMM.getPictures().add(model);
                            FMV.getUIView().render();
                            model.setIsSavable(true);
                            FMV.getMsgView().renderSuccess("'" + model.get("name") + "' " + FML.getViewUIDataDeleteSuccessMsg());
                        },
                        error: function () {
                            FMV.getMsgView().renderError(FML.getViewUIDataSaveErrorMsg());
                        },
                    }
                );
            } else {
                // Handle errors here
                console.log('ERRORS: ' + data.error);
            }
        },
        error: function (jqXHR, textStatus, errorThrown) {
            // Handle errors here
            console.log('ERRORS: ' + textStatus);
        },
        complete: function () {
            // STOP LOADING SPINNER
        }
    });
}
///#source 1 1 /core/js/view/template.js
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var FMViewTemplate = '';
FMViewTemplate += '<div id="fm-view-body" class="panel panel-primary">';
// Panel Heading Start
FMViewTemplate += '<div class="panel-heading">';
FMViewTemplate += '<div class="panel-title nav-title"><%= title %></div>';
FMViewTemplate += '<div class="btn-group nav-primary" role="group" aria-label="nav-primary">';
FMViewTemplate += '<div id="fm-view-slider"></div>';
//FMViewTemplate +=               '<button type="button" class="btn btn-default"><%= list %></button>';
//FMViewTemplate +=               '<button type="button" class="btn btn-default"><%= map %></button>';
FMViewTemplate += '</div>';
FMViewTemplate += '<div class="btn-group nav-secondary" role="group" aria-label="nav-secondary">';
FMViewTemplate += '<button type="button" class="btn btn-default"><span class="glyphicon glyphicon-tasks"></span> <%= menu %></button>';
FMViewTemplate += '</div>';
FMViewTemplate += '<div class="clear" />';
FMViewTemplate += '</div>';
// Panel Body Start
FMViewTemplate += '<div id="fm-view-map">';
FMViewTemplate += '<div id="leaflet-view-ui"></div>';
FMViewTemplate += '<div id="leaflet-view-map"></div>';
FMViewTemplate += '<div id="leaflet-view-msg"></div>';
FMViewTemplate += '<div id="leaflet-view-galleria">';
FMViewTemplate += '</div>';
FMViewTemplate += '</div>';
FMViewTemplate += '</div>';
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var FMUIInfoLayerTemplate = '';
FMUIInfoLayerTemplate += '<div class="ui-header"><%= header %></div>';
FMUIInfoLayerTemplate += '<div class="ui-body">';
FMUIInfoLayerTemplate += '<form class="form-horizontal">';
// item-info-id
FMUIInfoLayerTemplate += '<div class="form-group">';
FMUIInfoLayerTemplate += '<label for="item-info-id" class="col-xs-3 control-label">#id</label>';
FMUIInfoLayerTemplate += '<div class="col-xs-9">';
FMUIInfoLayerTemplate += '<input type="text" class="form-control" placeholder="" id="item-info-id" value="<%= id %>" readonly>';
FMUIInfoLayerTemplate += '</div>';
FMUIInfoLayerTemplate += '</div>';
// item-info-name
FMUIInfoLayerTemplate += '<div class="form-group">';
FMUIInfoLayerTemplate += '<label for="item-info-name" class="col-xs-3 control-label">Name</label>';
FMUIInfoLayerTemplate += '<div class="col-xs-9">';
FMUIInfoLayerTemplate += '<input type="text" class="form-control" placeholder="" id="item-info-name" value="<%= name %>">';
FMUIInfoLayerTemplate += '</div>';
FMUIInfoLayerTemplate += '</div>';
// item-info-desc
FMUIInfoLayerTemplate += '<div class="form-group">';
FMUIInfoLayerTemplate += '<label for="item-info-desc" class="col-xs-3 control-label">Description</label>';
FMUIInfoLayerTemplate += '<div class="col-xs-9">';
FMUIInfoLayerTemplate += '<input type="text" class="form-control" placeholder="" id="item-info-desc" value="<%= desc %>">';
FMUIInfoLayerTemplate += '</div>';
FMUIInfoLayerTemplate += '</div>';
// item-info-type
FMUIInfoLayerTemplate += '<div class="form-group">';
FMUIInfoLayerTemplate += '<label for="item-info-type" class="col-xs-3 control-label">Type</label>';
FMUIInfoLayerTemplate += '<div class="col-xs-9">';
FMUIInfoLayerTemplate += '<select id="item-info-type" class="selectpicker">';
//FMUIInfoLayerTemplate += '<optgroup label="None">';
//FMUIInfoLayerTemplate += '<option data-type="0" data-sort="0">None</option>';
//FMUIInfoLayerTemplate += '</optgroup>';
FMUIInfoLayerTemplate += '<optgroup label="Event">';
FMUIInfoLayerTemplate += '<% _.each(sort1, function (sort) { %>';
FMUIInfoLayerTemplate += '<option data-type="1" data-sort="<%= sort.get("id") %>"><%= sort.get("name") %></option>';
FMUIInfoLayerTemplate += '<% }); %>';
FMUIInfoLayerTemplate += '</optgroup>';
FMUIInfoLayerTemplate += '<optgroup label="Organization">';
FMUIInfoLayerTemplate += '<% _.each(sort2, function (sort) { %>';
FMUIInfoLayerTemplate += '<option data-type="2" data-sort="<%= sort.get("id") %>"><%= sort.get("name") %></option>';
FMUIInfoLayerTemplate += '<% }); %>';
FMUIInfoLayerTemplate += '</optgroup>';
FMUIInfoLayerTemplate += '<optgroup label="Donor">';
FMUIInfoLayerTemplate += '<% _.each(sort3, function (sort) { %>';
FMUIInfoLayerTemplate += '<option data-type="3" data-sort="<%= sort.get("id") %>"><%= sort.get("name") %></option>';
FMUIInfoLayerTemplate += '<% }); %>';
FMUIInfoLayerTemplate += '</optgroup>';
FMUIInfoLayerTemplate += '</select>';
FMUIInfoLayerTemplate += '</div>';
FMUIInfoLayerTemplate += '</div>';
// item-info-amount
FMUIInfoLayerTemplate += '<div class="form-group">';
FMUIInfoLayerTemplate += '<label for="item-info-amount" class="col-xs-3 control-label">Money</label>';
FMUIInfoLayerTemplate += '<div class="col-xs-9">';
FMUIInfoLayerTemplate += '<div class="input-group">';
FMUIInfoLayerTemplate += '<input type="text" class="form-control" placeholder="" id="item-info-amount" value="<%= amount %>" readonly />';
FMUIInfoLayerTemplate += '<span class="input-group-addon">$</span>';
FMUIInfoLayerTemplate += '</div>';
FMUIInfoLayerTemplate += '</div>';
FMUIInfoLayerTemplate += '</div>';
// item-info-lat
FMUIInfoLayerTemplate += '<div class="form-group">';
FMUIInfoLayerTemplate += '<label for="item-info-lat" class="col-xs-3 control-label">Latitude</label>';
FMUIInfoLayerTemplate += '<div class="col-xs-9">';
FMUIInfoLayerTemplate += '<div class="input-group">';
FMUIInfoLayerTemplate += '<input type="text" class="form-control" placeholder="" id="item-info-lat" value="<%= lat %>">';
FMUIInfoLayerTemplate += '<span class="input-group-addon">°</span>';
FMUIInfoLayerTemplate += '</div>';
FMUIInfoLayerTemplate += '</div>';
FMUIInfoLayerTemplate += '</div>';
// item-info-lng    
FMUIInfoLayerTemplate += '<div class="form-group">';
FMUIInfoLayerTemplate += '<label for="item-info-lng" class="col-xs-3 control-label">Longitude</label>';
FMUIInfoLayerTemplate += '<div class="col-xs-9">';
FMUIInfoLayerTemplate += '<div class="input-group">';
FMUIInfoLayerTemplate += '<input type="text" class="form-control" placeholder="" id="item-info-lng" value="<%= lng %>">';
FMUIInfoLayerTemplate += '<span class="input-group-addon">°</span>';
FMUIInfoLayerTemplate += '</div>';
FMUIInfoLayerTemplate += '</div>';
FMUIInfoLayerTemplate += '</div>';
// item-info-date
FMUIInfoLayerTemplate += '<div class="form-group">';
FMUIInfoLayerTemplate += '<label for="item-info-date" class="col-xs-3 control-label">Date</label>';
FMUIInfoLayerTemplate += '<div class="col-xs-9">';
FMUIInfoLayerTemplate += '<div class="input-group date" id="item-info-date-picker">';
FMUIInfoLayerTemplate += '<input type="text" class="form-control" id="item-info-date" value="<%= date %>" />';
FMUIInfoLayerTemplate += '<span class="input-group-addon input-group-addon-click" id="item-info-date-select"></span>';
FMUIInfoLayerTemplate += '</div>';
FMUIInfoLayerTemplate += '</div>';
FMUIInfoLayerTemplate += '</div>';
// item-info-update
FMUIInfoLayerTemplate += '<div class="form-group">';
FMUIInfoLayerTemplate += '<label for="item-info-reg" class="col-xs-3 control-label">Updated</label>';
FMUIInfoLayerTemplate += '<div class="col-xs-9">';
FMUIInfoLayerTemplate += '<input type="text" class="form-control" placeholder="" id="item-info-reg" value="<%= update %>" readonly>';
FMUIInfoLayerTemplate += '</div>';
FMUIInfoLayerTemplate += '</div>';
// item-info-btn-edit
FMUIInfoLayerTemplate += '<button id="item-info-btn-edit" type="button" class="btn btn-default col-xs-6"><span class="glyphicon glyphicon-ok"></span> Save</button>';
// item-info-btn-delete
FMUIInfoLayerTemplate += '<button id="item-info-btn-delete" type="button" class="btn btn-default col-xs-6"><span class="glyphicon glyphicon-remove"></span> Delete</button>';
FMUIInfoLayerTemplate += '<div style="clear:both;"/>';
FMUIInfoLayerTemplate += '</form>';
FMUIInfoLayerTemplate += '</div>';
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var FMUIAddLayerTemplate = '';
FMUIAddLayerTemplate += '<div class="ui-header"><%= header %></div>';
FMUIAddLayerTemplate += '<div class="ui-body">';
FMUIAddLayerTemplate += '<form class="form-horizontal">';
// item-info-name
FMUIAddLayerTemplate += '<div class="form-group">';
FMUIAddLayerTemplate += '<label for="item-info-name" class="col-xs-3 control-label">Name</label>';
FMUIAddLayerTemplate += '<div class="col-xs-9">';
FMUIAddLayerTemplate += '<input type="text" class="form-control" placeholder="" id="item-info-name" value="<%= name %>">';
FMUIAddLayerTemplate += '</div>';
FMUIAddLayerTemplate += '</div>';
// item-info-desc
FMUIAddLayerTemplate += '<div class="form-group">';
FMUIAddLayerTemplate += '<label for="item-info-desc" class="col-xs-3 control-label">Description</label>';
FMUIAddLayerTemplate += '<div class="col-xs-9">';
FMUIAddLayerTemplate += '<input type="text" class="form-control" placeholder="" id="item-info-desc" value="<%= desc %>">';
FMUIAddLayerTemplate += '</div>';
FMUIAddLayerTemplate += '</div>';
// item-info-type
FMUIAddLayerTemplate += '<div class="form-group">';
FMUIAddLayerTemplate += '<label for="item-info-type" class="col-xs-3 control-label">Type</label>';
FMUIAddLayerTemplate += '<div class="col-xs-9">';
FMUIAddLayerTemplate += '<select id="item-info-type" class="selectpicker">';
FMUIAddLayerTemplate += '<optgroup label="None">';
FMUIAddLayerTemplate += '<option data-type="0" data-sort="0">None</option>';
FMUIAddLayerTemplate += '</optgroup>';
FMUIAddLayerTemplate += '<optgroup label="Event">';
FMUIAddLayerTemplate += '<% _.each(sort1, function (sort) { %>';
FMUIAddLayerTemplate += '<option data-type="1" data-sort="<%= sort.get("id") %>"><%= sort.get("name") %></option>';
FMUIAddLayerTemplate += '<% }); %>';
FMUIAddLayerTemplate += '</optgroup>';
FMUIAddLayerTemplate += '<optgroup label="Organization">';
FMUIAddLayerTemplate += '<% _.each(sort2, function (sort) { %>';
FMUIAddLayerTemplate += '<option data-type="2" data-sort="<%= sort.get("id") %>"><%= sort.get("name") %></option>';
FMUIAddLayerTemplate += '<% }); %>';
FMUIAddLayerTemplate += '</optgroup>';
FMUIAddLayerTemplate += '<optgroup label="Donor">';
FMUIAddLayerTemplate += '<% _.each(sort3, function (sort) { %>';
FMUIAddLayerTemplate += '<option data-type="3" data-sort="<%= sort.get("id") %>"><%= sort.get("name") %></option>';
FMUIAddLayerTemplate += '<% }); %>';
FMUIAddLayerTemplate += '</optgroup>';
FMUIAddLayerTemplate += '</select>';
FMUIAddLayerTemplate += '</div>';
FMUIAddLayerTemplate += '</div>';
// item-info-date
FMUIAddLayerTemplate += '<div class="form-group">';
FMUIAddLayerTemplate += '<label for="item-info-date" class="col-xs-3 control-label">Date</label>';
FMUIAddLayerTemplate += '<div class="col-xs-9">';
FMUIAddLayerTemplate += '<div class="input-group date" id="item-info-date-picker">';
FMUIAddLayerTemplate += '<input type="text" class="form-control" id="item-info-date" value="<%= date %>">';
FMUIAddLayerTemplate += '<span class="input-group-addon input-group-addon-click" id="item-info-date-select"></span>';
FMUIAddLayerTemplate += '</div>';
FMUIAddLayerTemplate += '</div>';
FMUIAddLayerTemplate += '</div>';
// item-info-lat
FMUIAddLayerTemplate += '<div class="form-group">';
FMUIAddLayerTemplate += '<label for="item-info-lat" class="col-xs-3 control-label">Latitude</label>';
FMUIAddLayerTemplate += '<div class="col-xs-9">';
FMUIAddLayerTemplate += '<div class="input-group">';
FMUIAddLayerTemplate += '<input type="text" class="form-control" placeholder="" id="item-info-lat" value="<%= lat %>">';
FMUIAddLayerTemplate += '<span class="input-group-addon">°</span>';
FMUIAddLayerTemplate += '</div>';
FMUIAddLayerTemplate += '</div>';
FMUIAddLayerTemplate += '</div>';
// item-info-lng    
FMUIAddLayerTemplate += '<div class="form-group">';
FMUIAddLayerTemplate += '<label for="item-info-lng" class="col-xs-3 control-label">Longitude</label>';
FMUIAddLayerTemplate += '<div class="col-xs-9">';
FMUIAddLayerTemplate += '<div class="input-group">';
FMUIAddLayerTemplate += '<input type="text" class="form-control" placeholder="" id="item-info-lng" value="<%= lng %>">';
FMUIAddLayerTemplate += '<span class="input-group-addon">°</span>';
FMUIAddLayerTemplate += '</div>';
FMUIAddLayerTemplate += '</div>';
FMUIAddLayerTemplate += '</div>';
// item-info-btn-edit
FMUIAddLayerTemplate += '<button id="item-info-btn-edit" type="button" class="btn btn-default col-xs-6"><span class="glyphicon glyphicon-ok"></span> Save</button>';
// item-info-btn-delete
FMUIAddLayerTemplate += '<button id="item-info-btn-delete" type="button" class="btn btn-default col-xs-6"><span class="glyphicon glyphicon-remove"></span> Cancel</button>';
FMUIAddLayerTemplate += '<div style="clear:both;"/>';
FMUIAddLayerTemplate += '</form>';
FMUIAddLayerTemplate += '</div>';
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var FMViewUIDataLayerTemplate = '';
FMViewUIDataLayerTemplate += '<div class="ui-header"><%= header %></div>';
FMViewUIDataLayerTemplate += '<div class="ui-body">';
FMViewUIDataLayerTemplate += '<button type="button" data-toggle="collapse" data-target="#date-add-panel" class="btn btn-default col-xs-12"><span class="glyphicon glyphicon-plus"></span> Add New Data</button>';
FMViewUIDataLayerTemplate += '<div class="collapse" id="date-add-panel">';
FMViewUIDataLayerTemplate += '</div>';
FMViewUIDataLayerTemplate += '</div>';
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var FMViewUIThresholdLayerTemplate = '';
FMViewUIThresholdLayerTemplate += '<div class="ui-header"><%= header %></div>';
FMViewUIThresholdLayerTemplate += '<div class="ui-body">';
FMViewUIThresholdLayerTemplate += '<button type="button" data-toggle="collapse" data-target="#threshold-add-panel" class="btn btn-default col-xs-12"><span class="glyphicon glyphicon-plus"></span> Add New Threshold</button>';
FMViewUIThresholdLayerTemplate += '<div class="collapse" id="threshold-add-panel">';
FMViewUIThresholdLayerTemplate += '</div>';
FMViewUIThresholdLayerTemplate += '</div>';
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var FMViewUIDataLayerDeleteTemplate = '';
FMViewUIDataLayerDeleteTemplate = '<button type="button" class="btn btn-default btn-table"><span class="glyphicon glyphicon-remove"></span></button>';
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var FMViewUIDataLayerAddTemplate = '';
FMViewUIDataLayerAddTemplate = '<button type="button" class="btn btn-default btn-table"><span class="glyphicon glyphicon-plus"></span></button>';
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var FMViewUILayerPictureTemplate = '';
FMViewUILayerPictureTemplate += '<div class="ui-header"><%= header %></div>';
FMViewUILayerPictureTemplate += '<div class="ui-body ui-picture">';
FMViewUILayerPictureTemplate += '<button type="button" data-toggle="collapse" data-target="#picture-add-panel" class="btn btn-default col-xs-12"><span class="glyphicon glyphicon-plus"></span> Add New Picture</button>';
FMViewUILayerPictureTemplate += '<div class="collapse" id="picture-add-panel">';
FMViewUILayerPictureTemplate += '</div>';
FMViewUILayerPictureTemplate += '</div>';
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var FMViewUIPictureTemplate = '';
FMViewUIPictureTemplate += '<img class="picture-thumbnail" src="<%= url %>" />';
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var FMUIPictureSelectTemplate = '';
FMUIPictureSelectTemplate += '<input class="fileupload" type="file" accept="image/*" capture="camera" />';
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var FMUIPictureAddTemplate = '';
FMUIPictureAddTemplate = '<button type="button" class="btn btn-default btn-table"><span class="glyphicon glyphicon-plus"></span></button>';
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var FMViewGalleryTemplate = '';
FMViewGalleryTemplate += '<button id="btn-galleria-close" type="button" class="btn btn-default btn-table"><span class="glyphicon glyphicon-remove-circle"></span> Close</button>';
FMViewGalleryTemplate += '<div class="galleria">';
FMViewGalleryTemplate += '<% _.each(pictures, function(picture) { %>';
FMViewGalleryTemplate += '<img data-id="<%= picture.get("id") %>" src="<%= dir %><%= picture.get ("url") %>" data-title="<%= picture.get ("name") %>" data-description="<%= moment(picture.get("date")).format(FMS.getDateTimeFormat()) %>" />';
FMViewGalleryTemplate += '<% }); %>';
FMViewGalleryTemplate += '</div>';
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var FMViewLayerTemplate = '';
FMViewLayerTemplate += '<div class="ui-header"><%= header %></div>';
FMViewLayerTemplate += '<div class="ui-body">';
FMViewLayerTemplate += '<button type="button" data-toggle="collapse" data-target="#layer-add-panel" class="btn btn-default col-xs-12"><span class="glyphicon glyphicon-plus"></span> Manage Layers</button>';
FMViewLayerTemplate += '<div class="collapse <%= isIn %>" id="layer-add-panel">';
FMViewLayerTemplate += '<div id="layer-add-grid"></div>';
FMViewLayerTemplate += '<div id="layer-list-grid"></div>';
FMViewLayerTemplate += '</div>';
FMViewLayerTemplate += '<div class="checkbox btn btn-negative col-xs-12 layer-checkbox layer-checkbox-header">';
FMViewLayerTemplate += '<label class="label-header"><input type="checkbox" id="check-unassigned-layer" data-sort="0" checked>Unassigned Layer Toggle</label>';
FMViewLayerTemplate += '</div>';
FMViewLayerTemplate += '<div class="checkbox btn btn-danger col-xs-12 layer-checkbox layer-checkbox-header">';
FMViewLayerTemplate += '<label class="label-header"><input type="checkbox" id="check-event-layer" checked>Event Layer Toggle</label>';
FMViewLayerTemplate += '<% _.each(sort1, function (sort) { %>';
FMViewLayerTemplate += '<div class="checkbox btn btn-danger col-xs-12 layer-checkbox">';
FMViewLayerTemplate += '<label><input type="checkbox" value= "" data-type="1" data-sort="<%= sort.get("id") %>"><%= sort.get("name") %> - <%= sort.get("desc") %></label>';
FMViewLayerTemplate += '</div>';
FMViewLayerTemplate += '<% }); %>';
FMViewLayerTemplate += '</div>';
FMViewLayerTemplate += '<div class="checkbox btn btn-success col-xs-12 layer-checkbox layer-checkbox-header">';
FMViewLayerTemplate += '<label class="label-header"><input type="checkbox" id="check-organization-layer" checked>Organization Layer Toggle</label>';
FMViewLayerTemplate += '<% _.each(sort2, function (sort) { %>';
FMViewLayerTemplate += '<div class="checkbox btn btn-success col-xs-12 layer-checkbox">';
FMViewLayerTemplate += '<label><input type="checkbox" value= "" data-type="2" data-sort="<%= sort.get("id") %>"><%= sort.get("name") %> - <%= sort.get("desc") %></label>';
FMViewLayerTemplate += '</div>';
FMViewLayerTemplate += '<% }); %>';
FMViewLayerTemplate += '</div>';
FMViewLayerTemplate += '<div class="checkbox btn btn-primary col-xs-12 layer-checkbox layer-checkbox-header">';
FMViewLayerTemplate += '<label class="label-header"><input type="checkbox" id="check-donor-layer" checked>Donor Layer Toggle</label>';
FMViewLayerTemplate += '<% _.each(sort3, function (sort) { %>';
FMViewLayerTemplate += '<div class="checkbox btn btn-primary col-xs-12 layer-checkbox">';
FMViewLayerTemplate += '<label><input type="checkbox" value= "" data-type="3" data-sort="<%= sort.get("id") %>"><%= sort.get("name") %> - <%= sort.get("desc") %></label>';
FMViewLayerTemplate += '</div>';
FMViewLayerTemplate += '<% }); %>';
FMViewLayerTemplate += '</div>';
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var FMViewUIDataTemplate = '';
FMViewUIDataTemplate += '<div class="ui-header"><%= header %></div>';
FMViewUIDataTemplate += '<div class="ui-body">';
FMViewUIDataTemplate += '<button type="button" data-toggle="collapse" data-target="#data-add-panel" class="btn btn-default col-xs-12"><span class="glyphicon glyphicon-plus"></span> Add New Data</button>';
FMViewUIDataTemplate += '<div class="collapse" id="data-add-panel">';
FMViewUIDataTemplate += '</div>';
FMViewUIDataTemplate += '</div>';
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var FMViewUIDataTemplateDonor = '';
FMViewUIDataTemplateDonor += '<div class="ui-header"><%= header %></div>';
FMViewUIDataTemplateDonor += '<div class="ui-body">';
FMViewUIDataTemplateDonor += 'Donor cannot get donation from others.';
FMViewUIDataTemplateDonor += '</div>';
FMViewUIDataTemplateDonor += '</div>';

///#source 1 1 /core/js/view/view.js
/// <reference path="..\..\..\Scripts\typings\backbone\backbone.d.ts" />
/// <reference path="template.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ForagingMap;
(function (ForagingMap) {
    var View = (function (_super) {
        __extends(View, _super);
        function View(options) {
            _super.call(this, options);
            this.setElement(options.el);
            this.origWidth = this.$el.innerWidth();
            this.origHeight = this.$el.innerHeight();
        }
        View.prototype.render = function () {
            var template = _.template(FMViewTemplate);
            var data = { "title": FML.getViewTitle(), "list": FML.getViewList(), "map": FML.getViewMap(), "login": FML.getViewLogIn(), "signup": FML.getViewSignUp(), "menu": FML.getViewMenu() };
            this.$el.html(template(data));
            this.vMap = new ForagingMap.MapView({ el: $("#leaflet-view-map") });
            this.vUI = new ForagingMap.UIView({ el: $("#leaflet-view-ui") });
            this.vMsg = new ForagingMap.MsgView({ el: $("#leaflet-view-msg") });
            this.vGallery = new ForagingMap.GalleryView({ el: $("#leaflet-view-galleria") });
            /*
            
            
            this.vSlider = new ForagingMap.SliderView({ el: $("#fm-view-slider") });
            */
            this.resize();
        };
        View.prototype.resize = function () {
            this.origWidth = this.$el.innerWidth();
            this.origHeight = this.$el.innerHeight();
            //this.vSlider.resize();
        };
        View.prototype.getOrigWidth = function () {
            return this.origWidth;
        };
        View.prototype.getOrigHeight = function () {
            return this.origHeight;
        };
        View.prototype.getMapView = function () {
            return this.vMap;
        };
        View.prototype.getUIView = function () {
            return this.vUI;
        };
        View.prototype.getMsgView = function () {
            return this.vMsg;
        };
        View.prototype.getGalleryView = function () {
            return this.vGallery;
        };
        return View;
    })(Backbone.View);
    ForagingMap.View = View;
})(ForagingMap || (ForagingMap = {}));

///#source 1 1 /core/js/view/gridformat.js
var DatePickerCellEditor = Backgrid.InputCellEditor.extend({
    events: {},
    initialize: function () {
        Backgrid.InputCellEditor.prototype.initialize.apply(this, arguments);
        var input = this;
        $(this.el).datetimepicker({
            defaultDate: input.model.get("date"),
            format: FMS.getDateTimeFormat(),
        }).on("dp.hide", function () {
            if ($(this).data("date") != undefined) {
                var command = new Backgrid.Command({});
                input.model.set(input.column.get("name"), $(this).data("date"));
                input.model.trigger("backgrid:edited", input.model, input.column, command);
            }
        });
    },
});

var DeleteCell = Backgrid.Cell.extend({
    template: _.template(FMViewUIDataLayerDeleteTemplate),
    events: {
        "click": "deleteRow"
    },
    deleteRow: function (e) {
        var r = confirm(FML.getViewUIDataDeleteConfirmMsg());
        if (r == true) {
            e.preventDefault();
            this.model.collection.remove(this.model);
            this.model.destroy(
                {
                    wait: true,
                    success: function (model, response) {
                        FMV.getUIView().render();
                        if (model.get("value") != undefined) {
                            FMV.getMsgView().renderSuccess("'" + model.get("value") + "' " + FML.getViewUIDataDeleteSuccessMsg());
                        } else if (model.get("name") != undefined) {
                            FMV.getMsgView().renderSuccess("'" + model.get("name") + "' " + FML.getViewUIDataDeleteSuccessMsg());
                        } else if (model.get("min") != undefined) {
                            FMV.getMsgView().renderSuccess("'" + model.get("min") + " - " + model.get("max") + "' " + FML.getViewUIDataDeleteSuccessMsg());
                        }
                        
                    },
                    error: function () {
                        FMV.getMsgView().renderError(FML.getViewUIDataDeleteErrorMsg());
                    },
                }
            );
        }
    },
    render: function () {
        $(this.el).html(this.template());
        this.delegateEvents();
        return this;
    }
});

var AddCell = Backgrid.Cell.extend({
    template: _.template(FMViewUIDataLayerAddTemplate),
    events: {
        "click": "addRow"
    },
    addRow: function (e) {
        e.preventDefault();
        var model = this.model;
        var collection = this.model.collection;
        collection.remove(model);
        FMM.getBends().add(model);
        model.save(
            //update: moment(new Date()).format(FMS.getDateTimeFormat())
            {},
            {
                success: function (model, response) {
                    FMV.getUIView().render();
                    model.setIsSavable(true);
                    FMV.getMsgView().renderSuccess("'" + model.get("value") + "' " + FML.getViewUIDataDeleteSuccessMsg());
                },
                error: function () {
                    FMV.getMsgView().renderError(FML.getViewUIDataSaveErrorMsg());
                },
            }
        );

    },
    render: function () {
        $(this.el).html(this.template());
        this.delegateEvents();
        return this;
    }
});

var LayerAddCell = Backgrid.Cell.extend({
    template: _.template(FMViewUIDataLayerAddTemplate),
    events: {
        "click": "addRow"
    },
    addRow: function (e) {
        e.preventDefault();
        var model = this.model;
        var collection = this.model.collection;
        collection.remove(model);
        FMM.getLayers().add(model);
        model.save(
            //update: moment(new Date()).format(FMS.getDateTimeFormat())
            {},
            {
                success: function (model, response) {
                    FMV.getUIView().render();
                    model.setIsSavable(true);
                    FMV.getMsgView().renderSuccess("'" + model.get("value") + "' " + FML.getViewUIDataDeleteSuccessMsg());
                },
                error: function () {
                    FMV.getMsgView().renderError(FML.getViewUIDataSaveErrorMsg());
                },
            }
        );

    },
    render: function () {
        $(this.el).html(this.template());
        this.delegateEvents();
        return this;
    }
});

var DataAddCell = Backgrid.Cell.extend({
    template: _.template(FMViewUIDataLayerAddTemplate),
    events: {
        "click": "addRow"
    },
    addRow: function (e) {
        e.preventDefault();
        var model = this.model;
        var collection = this.model.collection;
        collection.remove(model);
        FMM.getGives().add(model);
        model.save(
            //update: moment(new Date()).format(FMS.getDateTimeFormat())
            {},
            {
                success: function (model, response) {
                    FMV.getUIView().render();
                    model.setIsSavable(true);
                    FMC.fetchItems(FMV.getMapView().getMapBounds());
                    FMV.getMsgView().renderSuccess("'" + model.get("name") + "' " + FML.getViewUIDataDeleteSuccessMsg());
                },
                error: function () {
                    FMV.getMsgView().renderError(FML.getViewUIDataSaveErrorMsg());
                },
            }
        );

    },
    render: function () {
        $(this.el).html(this.template());
        this.delegateEvents();
        return this;
    }
});

var DataDeleteCell = Backgrid.Cell.extend({
    template: _.template(FMViewUIDataLayerDeleteTemplate),
    events: {
        "click": "deleteRow"
    },
    deleteRow: function (e) {
        var r = confirm(FML.getViewUIDataDeleteConfirmMsg());
        if (r == true) {
            e.preventDefault();
            this.model.collection.remove(this.model);
            this.model.destroy(
                {
                    wait: true,
                    success: function (model, response) {
                        FMV.getUIView().render();
                        FMV.getMapView().getMarkersView().renderPaths();
                        if (model.get("value") != undefined) {
                            FMV.getMsgView().renderSuccess("'" + model.get("value") + "' " + FML.getViewUIDataDeleteSuccessMsg());
                        } else if (model.get("name") != undefined) {
                            FMV.getMsgView().renderSuccess("'" + model.get("name") + "' " + FML.getViewUIDataDeleteSuccessMsg());
                        } else if (model.get("min") != undefined) {
                            FMV.getMsgView().renderSuccess("'" + model.get("min") + " - " + model.get("max") + "' " + FML.getViewUIDataDeleteSuccessMsg());
                        }

                    },
                    error: function () {
                        FMV.getMsgView().renderError(FML.getViewUIDataDeleteErrorMsg());
                    },
                }
            );
        }
    },
    render: function () {
        $(this.el).html(this.template());
        this.delegateEvents();
        return this;
    }
});

var PictureCell = Backgrid.Cell.extend({
    template: _.template(FMViewUIPictureTemplate),
    className: 'picture-frame',
    events: {
        "click": "zoomIn"
    },
    render: function () {
        var data = {
            "url": FMS.getBaseUrl() + FMS.getPictureDir() + this.model.get("url"),
        };
        $(this.el).html(this.template(data));
        this.delegateEvents();
        return this;
    },
    zoomIn: function (e) {
        e.preventDefault();
        FMV.getGalleryView().render();
        FMV.getGalleryView().show($("table.backgrid img").index($(e.target)));
    },
});

var pictureColumn = [
	{
	    name: "url",
	    label: "Picture",
	    editable: false,
	    cell: PictureCell,
	}, {
	    name: "name",
	    label: "Name",
	    editable: true,
	    cell: "string" // This is converted to "StringCell" and a corresponding class in the Backgrid package namespace is looked up
	}, {
	    name: "date",
	    label: "Date",
	    editable: true,
	    cell: Backgrid.Cell.extend({ editor: DatePickerCellEditor }),
	}, {
	    label: "delete",
	    sortable: false,
	    editable: false,
	    cell: DeleteCell,
	}
];


var PictureSelectCell = Backgrid.Cell.extend({
    template: _.template(FMUIPictureSelectTemplate),
    className: 'picture-frame',
    events: {
    },
    render: function () {
        $(this.el).html(this.template());
        this.delegateEvents();
        setTimeout(function () {
            $('#picture-add-panel input[type=file]').off('change');
            $('#picture-add-panel input[type=file]').on('change', prepareUpload);
        }, 500);
        return this;
    }
});

var PictureAddCell = Backgrid.Cell.extend({
    template: _.template(FMUIPictureAddTemplate),
    events: {
        "click": "addRow"
    },
    addRow: function (e) {
        console.log("try add");
        e.preventDefault();
        var model = this.model;
        var collection = this.model.collection;
        collection.remove(model);
        uploadFiles(e, model);
    },
    render: function () {
        $(this.el).html(this.template());
        this.delegateEvents();
        return this;
    }
});

var pictureAddColumn = [
	{
	    name: "url",
	    label: "Picture",
	    editable: false,
	    cell: PictureSelectCell,
	}, {
	    name: "name",
	    label: "Name",
	    editable: true,
	    cell: "string",
	}, {
	    name: "date",
	    label: "Date",
	    editable: true,
	    cell: Backgrid.Cell.extend({ editor: DatePickerCellEditor }),
	}, {
	    label: "add",
	    sortable: false,
	    editable: false,
	    cell: PictureAddCell,
	}];

var layerColumn = [
    {
        name: "type",
        label: "Type",
        editable: true,
        /*
        cell: Backgrid.SelectCell.extend({
            optionValues: FMM.getTypes(),
        })
        */
    }, {
        name: "name",
        label: "Name",
        editable: true,
        cell: "string"
    }, {
        name: "desc",
        label: "Desc",
        editable: true,
        cell: "string"
    }, {
        label: "delete",
        sortable: false,
        editable: false,
        cell: DeleteCell,
    }
];

var layerAddColumn = [
    {
        name: "type",
        label: "Type",
        editable: true,
        /*
        cell: Backgrid.SelectCell.extend({
            optionValues: FMM.getTypes(),
        })
        */
    }, {
        name: "name",
        label: "Name",
        editable: true,
        cell: "string"
    }, {
        name: "desc",
        label: "Desc",
        editable: true,
        cell: "string"
    }, {
        label: "add",
        sortable: false,
        editable: false,
        cell: LayerAddCell,
    }
];

var dataColumn = [
    {
        name: "gid",
        label: "Donor",
        editable: true,
    }, {
        name: "name",
        label: "Name",
        editable: true,
        cell: "string"
    }, {
        name: "amount",
        label: "Amount ($)",
        editable: true,
        cell: "number"
    }, {
        name: "date",
        label: "Date",
        editable: true,
        cell: Backgrid.Cell.extend({ editor: DatePickerCellEditor }),
    }, {
        label: "delete",
        sortable: false,
        editable: false,
        cell: DataDeleteCell,
    }
];

var dataAddColumn = [
    {
        name: "gid",
        label: "Donor",
        editable: true,
    }, {
        name: "name",
        label: "Name",
        editable: true,
        cell: "string"
    }, {
        name: "amount",
        label: "Amount ($)",
        editable: true,
        cell: "number"
    }, {
        name: "date",
        label: "Date",
        editable: true,
        cell: Backgrid.Cell.extend({ editor: DatePickerCellEditor }),
    }, {
        label: "add",
        sortable: false,
        editable: false,
        cell: DataAddCell,
    }
];
///#source 1 1 /core/js/view/map.js
/// <reference path="..\..\..\Scripts\typings\backbone\backbone.d.ts" />
/// <reference path="..\..\..\Scripts\typings\leaflet\leaflet.d.ts" />
/// <reference path="template.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ForagingMap;
(function (ForagingMap) {
    var MapView = (function (_super) {
        __extends(MapView, _super);
        function MapView(options) {
            _super.call(this, options);
            this.setElement(options.el);
        }
        MapView.prototype.getMapZoom = function () {
            return this.lMap.getZoom();
        };
        MapView.prototype.getMapCenter = function () {
            return this.lMap.getCenter();
        };
        MapView.prototype.getMapBounds = function () {
            return this.lMap.getBounds();
        };
        MapView.prototype.renderMap = function (lat, lng, zoom) {
            var that = this;
            // intialize map if map is not created.
            if (that.lMap == null) {
                that.lMap = L.map(that.$el[0].id, {
                    closePopupOnClick: false,
                    zoomControl: false,
                    doubleClickZoom: false,
                }).setView(new L.LatLng(lat, lng), zoom);
                L.tileLayer(FMS.getTileMapAddress(), {
                    maxZoom: FMS.getMaxZoom(),
                }).addTo(that.lMap);
                that.lMap.invalidateSize(false);
                that.lMap.on("moveend", function (e) {
                    FMC.getRouter().navigate('map/' + that.getMapZoom() + "/" + that.getMapCenter().lat + "/" + that.getMapCenter().lng, { trigger: false, replace: true });
                    that.waitForFetchData();
                });
                that.lMap.touchZoom.disable();
                that.lMap.doubleClickZoom.disable();
                that.lMap.whenReady(function () {
                    FMC.fetchItems(that.lMap.getBounds());
                    that.vMarkers = new ForagingMap.MarkersView();
                    that.vControl = new ForagingMap.MapControlView({ el: $(".leaflet-top.leaflet-right") });
                });
                that.lMap.on("dblclick", function () {
                    if (FMV.getUIView().getMode() != 1 /* ADD */) {
                        FMV.getUIView().hide();
                        FMV.getMapView().resize(false);
                        FMV.getMapView().getMarkersView().inactiveMarkers();
                        FMV.getMapView().getControlView().resetControls();
                    }
                });
            }
            else {
                that.lMap.setView(new L.LatLng(lat, lng), zoom);
            }
        };
        MapView.prototype.waitForFetchData = function () {
            var that = this;
            if (that.timeout != null) {
                clearTimeout(that.timeout);
            }
            that.timeout = setTimeout(function () {
                FMC.fetchItems(that.getMapBounds());
            }, FMS.getMapRefreshRate());
        };
        MapView.prototype.getMap = function () {
            return this.lMap;
        };
        MapView.prototype.getMarkersView = function () {
            return this.vMarkers;
        };
        MapView.prototype.getControlView = function () {
            return this.vControl;
        };
        MapView.prototype.resize = function (centerize) {
            var that = this;
            if (FMV.getUIView().getIsOpen()) {
                that.$el.addClass("view-map-half");
                that.$el.css({ 'width': that.$el.parent().width() - FMV.getUIView().getOuterWidth() });
            }
            else {
                that.$el.removeAttr("style");
                that.$el.removeClass("view-map-half");
            }
            that.lMap.invalidateSize(false); // set map size fit with parent div size
            if (FMC.hasSelectedItem() && centerize) {
                that.lMap.setView(new L.LatLng(parseFloat(FMC.getSelectedItem().get("lat")), parseFloat(FMC.getSelectedItem().get("lng"))));
            }
        };
        MapView.prototype.SetIsMapPanZoomAvailable = function (isAvailable) {
            if (isAvailable) {
                FMV.getMapView().getMap().dragging.enable();
                //FMV.getMapView().getMap().touchZoom.enable();
                //FMV.getMapView().getMap().doubleClickZoom.enable();
                FMV.getMapView().getMap().scrollWheelZoom.enable();
            }
            else {
                FMV.getMapView().getMap().dragging.disable();
                //FMV.getMapView().getMap().touchZoom.disable();
                //FMV.getMapView().getMap().doubleClickZoom.disable();
                FMV.getMapView().getMap().scrollWheelZoom.disable();
            }
        };
        return MapView;
    })(Backbone.View);
    ForagingMap.MapView = MapView;
})(ForagingMap || (ForagingMap = {}));

///#source 1 1 /core/js/view/ui.js
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

///#source 1 1 /core/js/view/markers.js
/// <reference path="..\..\..\Scripts\typings\backbone\backbone.d.ts" />
/// <reference path="..\..\..\Scripts\typings\leaflet\leaflet.d.ts" />
/// <reference path="template.ts" />
/// <reference path="..\model\item.ts" />
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

///#source 1 1 /core/js/view/msg.js
/// <reference path="..\..\..\Scripts\typings\backbone\backbone.d.ts" />
/// <reference path="..\..\..\Scripts\typings\leaflet\leaflet.d.ts" />
/// <reference path="template.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ForagingMap;
(function (ForagingMap) {
    var MsgView = (function (_super) {
        __extends(MsgView, _super);
        function MsgView(options) {
            _super.call(this, options);
            this.setElement(options.el);
        }
        MsgView.prototype.renderError = function (msg) {
            var that = this;
            var template = _.template(FMMsgViewErrorTemplate);
            var data = { "msg": msg };
            that.$el.html(template(data));
            if (that.timeout != null) {
                clearTimeout(that.timeout);
            }
            that.timeout = setTimeout(function () {
                that.$el.html("");
            }, FMS.getMsgTimeout());
        };
        MsgView.prototype.renderSuccess = function (msg) {
            var that = this;
            var template = _.template(FMMsgViewSuccessTemplate);
            var data = { "msg": msg };
            that.$el.html(template(data));
            if (that.timeout != null) {
                clearTimeout(that.timeout);
            }
            that.timeout = setTimeout(function () {
                that.$el.html("");
            }, FMS.getMsgTimeout());
        };
        return MsgView;
    })(Backbone.View);
    ForagingMap.MsgView = MsgView;
})(ForagingMap || (ForagingMap = {}));
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var FMMsgViewErrorTemplate = '';
FMMsgViewErrorTemplate += '<span class="label label-warning"><%= msg %></span>';
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var FMMsgViewSuccessTemplate = '';
FMMsgViewSuccessTemplate += '<span class="label label-success"><%= msg %></span>';

///#source 1 1 /core/js/view/mapcontrol.js
/// <reference path="..\..\..\Scripts\typings\backbone\backbone.d.ts" />
/// <reference path="..\..\..\Scripts\typings\leaflet\leaflet.d.ts" />
/// <reference path="template.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ForagingMap;
(function (ForagingMap) {
    var MapControlView = (function (_super) {
        __extends(MapControlView, _super);
        function MapControlView(options) {
            _super.call(this, options);
            this.setElement(options.el);
            this.render();
        }
        MapControlView.prototype.render = function () {
            var that = this;
            var template = _.template(FMMapControlViewTemplate);
            var data = {};
            that.$el.html(template(data));
            that.removeEventListener();
            that.addEventListener();
        };
        MapControlView.prototype.removeEventListener = function () {
            var that = this;
            that.$(".control-button").off("mouseenter");
            that.$(".control-button").off("mouseleave");
            that.$(".control-button.zoomin").off("click");
            that.$(".control-button.zoomout").off("click");
            that.$(".control-button.locate").off("click");
            that.$(".control-button.layer").off("click");
            that.$(".control-button.info").off("click");
            that.$(".control-button.add").off("click");
            that.$(".control-button.data").off("click");
            that.$(".control-button.picture").off("click");
        };
        MapControlView.prototype.addEventListener = function () {
            var that = this;
            // hold map control while mouse is over the control button
            that.$(".control-button").on("mouseenter", function () {
                FMV.getMapView().SetIsMapPanZoomAvailable(false);
            });
            that.$(".control-button").on("mouseleave", function () {
                FMV.getMapView().SetIsMapPanZoomAvailable(true);
            });
            // zoom in and zoom out control
            that.$(".control-button.zoomin").on("click", function (event) {
                FMV.getMapView().getMap().zoomIn();
            });
            that.$(".control-button.zoomout").on("click", function (event) {
                FMV.getMapView().getMap().zoomOut();
            });
            // geo locate
            that.$(".control-button.locate").on("click", function (event) {
                if (!FMV.getUIView().getIsLocked()) {
                    if (navigator.geolocation) {
                        navigator.geolocation.getCurrentPosition(that.updatePosition);
                    }
                }
            });
            // ui-layer control
            that.$(".control-button.layer").on("click", function (event) {
                if (!FMV.getUIView().getIsLocked()) {
                    if (!$(this).hasClass("layer-active")) {
                        that.resetControls();
                        $(this).addClass("layer-active");
                        FMV.getUIView().show(5 /* LAYER */);
                    }
                    else {
                        $(this).removeClass("layer-active");
                        FMV.getUIView().hide();
                    }
                    FMV.getMapView().resize(false);
                }
            });
            // ui-info control
            that.$(".control-button.info").on("click", function (event) {
                if (!FMV.getUIView().getIsLocked()) {
                    if (!$(this).hasClass("info-active")) {
                        if (FMC.hasSelectedItem()) {
                            that.resetControls();
                            $(this).addClass("info-active");
                            FMV.getUIView().show(2 /* INFO */);
                            FMV.getMapView().resize(true);
                        }
                        else {
                            FMV.getMsgView().renderError(FML.getViewUIItemNotSelectedErrorMsg());
                        }
                    }
                    else {
                        $(this).removeClass("info-active");
                        FMV.getUIView().hide();
                        FMV.getMapView().resize(false);
                    }
                }
            });
            // ui-add control
            that.$(".control-button.add").on("click", function (event) {
                if (!$(this).hasClass("add-active")) {
                    that.resetControls();
                    $(this).addClass("add-active");
                    FMC.setSelectedItem(FMC.createItem());
                    FMV.getUIView().show(1 /* ADD */);
                    FMV.getMapView().resize(true);
                    setTimeout(function () {
                        FMV.getMapView().getMarkersView().render();
                    }, 500);
                }
                else {
                    $(this).removeClass("add-active");
                    if (FMC.hasSelectedItem()) {
                        var item = FMC.removeItem(FMC.getSelectedItem());
                        FMV.getMapView().getMarkersView().removeMarker(item);
                        FMC.setSelectedItem(null);
                        FMV.getUIView().hide();
                        FMV.getMapView().resize(false);
                    }
                }
            });
            // ui-data control
            that.$(".control-button.data").on("click", function (event) {
                if (!FMV.getUIView().getIsLocked()) {
                    if (!$(this).hasClass("data-active")) {
                        if (FMC.hasSelectedItem() && parseInt(FMC.getSelectedItem().get("type")) != 3) {
                            if (FMC.hasSelectedItem()) {
                                that.resetControls();
                                $(this).addClass("data-active");
                                FMV.getUIView().show(3 /* DATA */);
                                FMV.getMapView().resize(true);
                            }
                            else {
                                FMV.getMsgView().renderError(FML.getViewUIItemNotSelectedErrorMsg());
                            }
                        }
                        else {
                            FMV.getMsgView().renderError(FML.getViewUIDataDonorNoAccessMsg());
                        }
                    }
                    else {
                        $(this).removeClass("data-active");
                        FMV.getUIView().hide();
                        FMV.getMapView().resize(false);
                    }
                }
            });
            // ui-picture control
            that.$(".control-button.picture").on("click", function (event) {
                if (!FMV.getUIView().getIsLocked()) {
                    if (!$(this).hasClass("picture-active")) {
                        if (FMC.hasSelectedItem()) {
                            that.resetControls();
                            $(this).addClass("picture-active");
                            FMV.getUIView().show(4 /* PICTURE */);
                            FMV.getMapView().resize(true);
                        }
                        else {
                            FMV.getMsgView().renderError(FML.getViewUIItemNotSelectedErrorMsg());
                        }
                    }
                    else {
                        $(this).removeClass("picture-active");
                        FMV.getUIView().hide();
                        FMV.getMapView().resize(false);
                    }
                }
            });
            /*
            // ui-threshold control
            that.$(".control-button.threshold").on("click", function (event) {
                if (!FMV.getUIView().getIsLocked()) {
                    if (!$(this).hasClass("threshold-active")) {  // open ui
                        if (FMC.hasSelectedItem()) {
                            that.resetControls();
                            $(this).addClass("threshold-active");
                            FMV.getUIView().show(UIMode.THRESHOLD);
                            FMV.getMapView().resize(true);
                        } else {                                // close ui
                            FMV.getMsgView().renderError(FML.getViewUIItemNotSelectedErrorMsg());
                        }
                    } else {                                    // clos eui
                        $(this).removeClass("threshold-active");
                        FMV.getUIView().hide();
                        FMV.getMapView().resize(false);
                    }
                }
            });
            */
        };
        MapControlView.prototype.resetControls = function () {
            var that = this;
            that.$(".control-button.layer").removeClass("layer-active");
            that.$(".control-button.info").removeClass("info-active");
            that.$(".control-button.add").removeClass("add-active");
            that.$(".control-button.layer").removeClass("layer-active");
            that.$(".control-button.picture").removeClass("picture-active");
            that.$(".control-button.data").removeClass("data-active");
        };
        MapControlView.prototype.updatePosition = function (position) {
            var that = this;
            FMC.getRouter().navigate('map/' + FMS.getLocateZoom() + "/" + position.coords.latitude + "/" + position.coords.longitude, { trigger: true, replace: true });
            FMV.getMsgView().renderSuccess(FML.getViewUILocateSuccessMsg());
        };
        return MapControlView;
    })(Backbone.View);
    ForagingMap.MapControlView = MapControlView;
})(ForagingMap || (ForagingMap = {}));
var FMMapControlViewTemplate = '';
FMMapControlViewTemplate += '<div class="leaflet-control">';
FMMapControlViewTemplate += '<div class="control-button zoomin"></div>';
FMMapControlViewTemplate += '<div class="control-button zoomout"></div>';
FMMapControlViewTemplate += '<div class="control-button locate"></div>';
FMMapControlViewTemplate += '<div class="control-button layer"></div>';
FMMapControlViewTemplate += '<div class="control-button info"></div>';
FMMapControlViewTemplate += '<div class="control-button data"></div>';
//FMMapControlViewTemplate +=         '<div class="control-button threshold"></div>';
FMMapControlViewTemplate += '<div class="control-button picture"></div>';
FMMapControlViewTemplate += '<div class="control-button add"></div>';
FMMapControlViewTemplate += '</div>';

///#source 1 1 /core/js/view/gallery.js
/// <reference path="..\..\..\Scripts\typings\backbone\backbone.d.ts" />
/// <reference path="..\..\..\Scripts\typings\leaflet\leaflet.d.ts" />
/// <reference path="template.ts" />
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var ForagingMap;
(function (ForagingMap) {
    var GalleryView = (function (_super) {
        __extends(GalleryView, _super);
        function GalleryView(options) {
            _super.call(this, options);
            this.setElement(options.el);
            Galleria.loadTheme('core/lib/galleria/themes/classic/galleria.classic.js');
            $("#leaflet-view-galleria").css({ width: $("#fm-view-map").innerWidth(), height: $("#fm-view-map").innerHeight() + 1 });
        }
        GalleryView.prototype.render = function () {
            var that = this;
            var template = _.template(FMViewGalleryTemplate);
            var data = {
                "pictures": FMM.getPictures().models,
                "dir": FMS.getBaseUrl() + FMS.getPictureDir(),
            };
            that.$el.html(template(data));
        };
        GalleryView.prototype.show = function (index) {
            var that = this;
            that.$el.addClass("galleria-show");
            Galleria.run('.galleria', {
                show: index,
                imageCrop: false,
                transition: 'fade',
            });
            Galleria.ready(function () {
                $("#btn-galleria-close").off("click");
                $("#btn-galleria-close").on("click", function () {
                    that.hide();
                    that.$el.html("");
                });
            });
        };
        GalleryView.prototype.hide = function () {
            var that = this;
            that.$el.removeClass("galleria-show");
        };
        return GalleryView;
    })(Backbone.View);
    ForagingMap.GalleryView = GalleryView;
})(ForagingMap || (ForagingMap = {}));

///#source 1 1 /core/js/model/model.js
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

///#source 1 1 /core/js/model/item.js
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
var ItemType;
(function (ItemType) {
    ItemType[ItemType["None"] = 0] = "None";
    ItemType[ItemType["Event"] = 1] = "Event";
    ItemType[ItemType["Organization"] = 2] = "Organization";
    ItemType[ItemType["Donor"] = 3] = "Donor";
})(ItemType || (ItemType = {}));
var ForagingMap;
(function (ForagingMap) {
    var Item = (function (_super) {
        __extends(Item, _super);
        function Item(attributes, options) {
            _super.call(this, attributes, options);
            this.isRemoved = false;
            this.url = "core/php/item.php";
            this.url = ForagingMap.Setting.BASE_URL + this.url;
            this.defaults = {
                "name": "",
                "desc": "",
                "type": 0 /* None */,
                "sort": 0,
                "amount": 0,
                "lat": 0,
                "lng": 0,
                "date": moment(new Date()).format(FMS.getDateTimeFormat()),
                "update": moment(new Date()).format(FMS.getDateTimeFormat()),
            };
        }
        Item.prototype.parse = function (response, options) {
            if (response.id != null) {
                response.id = parseInt(response.id);
            }
            response.type = parseInt(response.type);
            response.sort = parseInt(response.sort);
            response.amount = parseFloat(response.amount);
            response.lat = parseFloat(response.lat);
            response.lng = parseFloat(response.lng);
            response.date = moment(response.date).format(FMS.getDateTimeFormat());
            response.update = moment(response.update).format(FMS.getDateTimeFormat());
            return _super.prototype.parse.call(this, response, options);
        };
        Item.prototype.toJSON = function (options) {
            var clone = this.clone().attributes;
            if (this.id != null) {
                clone["id"] = this.id;
            }
            return clone;
        };
        Item.prototype.setIsRemoved = function (isRemoved) {
            this.isRemoved = isRemoved;
        };
        Item.prototype.getIsRemoved = function () {
            return this.isRemoved;
        };
        return Item;
    })(Backbone.Model);
    ForagingMap.Item = Item;
    var Items = (function (_super) {
        __extends(Items, _super);
        function Items(models, options) {
            _super.call(this, models, options);
            this.url = "core/php/items.php";
            this.model = Item;
            this.url = ForagingMap.Setting.BASE_URL + this.url;
        }
        Items.prototype.getIds = function () {
            var that = this;
            var result = new Array();
            $.each(that.models, function (index, model) {
                result.push(model.id);
            });
            return result;
        };
        Items.prototype.getIdsToString = function () {
            var that = this;
            var result = new Array();
            $.each(that.models, function (index, model) {
                result.push(parseInt(model.id));
            });
            return result.sort(function (a, b) {
                return a - b;
            }).join(",");
        };
        Items.prototype.toArray = function () {
            var that = this;
            that.sort();
            var result = new Array();
            _.each(that.models, function (item) {
                result.push([item.get("name"), item.id]);
            });
            return result;
        };
        Items.prototype.comparator = function (model) {
            return model.get("name");
        };
        return Items;
    })(Backbone.Collection);
    ForagingMap.Items = Items;
})(ForagingMap || (ForagingMap = {}));

///#source 1 1 /core/js/model/layer.js
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
/// <reference path="..\..\..\Scripts\typings\backbone\backbone.d.ts" />
/// <reference path="..\..\..\Scripts\typings\leaflet\leaflet.d.ts" />
/// <reference path="..\..\..\Scripts\typings\moment\moment.d.ts" />
/// <reference path="..\controller\setting.ts" />
var ForagingMap;
(function (ForagingMap) {
    var Layer = (function (_super) {
        __extends(Layer, _super);
        function Layer(attributes, options) {
            _super.call(this, attributes, options);
            this.url = "core/php/layer.php";
            this.isSavable = true;
            var that = this;
            that.url = ForagingMap.Setting.BASE_URL + that.url;
            that.defaults = {
                "name": "",
                "desc": "",
                "type": 0,
            };
            that.off("change");
            that.on("change", function (model, options) {
                if (that.isSavable == false)
                    return;
                model.save();
                FMV.getMsgView().renderSuccess("'" + model.get("name") + "' " + FML.getViewUIInfoSaveSuccessMsg());
                FMV.getUIView().render();
            });
        }
        Layer.prototype.parse = function (response, options) {
            if (response.id != null) {
                response.id = parseInt(response.id);
            }
            response.type = parseInt(response.type);
            return _super.prototype.parse.call(this, response, options);
        };
        Layer.prototype.toJSON = function (options) {
            var clone = this.clone().attributes;
            if (this.id != null) {
                clone["id"] = this.id;
            }
            return clone;
        };
        Layer.prototype.setIsSavable = function (isSavable) {
            this.isSavable = isSavable;
        };
        Layer.prototype.getIsSavable = function () {
            return this.isSavable;
        };
        return Layer;
    })(Backbone.Model);
    ForagingMap.Layer = Layer;
    var Layers = (function (_super) {
        __extends(Layers, _super);
        function Layers(models, options) {
            _super.call(this, models, options);
            this.url = "core/php/layers.php";
            this.model = Layer;
            this.url = ForagingMap.Setting.BASE_URL + this.url;
        }
        Layers.prototype.getSizeOfType = function (typeIndex) {
            var that = this;
            var result = 0;
            $.each(that.models, function (index, model) {
                if (parseInt(model.get("type")) == typeIndex) {
                    result++;
                }
            });
            return result;
        };
        return Layers;
    })(Backbone.Collection);
    ForagingMap.Layers = Layers;
    var Type = (function (_super) {
        __extends(Type, _super);
        function Type(attributes, options) {
            _super.call(this, attributes, options);
            this.defaults = {
                "name": "",
                "type": 0,
            };
        }
        Type.prototype.parse = function (response, options) {
            if (response.id != null) {
                response.id = parseInt(response.id);
            }
            response.type = parseInt(response.type);
            return _super.prototype.parse.call(this, response, options);
        };
        Type.prototype.toJSON = function (options) {
            var clone = this.clone().attributes;
            if (this.id != null) {
                clone["id"] = this.id;
            }
            return clone;
        };
        return Type;
    })(Backbone.Model);
    ForagingMap.Type = Type;
    var Types = (function (_super) {
        __extends(Types, _super);
        function Types(models, options) {
            _super.call(this, models, options);
            this.model = Type;
        }
        Types.prototype.toArray = function () {
            var that = this;
            var result = new Array();
            _.each(that.models, function (item) {
                result.push([item.get("name"), item.get("type")]);
            });
            return result;
        };
        return Types;
    })(Backbone.Collection);
    ForagingMap.Types = Types;
})(ForagingMap || (ForagingMap = {}));

///#source 1 1 /core/js/model/picture.js
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
    var Picture = (function (_super) {
        __extends(Picture, _super);
        function Picture(attributes, options) {
            _super.call(this, attributes, options);
            this.url = "core/php/picture.php";
            this.isSavable = true;
            var that = this;
            this.url = ForagingMap.Setting.BASE_URL + this.url;
            this.defaults = {
                "pid": 0,
                "name": "",
                "url": "",
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
                        //FMC.fetchItems(FMV.getMapView().getMapBounds());
                        FMV.getMsgView().renderSuccess("'" + model.get("name") + "' " + FML.getViewUIDataSaveSuccessMsg());
                    },
                    error: function (error) {
                        FMV.getMsgView().renderError(FML.getViewUIInfoSaveErrorMsg());
                    },
                });
            });
        }
        Picture.prototype.parse = function (response, options) {
            if (response.id != null) {
                response.id = parseInt(response.id);
            }
            response.pid = parseInt(response.pid);
            response.date = moment(response.date).format(FMS.getDateTimeFormat());
            response.update = moment(response.update).format(FMS.getDateTimeFormat());
            return _super.prototype.parse.call(this, response, options);
        };
        Picture.prototype.toJSON = function (options) {
            var clone = this.clone().attributes;
            if (this.id != null) {
                clone["id"] = this.id;
            }
            return clone;
        };
        Picture.prototype.setIsSavable = function (isSavable) {
            this.isSavable = isSavable;
        };
        Picture.prototype.getIsSavable = function () {
            return this.isSavable;
        };
        return Picture;
    })(Backbone.Model);
    ForagingMap.Picture = Picture;
    var Pictures = (function (_super) {
        __extends(Pictures, _super);
        function Pictures(models, options) {
            _super.call(this, models, options);
            this.url = "core/php/pictures.php";
            this.model = Picture;
            this.url = ForagingMap.Setting.BASE_URL + this.url;
        }
        return Pictures;
    })(Backbone.Collection);
    ForagingMap.Pictures = Pictures;
})(ForagingMap || (ForagingMap = {}));

///#source 1 1 /core/js/model/give.js
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

