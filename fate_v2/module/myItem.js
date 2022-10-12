export default class myItem extends Item {
    async roll() {
        let chatData = {
            user: game.user._id,
            speaker: ChatMessage.getSpeaker()
        };

        let cardData = {
            CONFIG,
            ...this.data,
            owner: this.actor.id
        };

        chatData.content = await renderTemplate("systems/fate_v2/templates/items/parts/item-card.html", cardData);
        return ChatMessage.create(chatData);
    }
}