function __hensei_import(nextData) {
    var userString = __get_user_string();
    if(!userString)
        return;

    var input = JSON.parse(userString);
    var data = nextData.props.pageProps.context;
    var auth = __get_auth();
    var partyId = data.party.id;

    var ctx = {
        data: data,
        party: partyId,
        auth: auth
    };

    // TODO: support creating new team
    // TODO: copy manatura and shield
    // TODO: some sort of progress bar

    __info(ctx, input['name'], input['extra']);
    __job(ctx, input['class'], input['subskills'], (('accessory' in input) ? input['accessory'] : ''));
    __chars(ctx, input['characters']);
    __weapons(ctx, input['weapons']);
    __summons(ctx, input['friend_summon'], input['summons'], 0);
    __summons(ctx, undefined, input['sub_summons'], 5);

    alert('Import complete, reloading');
    location.reload();
}  

function __info(ctx, name, extra) {
    __put(ctx, 'parties', ctx.party, '', {party: {name: name, extra: extra}}, true);
}

function __job(ctx, name, subskills, accessory) {
    var id = __seek_id(ctx.data.jobs, function(j) {
        return j['name']['en'] == name;
    });
    
    if(id.length > 0) {
        __put(ctx, 'parties', ctx.party, 'jobs', {party: {job_id: id}}, false);

        if(subskills.length > 0) {
            var subskillsObj = {};

            var i = 0;
            for(k in subskills) {
                var ssName = subskills[k];
                var ssId = __search(ctx, 'job_skills', {query: ssName, job: id, locale: 'en'}, function(s) {
                    return s['name']['en'] == ssName;
                });

                if(ssId.length > 0) {
                    i++;
                    subskillsObj[`skill${i}_id`] = ssId;
                }
            }

            var failures = [];
            for(k in subskillsObj) {
                var send = {};
                send[k] = subskillsObj[k];
                var res = __put(ctx, 'parties', ctx.party, 'job_skills', {party: send}, false);
                
                if('code' in res)
                    failures.push(send);
            }

            for(k in failures)
                __put(ctx, 'parties', ctx.party, 'job_skills', {party: failures[k]}, true);
        }

        if(accessory) {
            var options = __get(ctx, 'jobs', id, 'accessories');
            var accId = __seek_id(options, function(a) {
                return a['granblue_id'] == accessory;
            });
            __put(ctx, 'parties', ctx.party, '', {party: {accessory_id: accId}});
        }
    }
}

function __chars(ctx, chars) {
    var i = 0;
    for(k in chars) {
        var obj = chars[k];
        var chName = obj['name'];
        var gbId = obj['id'];
        var uncap = obj['uncap'];

        var chId = __search(ctx, 'characters', {query: chName}, function(c) {
            return c['granblue_id'] == gbId;
        });

        if(chId.length > 0) {
            var gridChr = __add_and_fix_conflicts(ctx, 'characters', i, {character: {
                'character_id': chId,
                'party_id': ctx.party,
                'position': i,
                'uncap_level': uncap
            }});

            var gcId = gridChr['id'];
            if('ringed' in obj && obj['ringed'])
                __put(ctx, 'grid_characters', gcId, '', {character: {perpetuity: true}}, true);

            if('transcend' in obj)
                __put(ctx, 'grid_characters', gcId, '', {character: {uncap_level: 6, transcendence_step: obj['transcend']}}, true);

            i++;
        }
    }
}

function __weapons(ctx, weapons) {
    const elementMapping = [0, 2, 3, 4, 1, 6, 5];
    var i = 0;
    for(k in weapons) {
        var obj = weapons[k];
        var wpName = obj['name'];
        var gbId = obj['id'];
        var uncap = obj['uncap'];

        var wpId = __search(ctx, 'weapons', {query: wpName}, function(c) {
            return c['granblue_id'] == gbId;
        });

        if(wpId.length > 0) {
            var mainhand = i == 0;

            var pos = i - 1;
            var gridWpn = __add_and_fix_conflicts(ctx, 'weapons', pos, {weapon: {
                'weapon_id': wpId,
                'party_id': ctx.party,
                'position': pos,
                'mainhand': mainhand,
                'uncap_level': uncap,
            }});

            var gwId = gridWpn['grid_weapon']['id'];
            if('attr' in obj)
                __put(ctx, 'grid_weapons', gwId, '', {weapon: {element: elementMapping[obj['attr'] + 1]}}, true);
            if('awakening' in obj) {
                var awakening = obj['awakening'];
                var awkType = awakening['type'];
                var awkLvl = awakening['lvl'];

                __put(ctx, 'grid_weapons', gwId, '', {weapon: {awakening_type: awkType, awakening_level: awkLvl}}, true);
            }

            // TODO: keys

            i++;
        }
    }
}

