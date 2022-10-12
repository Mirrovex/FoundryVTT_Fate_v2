export function AbilityCheck({
        skill = null,
        bonus = null,
        other = null,
        ability = null
    } = {}) {

    if (ability == "cien") {
        ability = "Magia Cienia"
    } else {
        ability = ability.charAt(0).toUpperCase() + ability.slice(1);
    }
    
    let rollFormula = "4df + @skill"

    let rollData = {
        skill: skill
    };
    
    let messageData = {
        speaker: ChatMessage.getSpeaker(),
        flavor: `Rzut na ${ability}:`
    }
    new Roll(rollFormula, rollData).roll({async: false}).toMessage(messageData);
}