export default class myItemSheet extends ItemSheet{
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            tabs: [{navSelector: ".tabs", contentSelector: ".sheet-body", initial: "description"}],
            classes: ["fate", "sheet", "item"],
            width: 560,
            height: 400,
            resizable: true
        });
    }

    get template(){
        return `systems/fate_v2/templates/items/${this.item.data.type}-sheet.html`;

    }

    getData() {
        const baseData = super.getData();
        let sheetData = {
            owner: this.item.isOwner,
            editable: this.isEditable,
            item: baseData.item,
            data: baseData.item.data.data,
            config: CONFIG.fate_v2,

            itemType: this.item.type.titleCase(),
            itemStatus: this._getItemStatus(this.item),

            // Potential consumption targets
            abilityConsumptionTargets: this._getItemConsumptionTargets(baseData.data)
        };

        return sheetData;
    }

    _getItemConsumptionTargets(item) {
        const actor = this.item.actor;
        if ( !actor ) return {};

        let obj = {}
        for (const item of actor.items) {
            const itemData = item.data.data
            if (itemData.zuzywalne == true) {
                obj[`${item.data._id}`] = `${item.data.name} (${item.data.data.ilosc})`
            }
        }

        return obj
    }

    _getItemStatus(item) {
        if (item.type == "bron" || item.type == "zbroja" || item.type == "przedmiot" || item.type == "mikstura") {
            if (item.data.data.zalozony) {
                return "Zalozony"
            } else {
                return "Niezalozony"
            }
        }
    }
}