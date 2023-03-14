function __export_hensei(deck) {
    var name = deck['name'];
    
    var out = {};
    out['name'] = name;
    out['class'] = deck['pc']['job']['master']['name'];

    var subskills = [];
    var set_action = deck['pc']['set_action'];
    for (var i = set_action.length - 1; i >= 0; i--) {
        var obj = set_action[i];
        subskills.push(obj['name']);
    }
    out['subskills'] = subskills;
    
    var characters = [];
    var npc = deck['npc'];
    for(k in npc) {
        var charOut = {};
        var obj = npc[k];
        var master = obj['master'];
        var param = obj['param'];
        
        console.log(master['name']);
        charOut['name'] = master['name'];
        charOut['id'] = master['id'];
        charOut['ringed'] = param['has_npcaugment_constant'];
        charOut['uncap'] = param['evolution'];

        characters.push(charOut);
    }
    out['characters'] = characters;
    
    alert(JSON.stringify(out));
}

__export_hensei(Game.view.deck_model.attributes.deck);