function __summons(ctx, friend, summons, offset) {
    var i = 0;
    for(k in summons) {
        var obj = summons[k];
        var smName = obj['name'];
        var gbId = obj['id'];
        var uncap = obj['uncap'];

        var smId = __search(ctx, 'summons', {query: smName}, function(c) {
            return c['granblue_id'] == gbId;
        });

        if(smId.length > 0) {
            var main = offset == 0 && i == 0;

            var pos = i - 1 + offset;
            var gridSum = __add_and_fix_conflicts(ctx, 'summons', pos, {summon: {
                'summon_id': smId,
                'party_id': ctx.party,
                'position': pos,
                'main': main,
                'friend': false,
                'uncap_level': uncap
            }});

            var gsId = gridSum['grid_summon']['id'];

            if('transcend' in obj)
                __put(ctx, 'grid_summons', gsId, '', {summon: {uncap_level: 6, transcendence_step: obj['transcend']}}, true);

            i++;
        }
    }

    if(friend) {
        var smId = __search(ctx, 'summons', {query: friend}, function(c) {
            return c['name']['en'] == friend;
        });

        if(smId.length > 0)
             __add_and_fix_conflicts(ctx, 'summons', pos, {summon: {
                'summon_id': smId,
                'party_id': ctx.party,
                'position': 6,
                'main': false,
                'friend': true
            }});
    }
}

function __add_and_fix_conflicts(ctx, namespace, pos, data) {
    var obj = __post(ctx, namespace, data);
    
    if('conflicts' in obj) {
        obj = __post(ctx, `${namespace}/resolve`, {resolve: {
            conflicting: [obj['conflicts'][0]['id']],
            incoming: obj['incoming']['id'],
            position: pos
        }});
    }

    return obj;
}

function __search(ctx, endpoint, query, filter) {
    var results = __post(ctx, `search/${endpoint}`, {search: query});
    return __seek_id(results['results'], filter);
}

function __seek_id(arr, filter) {
    for(k in arr) {
        var obj = arr[k];
        if(filter(obj))
            return obj['id'];
    }

    return arr[0]['id'];
}

function __get_auth() {
    var match = document.cookie.match(new RegExp('token\u002522\u00253A\u002522(.+?)\u002522'));
    if(match)
        return match[1];
}

function __get_user_string() {
    return '{"name":"Bennu","class":"Manadiver","extra":false,"friend_summon":"Tiamat Omega","accessory":3,"subskills":["Secret Triad","Wild Magica","Blind"],"characters":[{"name":"Estarriola","id":"3040163000","uncap":4},{"name":"Niyon","id":"3040038000","uncap":6,"transcend":5},{"name":"Lich","id":"3040427000","uncap":4},{"name":"Katzelia","id":"3040166000","uncap":4},{"name":"Tien","id":"3040039000","uncap":6,"transcend":2}],"weapons":[{"name":"Coruscant Crozier","id":"1040418000","uncap":4},{"name":"Last Storm Harp","id":"1040808300","uncap":4},{"name":"Last Storm Harp","id":"1040808300","uncap":4},{"name":"Spear of Renunciation","id":"1040212600","uncap":5,"keys":["1241","1734"]},{"name":"Ewiyar\'s Beak","id":"1040912400","uncap":4,"ax":[{"id":1591,"val":"4"},{"id":1594,"val":"5"}]},{"name":"Ewiyar\'s Beak","id":"1040912400","uncap":4,"ax":[{"id":1591,"val":"7"},{"id":1599,"val":"1.5"}]},{"name":"Innocent Love","id":"1040811600","uncap":5},{"name":"Mandjet","id":"1040315400","uncap":4,"awakening":{"type":1,"lvl":15}},{"name":"Mandjet","id":"1040315400","uncap":4,"awakening":{"type":1,"lvl":15}},{"name":"Ultima Staff","attr":2,"id":"1040410800","uncap":5,"keys":["731","758","1809"]}],"summons":[{"name":"Tiamat Omega","id":"2040020000","uncap":5},{"name":"Temperance","id":"2040316000","uncap":5},{"name":"Judgement","id":"2040322000","uncap":5},{"name":"Beelzebub","id":"2040408000","uncap":4},{"name":"Belial","id":"2040347000","uncap":4}],"sub_summons":[{"name":"Raphael","id":"2040202000","uncap":0},{"name":"Tiamat","id":"2040402000","uncap":0}]}';
    //return prompt("Paste your Export here");
}

function __get(ctx, namespace, id, endpoint) {
    return __fetch(ctx, 'GET', `${namespace}/${id}/${endpoint}`, undefined, false);
}

function __put(ctx, namespace, id, endpoint, payload, async) {
    return __fetch(ctx, 'PUT', `${namespace}/${id}/${endpoint}`, payload, async);
}

function __post(ctx, endpoint, payload) {
    return __fetch(ctx, 'POST', endpoint, payload, false);
}

function __fetch(ctx, method, endpoint, payload, async) {
    var xhr = new XMLHttpRequest();
    var url = `https://hensei-api-production-66fb.up.railway.app/api/v1/${endpoint}`;
    xhr.open(method, url, async);
    xhr.setRequestHeader('content-type', 'application/json')
    xhr.setRequestHeader('authorization', `Bearer ${ctx.auth}`)
    
    if(payload != undefined)
        xhr.send(JSON.stringify(payload));
    else xhr.send();

    if(async)
        return '';
    
    return JSON.parse(xhr.responseText);
}

__hensei_import(__NEXT_DATA__);