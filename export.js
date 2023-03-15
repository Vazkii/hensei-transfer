function __export_hensei(g) {
    const uncaps = [40, 60, 80, 100, 150];
    const keyable = [
        [13], 
        [3, 13, 19, 26],
        [3, 13, 26]
    ];
    const multielement = [13, 19];

    var deck = g.view.deck_model.attributes.deck;
    var name = deck['name'];
    
    var out = {};
    var pc = deck['pc'];

    out['name'] = name;
    out['class'] = pc['job']['master']['name'];
    out['extra'] = pc['isExtraDeck'];

    var accessory = pc['familiar_id'];
    if(!accessory)
        accessory = pc['shield_id']
    if(accessory)
        out['accessory'] = accessory;

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

        var trans = param['phase'];
        if(trans > 0)
            charOut['transcend'] = trans;

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

        var series = parseInt(master['series_id']);
        weaponOut['name'] = master['name'];

        var id = master['id'];
        if(multielement.includes(series)) {
            var attr = parseInt(master['attribute']) - 1;
            weaponOut['attr'] = attr;
            id = `${parseInt(id) - (attr * 100)}`;
        }
        weaponOut['id'] = id;

        var uncap = 0;
        var lvl = parseInt(param['level']); 
        for(k2 in uncaps)
            if(lvl > uncaps[k2])
                uncap++;
            else break;
        
        weaponOut['uncap'] = uncap;

        var arousal = param['arousal'];
        if(arousal['is_arousal_weapon']) {
            var awakening = {};
            awakening['type'] = arousal['form'];
            awakening['lvl'] = arousal['level'];
            weaponOut['awakening'] = awakening;
        }

        var augment = param['augment_skill_info'];
        if(augment.length > 0) {
            var actualAugment = augment[0];
            var ax = [];
            for (k2 in actualAugment) {
                var axOut = {};
                var augmentObj = actualAugment[k2];

                axOut['id'] = augmentObj['skill_id'];
                axOut['val'] = augmentObj['effect_value'];
                ax.push(axOut);
            }
            weaponOut['ax'] = ax;
        }

        var keys = [];
        for(i in keyable) {
            if(keyable[i].includes(series)) {
                var j = parseInt(i)+1;
                var arrKey = `skill${j}`;
                if(arrKey in obj)
                    keys.push(obj[arrKey]['name']);
            }
        }
        if(keys.length > 0)
            weaponOut['keys'] = keys;

        weaponsOut.push(weaponOut);
    }
    out['weapons'] = weaponsOut;

    return out;
}

var __hensei_out = __export_hensei(Game);
__hensei_out

