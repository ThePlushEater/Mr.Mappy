module ForagingMap {
    export class Model {
        private layers: Layers;
        private types: Types;
        private items: Items;
        private pictures: Pictures;
        private gives: Gives;

        constructor() {
            this.layers = new Layers();
            this.items = new Items();
            this.gives = new Gives();
            this.pictures = new Pictures();
            this.types = new Types();
            this.types.add(new Type({ name: "Event", type: 1 }));
            this.types.add(new Type({ name: "Organization", type: 2 }));
            this.types.add(new Type({ name: "Donor", type: 3 }));
        }
        getTypes(): Types {
            return this.types;
        }
        getLayers(): Layers {
            return this.layers;
        }
        getItems(): Items {
            return this.items;
        }
        getPictures(): Pictures {
            return this.pictures;
        }
        getGives(): Gives {
            return this.gives;
        }
        /*
        getBends(): Bends {
            return this.bends;
        }
        
        getThresholds(): Thresholds {
            return this.thresholds;
        }
        getBendRatio(item: Item): number {
            var thresholds: Thresholds = new Thresholds(FMM.getThresholds().where({ pid: item.id }));
            var bends: Bends = new Bends(FMM.getBends().where({ pid: item.id }));
            var date: any = FMV.getSliderView().getCurDate();

            var curThreshold = thresholds.getCurrentThreshold(date);
            var curBend = bends.getCurrentBend(date);
            if (curThreshold != null && curBend != null) {
                var min = parseFloat(curThreshold.get("min"));
                var max = parseFloat(curThreshold.get("max"));
                var bend = parseFloat(curBend.get("value"));
                //console.log(min + "|" + max + "|" + bend);
                if (bend < min) {
                    return bend - min;
                } else {
                    return bend / max;
                }
            }
            return -10000;
        }
        */
    }
}