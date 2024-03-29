function __hensei_load_subskill(set_action) {
    var subskillsOut = [];

    for (var k in set_action) {
        var obj = set_action[k];
        subskillsOut.push(obj['name']);
    }

    return subskillsOut;
}

function __hensei_load_npc(npc) {
    var charactersOut = [];

    for(k in npc) {
        var charOut = {};
        var obj = npc[k];
        var master = obj['master'];
        var param = obj['param'];
        
        if(!master || !param)
            continue;

        charOut['name'] = master['name'];
        charOut['id'] = master['id'];
        charOut['uncap'] = parseInt(param['evolution']);

        var ringed = param['has_npcaugment_constant'];
        if(ringed)
            charOut['ringed'] = true;

        var trans = parseInt(param['phase']);
        if(trans > 0)
            charOut['transcend'] = trans;

        charactersOut.push(charOut);
    }

    return charactersOut;
}

function __hensei_load_weapons(weapons) {
    const uncaps = [40, 60, 80, 100, 150, 200];
    const transcendences = [210, 220, 230, 240];
    const keyable = [
        [13], 
        [3, 13, 19, 27, 40],
        [3, 13, 27, 40]
    ];
    const multielement = [13, 17, 19];

    var weaponsOut = [];

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

        if(uncap > 5) {
            var trans = 1;

            for(k2 in transcendences)
                if(lvl > transcendences[k2])
                    trans++;
                else break;

            weaponOut['transcend'] = trans;
        }

        var arousal = param['arousal'];
        if(arousal['is_arousal_weapon']) {
            var awakening = {};
            awakening['type'] = arousal['form_name'];
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

                axOut['id'] = `${augmentObj['skill_id']}`;
                axOut['val'] = augmentObj['show_value'];
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
                    keys.push(obj[arrKey]['id']);
            }
        }
        if(keys.length > 0)
            weaponOut['keys'] = keys;

        weaponsOut.push(weaponOut);
    }

    return weaponsOut;
}

function __hensei_load_summons(summons, qsID) {
    const transcendences = [210, 220, 230, 240];

    var summonsOut = [];
    
    for(k in summons) {
        var summonOut = {};
        var obj = summons[k];
        var master = obj['master'];
        var param = obj['param'];

        if(!master || !param)
            continue;

        summonOut['name'] = master['name'];
        summonOut['id'] = master['id'];

        var uncap = parseInt(param['evolution']);
        summonOut['uncap'] = uncap;

        if(uncap > 5) {
            var trans = 1;
            var lvl = parseInt(param['level']);

            for(k2 in transcendences)
                if(lvl > transcendences[k2])
                    trans++;
                else break;

            summonOut['transcend'] = trans;
        }

        if(qsID) {
            var paramID = param['id'];
            if(paramID == qsID)
                summonOut['qs'] = true;
        }
        
        summonsOut.push(summonOut);
    }
    
    return summonsOut;
}

function __hensei_clipboard_copy(str) {
    var textarea = $('<textarea>');
    $("body").append(textarea);

    textarea.text(str); 
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
}

function __hensei_export(g, callback) {
    var deck = g.view.deck_model.attributes.deck;
    var name = deck['name'];
    var lang = g.lang;
    
    var out = {};
    var pc = deck['pc'];

    out['lang'] = lang;
    out['name'] = name;
    out['class'] = pc['job']['master']['name'];
    out['extra'] = pc['isExtraDeck'];
    out['friend_summon'] = pc['damage_info']['summon_name'];

    var accessory = pc['familiar_id'];
    if(!accessory)
        accessory = pc['shield_id']
    if(accessory)
        out['accessory'] = accessory;

    out['subskills'] = __hensei_load_subskill(pc['set_action']);
    out['characters'] = __hensei_load_npc(deck['npc']);
    out['weapons'] = __hensei_load_weapons(pc['weapons']);
    out['summons'] = __hensei_load_summons(pc['summons'], pc['quick_user_summon_id']);
    out['sub_summons'] = __hensei_load_summons(pc['sub_summons'], 0);

    var str = JSON.stringify(out);
    callback(str);
}