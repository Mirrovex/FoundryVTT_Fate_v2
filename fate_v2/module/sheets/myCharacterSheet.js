import * as Dice from "../dice.js";

export default class myCharacterSheet extends ActorSheet{
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            tabs: [{navSelector: ".tabs", contentSelector: ".sheet-body", initial: "description"}],
            classes: ["fate", "sheet", "actor", "character"],
            width: 720,
            height: 659
        });
    }

    get template(){
        return `systems/fate_v2/templates/actors/${this.actor.data.type}-sheet.html`;

    }

    getData() {
        const baseData = super.getData();
        let sheetData = {
            owner: this.actor.isOwner,
            editable: this.isEditable,
            actor: baseData.actor,
            data: baseData.actor.data.data,
            config: CONFIG.fate_v2,
            
            //aspects: baseData.items.filter(function(item) { return item.type == "aspects_item"})
            bronie: baseData.items.filter(function(bron) { return bron.type == "bron"}),
            zbroje: baseData.items.filter(function(zbroja) { return zbroja.type == "zbroja"}),
            mikstury: baseData.items.filter(function(mikstura) { return mikstura.type == "mikstura"}),
            przedmioty: baseData.items.filter(function(item) { return item.type == "przedmiot"}),
            aspekty: baseData.items.filter(function(aspekt) { return aspekt.type == "aspekt"}),
            sztuczki: baseData.items.filter(function(sztuczka) { return sztuczka.type == "sztuczka"}),
            konsekwencje: baseData.items.filter(function(konsekwencja) { return konsekwencja.type == "konsekwencja"}),
            atuty: baseData.items.filter(function(atut) { return atut.type == "atut"})
        };

        return sheetData;
    }

    activateListeners(html) {

        // Activate Item Filters
        const filterLists = html.find(".filter-list");
        filterLists.each(this._initializeFilterItemList.bind(this));
        filterLists.on("click", ".filter-item", this._onToggleFilter.bind(this));

        // View Item Sheets
        html.find(".item-edit").click(this._onItemEdit.bind(this)); //dziala

        // Item summaries
        html.find(".item .item-name.rollable h4").click(event => this._onItemSummary(event)); //dziala

        // Editable Only Listeners
        if ( this.isEditable ) {
            // Item State Toggling
            html.find(".item-toggle").click(this._onToggleItem.bind(this)); //dziala
        
            // Rollable sheet actions
            html.find(".rollable[data-action]").click(this._onSheetAction.bind(this));

            // Configure Skills
            html.find(".skill_config").click(this._onSkillMenu.bind(this)); //dziala
            html.find(".skill-delete").click(this._onSkillRemove.bind(this)); //dziala

            // Configure Pression
            html.find(".edit_pression").click(this._onPressionEdit.bind(this)); //dziala

            // Owned Item management
            html.find(".item-create").click(this._onItemCreate.bind(this)); //dziala
            html.find(".item-delete").click(this._onItemDelete.bind(this)); //dziala
            }

        // Owner Only Listeners
        if ( this.actor.isOwner ) {

            // Roll Skill Checks
            html.find(".roll_skill").click(this._onRollSkillCheck.bind(this)); //dziala

            // Item Rolling
            html.find(".rollable .item-image").click(event => this._onItemRoll(event)); //dziala

            // Fate Points
            html.find(".luck_plus").click(this._onLuckPlus.bind(this)); //dziala
            html.find(".luck_minus").click(this._onLuckMinus.bind(this)); //dziala
            html.find(".fate_config").click(this._onFateMenu.bind(this)); //dziala

            html.find(".konsekwencja_box").click(this._onCheckKonsekwencja.bind(this)); //dziala
        }

        // Otherwise remove rollable classes
        else {
            html.find(".rollable").each((i, el) => el.classList.remove("rollable"));
        }

        super.activateListeners(html);
    }

    _onCheckKonsekwencja(event) {
        event.preventDefault();

        const li = $(event.currentTarget).parents(".item");
        const item = this.actor.items.get(li.data("item-id"));
        const itemData = item.data.data

        let checkbox = !itemData.uzyta
        
        item.update({[`data.uzyta`]: checkbox})
    }

    _onItemSummary(event) {
        event.preventDefault();
        const li = $(event.currentTarget).parents(".item");
        const item = this.actor.items.get(li.data("item-id"));

        let chatData = item.data.data.opis;
        //chatData = TextEditor.enrichHTML(chatData, {secrets: this.actor.isOwner})
    
        // Toggle summary
        if ( li.hasClass("expanded") ) {
          let summary = li.children(".item-summary");
          summary.slideUp(200, () => summary.remove());
        } else {
          let div = $(`<div class="item-summary">${chatData}</div>`);
          let props = $('<div class="item-properties"></div>');
          div.append(props);
          li.append(div.hide());
          div.slideDown(200);
        }
        li.toggleClass("expanded");
      }

    async _onSkillMenu(event) {
        event.preventDefault();

        //let dialog_html_path = "systems/fate_v2/templates/dialogs/edit_skill.html"
        let dialog_html_path = "systems/fate_v2/templates/dialogs/add_skill.html"

        const dialog_html = await renderTemplate(dialog_html_path, {
            CONFIG, data: this.actor.data.data
        });

        const dialog = class extends Dialog {
            activateListeners(dialog_html) {
                super.activateListeners(dialog_html);

                //const dialog_skill_name = dialog_html.find(".dialog_skill_name");
                //dialog_skill_name.on("click", this._onDragSkill.bind(this));
            }

            /*_onDragSkill(event) {
                event.preventDefault();

                console.log("dziala")

                event = new Draggable
            }*/
        }

        return new Promise(resolve => {
            const dialog_data = {
                title: "Edytuj Umiejętności",
                content: dialog_html,
                buttons: {
                    cancel: {
                        icon: '<i class="fas fa-ban"></i>',
                        label: "Anuluj",
                        callback: dialog_html => resolve({cancelled: true})
                    },
                    save: {
                        icon: '<i class="fas fa-check"></i>',
                        label: "Zapisz",
                        callback: dialog_html => resolve(this._processTaskEditSkills(dialog_html[0].querySelector("form")))
                    }
                },
                default: "save",
                close: () => resolve({cancelled: true}) 
            };

            new dialog(dialog_data, null).render(true);
        }); 
    }

    _processTaskEditSkills(form) {
        let bonus = form.skill_bonus.value.toString()
        if (bonus == "-0") {
            bonus = "0"
        }

        if (bonus !== "") {
            let key = Object.keys(CONFIG.fate_v2.umiejetnosci); //lista ["alchemia", "animizm", "inne"]
            let selected_index = form.skill_name.selectedIndex; //0
            let selected_option = key[selected_index]; //alchemia

            if (selected_option == "zrecznosc" && bonus > this.actor.data.data.inicjatywa.value) {
                this.actor.update({["data.inicjatywa.value"]: bonus})
            }

            let skill = "umiej" + bonus;
            
            if (skill in this.actor.data.data.umiejetnosci) {
                let list = [...this.actor.data.data.umiejetnosci[skill]]
                list.push(selected_option)

                this.actor.update({[`data.umiejetnosci.${skill}`]: list});
            } else {
                this.actor.update({[`data.umiejetnosci.${skill}`]: [selected_option]});
            }
        }
    }

    _onSkillRemove(event) {
        event.preventDefault();

        let element = event.currentTarget.dataset["skill_id"]; //skill4
        //console.log(element)
        let list = this.actor.data.data.umiejetnosci[element]; //list ["alchemy", "fight"]
        //console.log(list)
        let skill_name = event.currentTarget.dataset["skill_name"]; //alchemy

        if (skill_name == "zrecznosc") {
            this.actor.update({["data.inicjatywa.value"]: 0})
        }

        if (list.length == 1) { //remove list and skill4
            list = null;
            this.actor.update({ [`data.umiejetnosci.-=${element}`]: null});
        } else { //remove only skill from list
            list.splice(list.indexOf(skill_name), 1)
            this.actor.update({ [`data.umiejetnosci.${element}`]: list});
        }
    }

    async _onFateMenu(event) {
        event.preventDefault();

        //let dialog_html_path = "systems/fate_v2/templates/dialogs/edit_skill.html"
        let dialog_html_path = "systems/fate_v2/templates/dialogs/edit_fate.html"

        const dialog_html = await renderTemplate(dialog_html_path, {
            data: this.actor.data.data
        });

        return new Promise(resolve => {
            const dialog_data = {
                title: "Edytuj Punkty Losu",
                content: dialog_html,
                buttons: {
                    cancel: {
                        icon: '<i class="fas fa-ban"></i>',
                        label: "Anuluj",
                        callback: dialog_html => resolve({cancelled: true})
                    },
                    save: {
                        icon: '<i class="fas fa-check"></i>',
                        label: "Zapisz",
                        callback: dialog_html => resolve(this._processTaskEditFate(dialog_html[0].querySelector("form")))
                    }
                },
                default: "save",
                close: () => resolve({cancelled: true}) 
            };

            new Dialog(dialog_data, null).render(true);
        }); 
    }

    _processTaskEditFate(form) {
        let fate = form.max_fate.value.toString()

        this.actor.update({['data.los.max']: fate});
    }

    async _onPressionEdit(event) {
        event.preventDefault();

        let pression_id = event.currentTarget.dataset["pression_id"];

        const dialog_html = await renderTemplate("systems/fate_v2/templates/dialogs/edit_pression.html", {
            CONFIG, pression_id
        });

        return new Promise(resolve => {
            const dialog_data = {
                title: "Edytuj Presje",
                content: dialog_html,
                buttons: {
                    cancel: {
                        icon: '<i class="fas fa-ban"></i>',
                        label: "Anuluj",
                        callback: dialog_html => resolve({cancelled: true})
                    },
                    save: {
                        icon: '<i class="fas fa-check"></i>',
                        label: "Zapisz",
                        callback: dialog_html => resolve(this._processTaskCheckOptionsEditPression(dialog_html[0].querySelector("form"), pression_id))
                    }
                },
                default: "save",
                close: () => resolve({cancelled: true}) 
            };

            new Dialog(dialog_data, null).render(true);
        }); 
    }

    _processTaskCheckOptionsEditPression(form, base) {
        let key = Object.keys(CONFIG.fate_v2.presja);
        let selected_index = form.pression_box.selectedIndex; // 4
        let box = key[selected_index]; // presja4

        const box_number = parseInt(box.substr(-1)); // 4
        const press_number = Object.keys(this.actor.data.data.presja[base]).length // 1

        /*if (box_number < press_number) {
            if (box_number == 3) {
                this.actor.update({[`data.presja.${base}.-=presja4`]: null });
            } else if (box_number == 2) {
                this.actor.update({[`data.presja.${base}.-=presja4`]: null });
                this.actor.update({[`data.presja.${base}.-=presja3`]: null });
            } else if (box_number == 1) {
                this.actor.update({[`data.presja.${base}.-=presja4`]: null });
                this.actor.update({[`data.presja.${base}.-=presja3`]: null });
                this.actor.update({[`data.presja.${base}.-=presja2`]: null });
            } else if (box_number == 0) {
                this.actor.update({[`data.presja.${base}.-=presja4`]: null });
                this.actor.update({[`data.presja.${base}.-=presja3`]: null });
                this.actor.update({[`data.presja.${base}.-=presja2`]: null });
                this.actor.update({[`data.presja.${base}.-=presja1`]: null });
            }
        } else if (box_number > press_number) {
            if (box_number == 1) {
                this.actor.update({[`data.presja.${base}.presja1`]: false });
            } else if (box_number == 2) {
                this.actor.update({[`data.presja.${base}.presja1`]: false });
                this.actor.update({[`data.presja.${base}.presja2`]: false });
            } else if (box_number == 3) {
                this.actor.update({[`data.presja.${base}.presja1`]: false });
                this.actor.update({[`data.presja.${base}.presja2`]: false });
                this.actor.update({[`data.presja.${base}.presja3`]: false });
            } else if (box_number == 4) {
                this.actor.update({[`data.presja.${base}.presja1`]: false });
                this.actor.update({[`data.presja.${base}.presja2`]: false });
                this.actor.update({[`data.presja.${base}.presja3`]: false });
                this.actor.update({[`data.presja.${base}.presja4`]: false });
            }
        }*/

        if (box_number < press_number) {
            for(let i = press_number; i > box_number; i -= 1) {
                this.actor.update({[`data.presja.${base}.-=presja${i}`]: null });
            }
        } else if (box_number > press_number) {
            for (let i = press_number; i < box_number; i += 1) {
                this.actor.update({[`data.presja.${base}.presja${i+1}`]: false });
            }
        }
    }

    _initializeFilterItemList(i, ul) {
        const set = this._filters[ul.dataset.filter];
        const filters = ul.querySelectorAll(".filter-item");
        for ( let li of filters ) {
            if ( set.has(li.dataset.filter) ) li.classList.add("active");
        }
    }

    _onToggleFilter(event) {
        event.preventDefault();
        const li = event.currentTarget;
        const set = this._filters[li.parentElement.dataset.filter];
        const filter = li.dataset.filter;
        if ( set.has(filter) ) set.delete(filter);
        else set.add(filter);
        return this.render();
    }

    _onItemEdit(event) {
        event.preventDefault();
        const li = event.currentTarget.closest(".item");
        const item = this.actor.items.get(li.dataset.itemId);
        return item.sheet.render(true);
    }

    _onItemRoll(event) {
        event.preventDefault();
        const itemId = event.currentTarget.closest(".item").dataset.itemId;
        const item = this.actor.items.get(itemId);

        /*if (item.data.data.zuzywalne == true) {
            item.update({["data.ilosc"]: item.data.data.ilosc - 1})
            if (item.data.data.ilosc <= 1) {
                item.roll()
                return item.delete()
            }
        }*/
        if (item.data.type == "bron" || item.data.type == "mikstura") {
            if (item.data.data.consume.target != null && item.data.data.consume.target != "") {
                try {
                    const actorItem = this.actor.items.get(item.data.data.consume.target)

                    let amount = item.data.data.consume.amount
                    if (amount == null || amount == "") {
                        amount = 1
                    }
                    
                    if (actorItem.data.data.ilosc >= amount) {
                        actorItem.update({["data.ilosc"]: actorItem.data.data.ilosc - amount})
                    } else {
                        Dialog.prompt({
                            title: "Zużyto przedmiot",
                            content: `<p>Nie masz już przedmiotu, którego używasz do korzystania z tego przedmiotu</p>`,
                            callback:  () => {},
                            rejectClose: false
                            });
                        return true
                    }

                    /*actorItem.update({["data.ilosc"]: actorItem.data.data.ilosc - amount})
                    if (actorItem.data.data.ilosc <= amount) {
                        actorItem.delete()
                    }*/
                } catch {
                    Dialog.prompt({
                        title: "Zużyto przedmiot",
                        content: `<p>Nie masz już przedmiotu, którego używasz do korzystania z tego przedmiotu</p>`,
                        callback:  () => {},
                        rejectClose: false
                        });
                    return true
                }
            }

        } else if (item.data.type == "aspekt") {
            this.actor.update({["data.los.value"]: this.actor.data.data.los.value - 1})
            //this.actor.update({["data.bonus"]: this.actor.data.data.bonus + 2})
        }

        if ( item ) return item.roll();
    }

    async _onItemCreate(event) {
        event.preventDefault();
        const header = event.currentTarget;
        const type = header.dataset.type;

        let name = "Nowy"
        if (type == "przedmiot" || type == "aspekt" || type == "atut") {
            name = `Nowy ${type.charAt(0).toUpperCase() + type.slice(1)}`
        } else if(type == "bron") {
            name = "Nowa Broń"
        } else {
            name = `Nowa ${type.charAt(0).toUpperCase() + type.slice(1)}`
        }

        let img = "icons/svg/item-bag.svg"
        if (type == "bron") {
            img = "icons/weapons/swords/greatsword-crossguard-steel.webp"
        } else if (type == "zbroja") {
            img = "icons/equipment/chest/breastplate-banded-blue.webp"
        } else if (type == "mikstura") {
            img = "icons/consumables/potions/potion-flask-corked-blue.webp"
        } else if (type == "przedmiot") {
            img = "icons/sundries/books/book-simple-brown.webp"
        } else if (type == "aspekt") {
            img = "icons/environment/settlement/target.webp"
        } else if (type == "sztuczka") {
            img = "icons/skills/melee/unarmed-punch-fist.webp"
        } else if (type == "konsekwencja") {
            img = "icons/skills/melee/blood-slash-foam-red.webp"
        } else if (type == "atut") {
            img = "icons/skills/social/diplomacy-handshake.webp"
        }
        const itemData = {
            name: name,
            type: type,
            img: img,
            data: foundry.utils.deepClone(header.dataset)
        };
        delete itemData.data.type;
        const newItem = await this.actor.createEmbeddedDocuments("Item", [itemData]);

        if (type == "mikstura") {
            newItem[0].update({["data.consume.target"]: newItem[0].id})
        }
        
        return true
    }

    _onItemDelete(event) {
        event.preventDefault();
        const li = event.currentTarget.closest(".item");
        const item = this.actor.items.get(li.dataset.itemId);
        
        if (item.data.type == "zbroja" && item.data.name == this.actor.data.data.zbroja.from) {
            let obj = {"value": 0, "from": ""}
            this.actor.update({["data.zbroja"]: obj})
        } else if (item.data.type == "bron" && item.data.name == this.actor.data.data.atak.from) {
            let obj = {"value": 0, "from": ""}
            this.actor.update({["data.atak"]: obj})
        }

        if ( item ) return item.delete();
    }

    _onRollAbilityTest(event) {
        event.preventDefault();
        let ability = event.currentTarget.parentElement.dataset.ability;
        
        Dice.AbilityCheck({
            bonus: this.actor.data.data.cechy[ability].bonus,
            ability: ability,
            utrudnienia: this.actor.data.data.utrudnienia,
            ulatwienia: this.actor.data.data.ulatwienia
        });
    }

    _onRollSkillCheck(event) {
        event.preventDefault();
        let skill_name = event.currentTarget.closest("[data-skill]").dataset.skill;
        let skill_bonus = event.currentTarget.closest("[data-bonus]").dataset.bonus;
        skill_bonus = parseInt(skill_bonus.slice(5))

        Dice.AbilityCheck({
            skill: skill_bonus,
            ability: skill_name
        });
    }

    _onToggleItem(event) {
        event.preventDefault();
        const itemId = event.currentTarget.closest(".item").dataset.itemId;
        const item = this.actor.items.get(itemId);

        let obj = {"value": 0, "from": ""}
        
        if (item.data.type == "zbroja" && item.data.data.bonus >= this.actor.data.data.zbroja.value) {
            if (item.data.data.zalozony == false) {
                obj["value"] = item.data.data.bonus
                obj["from"] = item.data.name
            }
            this.actor.update({["data.zbroja"]: obj})
        } else if (item.data.type == "bron" && item.data.data.bonus >= this.actor.data.data.atak.value) {
            if (item.data.data.zalozony == false) {
                obj["value"] = item.data.data.bonus
                obj["from"] = item.data.name
            }
            this.actor.update({["data.atak"]: obj})
        }
        
        return item.update({["data.zalozony"]: !item.data.data.zalozony});
    }

    _onSheetAction(event) {
        event.preventDefault();
        const button = event.currentTarget;
        switch ( button.dataset.action ) {
            case "convertCurrency":
                return Dialog.confirm({
                title: "Konweruj Walute",
                content: `<p>Przekonwerowac Walute?</p>`,
                yes: () => this._convertCurrency()
                });
            case "rollInitiative":
                return this.actor.rollInitiative({createCombatants: true});
        }
    }

    _convertCurrency() {
        let zloto = this.actor.data.data.pieniadze.zloto
        let srebro = this.actor.data.data.pieniadze.srebro
        let miedz = this.actor.data.data.pieniadze.miedz
        let obj = {}


        let x = miedz / 10 //sprawdzanie ile razy da sie podzielic
        x = Math.floor(x)
        miedz -= x * 10 //odejmowanie mozliwej liczby

        srebro += x //dodawanie liczby do wyzszej waluty
        let y = srebro / 10 //sprawdzanie ile razy da sie podzielic
        y = Math.floor(y)
        srebro -= y *10 //odejmowanie mozliwej liczby

        zloto += y //dodawanie liczby do wyzszej waluty


        obj["zloto"] = zloto
        obj["srebro"] = srebro
        obj["miedz"] = miedz

        this.actor.update({["data.pieniadze"]: obj})

    }

    _onLuckPlus(event) {
        event.preventDefault();

        this.add_fate_poin();

        this.actor.update({["data.los.value"]: this.actor.data.data.los.value + 1})
        
        //console.log(this.actor.data)
        console.log(this.actor.data.data.presja)
    }
    
    _onLuckMinus(event) {
        event.preventDefault();

        this.use_fate_poin();

        this.actor.update({["data.los.value"]: this.actor.data.data.los.value - 1})
    }

    async add_fate_poin() {
        let chatData = {
            user: game.user._id,
            speaker: ChatMessage.getSpeaker()
        };

        let cardData = {
            img: "icons/commodities/currency/coin-plain-gold.webp",
            name: this.actor.name,
            action: "Dodal Punkt Losu",
            owner: this.actor.id
        };

        chatData.content = await renderTemplate("systems/fate_v2/templates/items/parts/fate-card.html", cardData);
        return ChatMessage.create(chatData);
    }
    
    async use_fate_poin() {
        let chatData = {
            user: game.user._id,
            speaker: ChatMessage.getSpeaker()
        };

        let cardData = {
            img: "icons/commodities/currency/coin-plain-gold.webp",
            name: this.actor.name,
            action: "Uzyl Punktu Losu",
            owner: this.actor.id
        };

        chatData.content = await renderTemplate("systems/fate_v2/templates/items/parts/fate-card.html", cardData);
        return ChatMessage.create(chatData);
    }
}