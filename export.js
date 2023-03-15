function __export_hensei(deck) {
    var name = deck['name'];
    
    var out = {};
    var pc = deck['pc'];

    out['name'] = name;
    out['class'] = pc['job']['master']['name'];

    var subskillsOut = [];
    var set_action = pc['set_action'];
    for (var i = set_action.length - 1; i >= 0; i--) {
        var obj = set_action[i];
        subskillsOut.push(obj['name']);
    }
    out['subskills'] = subskillsOut;
    
    var charactersOut = [];
    var npc = deck['npc'];
    for(k in npc) {
        var charOut = {};
        var obj = npc[k];
        var master = obj['master'];
        var param = obj['param'];
        
        charOut['name'] = master['name'];
        charOut['id'] = master['id'];
        charOut['ringed'] = param['has_npcaugment_constant'];
        charOut['uncap'] = param['evolution'];

        charactersOut.push(charOut);
    }
    out['characters'] = charactersOut;

    var weaponsOut = [];
    var weapons = pc['weapons'];
    for(k in weapons) {
        var weaponOut = {};
        var obj = weapons[k];
        var master = obj['master'];
        var param = obj['param'];

        weaponOut['name'] = master['name'];
        weaponOut['id'] = master['id'];

        weaponsOut.push(weaponOut);
    }
    out['weapons'] = weaponsOut;
    
    alert(JSON.stringify(out));
}

__export_hensei(Game.view.deck_model.attributes.deck);