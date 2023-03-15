function __export_hensei(g) {
    var deck = g.view.deck_model.attributes.deck;
    var name = deck['name'];
    
    var out = {};
    var pc = deck['pc'];

    out['name'] = name;
    out['class'] = pc['job']['master']['name'];
    out['accessory'] = pc['familiar_id'];
    if(!out['accessory'])
        out['accessory'] = pc['shield_id']
    out['extra'] = pc['isExtraDeck'];

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
        charOut['transcend'] = param['phase'];

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

        if(!master || !param)
            continue;

        weaponOut['name'] = master['name'];
        weaponOut['id'] = master['id'];

        var arousal = param['arousal'];
        if(arousal['is_arousal_weapon']) {
            var awakening = {};
            awakening['type'] = arousal['form'];
            awakening['lvl'] = arousal['level'];
            weaponOut['awakening'] = awakening;
        }

        weaponsOut.push(weaponOut);
    }
    out['weapons'] = weaponsOut;
    // TODO: ax
    // TODO: modifiable skills
    // TODO: handle ID'ing for multicolor weapons (ultima, ccw)

    return out;
}

var __hensei_out = __export_hensei(Game);
__hensei_out