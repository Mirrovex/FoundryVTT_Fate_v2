import {fate_v2} from "./module/config.js";
import myItem from "./module/myItem.js";
import myActor from "./module/myActor.js";
import myItemSheet from "./module/sheets/myItemSheet.js";
import myCharacterSheet from "./module/sheets/myCharacterSheet.js";
import { _getInitiativeFormula } from "./module/combat.js";

import { preloadHandlebarsTemplates } from "./module/templates.js";

Hooks.once("init", function(){
    console.log("test | Initializing Fate_v2");

    CONFIG.fate_v2 = fate_v2;
    CONFIG.Item.documentClass = myItem;
    CONFIG.Actor.documentClass = myActor;

    CONFIG.Combat.initiative.formula = "1d12 + @inicjatywa.value";
    Combatant.prototype._getInitiativeFormula = _getInitiativeFormula;

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("fate", myItemSheet, {makeDefault: true});

    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("fate", myCharacterSheet, {makeDefault: true});



    Handlebars.registerHelper("up", function(txt) {
        if (txt == "cien")
            return "Magia Cienia"
        else if (txt !== "none") {
            return txt.charAt(0).toUpperCase() + txt.slice(1);
        } else {
            return "---"
        }
        
    });

    Handlebars.registerHelper("change_bonus", function(txt) {
        //return (`+${txt.slice(-1)}`)
        if (txt.includes("-")) {
            return (txt.substring(5))
        } else {
            return (`+${txt.substring(5)}`)
        }
        
    });

    Handlebars.registerHelper("sort", function(data) {
        let obj = Object.assign({}, data.umiejetnosci);

        //console.log(Object.keys(obj))

        let new_obj = Object.keys(obj).sort(function(a, b) {
            a = a.substring(5)
            b = b.substring(5)
            a = parseInt(a)
            b = parseInt(b)
            return a - b
        }).reverse().reduce((val, key) => {
            val[key] = obj[key];
            return val;
        }, {});

        return new_obj;
    });

    Handlebars.registerHelper("number_pression", function(id) {
        let number = id.slice(6)
        return number
    });

    Handlebars.registerHelper("number_konsekwencja", function(item) {
        let number = item.slice(-2, -1)
        return number
    });

    Handlebars.registerHelper("check", function(a, b) {
        if (a == b) {
            return true
        } else {
            return false
        }
    });

    Handlebars.registerHelper('loop', function(n, block) {
        let accum = '';
        for(let i = 0; i < n; ++i)
            accum += block.fn(i);
        return accum;
    });

    Handlebars.registerHelper('check_data', function(item) {
        if (item.data.uzyta == true) {
            return true;
        } else {
            return false;
        }
    });



    return preloadHandlebarsTemplates();
});