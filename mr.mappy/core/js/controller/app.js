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
