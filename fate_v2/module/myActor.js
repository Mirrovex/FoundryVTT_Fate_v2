export default class myActor extends Actor {
    prepareBaseData() {
    }

    _onCreate() {
        let tokenData = {
            actorLink: true,
            displayName: 30,
            lockRotation: true,
            vision: true,
            disposition: 1
        }
        this.update({["token"]: tokenData})



        this._CreateAttribute("Koncepcja Ogólna", "icons/environment/settlement/target.webp", "aspekt")
        this._CreateAttribute("Pochodzenie", "icons/environment/settlement/target.webp", "aspekt")
        this._CreateAttribute("Ambicja", "icons/environment/settlement/target.webp", "aspekt")

        this._CreateAttribute("Sztuczka 1", "icons/skills/melee/unarmed-punch-fist.webp", "sztuczka")
        this._CreateAttribute("Sztuczka 2", "icons/skills/melee/unarmed-punch-fist.webp", "sztuczka")

        this._CreateAttribute("Łagodna (2)", "icons/skills/melee/blood-slash-foam-red.webp", "konsekwencja")
        this._CreateAttribute("Umiarkowana (4)", "icons/skills/melee/blood-slash-foam-red.webp", "konsekwencja")
        this._CreateAttribute("Poważna (6)", "icons/skills/melee/blood-slash-foam-red.webp", "konsekwencja")
    }

    _CreateAttribute(name, img, type) {
        let itemData = {
            name: name,
            img: img,
            type: type,
            data: {"typ": name}
        };
        return this.createEmbeddedDocuments("Item", [itemData]);
    }
}