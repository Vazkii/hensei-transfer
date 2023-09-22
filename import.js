function __hensei_import(nextData) {
    var data = nextData.props.pageProps.context;
    if(data == null) {
        alert('Please refresh the page to load important data, then try again.');
        return;
    }

    if(data.jobs == undefined || data.jobs == null) {
        alert('Some data needed to create a team is missing, please open a team that already exists and press F5, and then run the script again. This will not overwrite your team. You can offset this by bookmarking the New team page and running the script from there.');
        return;
    }

    var auth = __get_auth();
    if(!auth) {
        alert('This import script only works for logged-in users, please log-in or create an account.');
        return;
    }

    var ctx = {
        jobs: data.jobs,
        auth: auth
    };

    var userString = __get_user_string();
    if(!userString || userString.length == 0)
        return;

    var input = JSON.parse(userString);

    document.querySelectorAll('*').forEach((e) => e.style.cursor = 'wait');
    var buttonText = document.querySelector('span[class^="Button_text__"]')
    if(buttonText)
        buttonText.innerHTML = '<span style="color:cyan;font-size:22px;">Loading your team... this may take a bit</span>';

    setTimeout(function() {
        var newIdResults =  __get_new_id(ctx);
        ctx['party'] = newIdResults['id'];
        ctx['lang'] = input['lang'];

        __info(ctx, input['name'], input['extra']);
        __job(ctx, input['class'], input['subskills'], (('accessory' in input) ? input['accessory'] : ''));
        __chars(ctx, input['characters']);
        __weapons(ctx, input['weapons']);
        __summons(ctx, input['friend_summon'], input['summons'], 0);
        __summons(ctx, undefined, input['sub_summons'], 5);

        var redirect = newIdResults['redirect'];
        if(redirect.length > 0)
            history.pushState({urlPath: redirect}, '', redirect);
        location.reload();
    }, 250);
}  

function __get_new_id(ctx) {
    var newTeamData = __post(ctx, 'parties', {});
    var newId = newTeamData.party.id;
    var shortcode = newTeamData.party.shortcode;

    var url = `/p/${shortcode}`;
    return {id: newId, redirect: url };
}

function __info(ctx, name, extra) {
    __put(ctx, 'parties', ctx.party, '', {party: {name: name, extra: extra}}, true);
}

function __job(ctx, name, subskills, accessory) {
    var id = __seek_id(ctx.jobs, function(j) {
        return j['name'][ctx['lang']] == name;
    });
    
    if(id.length > 0) {
        __put(ctx, 'parties', ctx.party, 'jobs', {party: {job_id: id}}, false);

        if(subskills.length > 0) {
            var subskillsObj = {};

            var i = 0;
            for(k in subskills) {
                var ssName = subskills[k];
                var ssId = __search(ctx, 'job_skills', {query: ssName, job: id, locale: ctx['lang']}, function(s) {
                    return s['name'][ctx['lang']] == ssName;
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
            var options = __get(ctx, `jobs/${id}/accessories`);
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
    const keyMapping = { k13001: '1240', k13002: '1241', k13003: '1242', k13004: '1243', k14014: '1723', k14015: '1724', k14016: '1725', k14017: '1726', k10001: '697-706', k10002: '707-716', k10003: '717-726', k10004: '727-736', k10005: '737-746', k10006: '747-756', k11001: '758', k11002: '759', k11003: '760', k11004: '761', k17001: '1807', k17002: '1808', k17003: '1809', k17004: '1810',   k15001: '1446', k15002: '1447', k15003: '1448', k15004: '1449', k15005: '1450', k15006: '1451', k15007: '1452', k16001: '1228-1233', k16002: '1234-1239', k14001: ['502-506', '1213-1218'], k14002: ['130-135', '71-76'], k14003: ['1260-1265', '1266-1271'], k14004: ['1199-1204', '1205-1210'], k14011: ['322-327', '1310-1315'], k14012: ['764-769', '1731-1735', '948'], k14013: ['1171-1176', '1736-1741'] };
    const axMapping = { ax1588: 2, ax1588: 7, ax1589: 0, ax1590: 1, ax1591: 3, ax1592: 4, ax1593: 9, ax1594: 13, ax1595: 10, ax1596: 5, ax1597: 6, ax1599: 8, ax1600: 12, ax1601: 11, ax1719: 15, ax1720: 16, ax1721: 17, ax1722: 14 };

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

                var awkOptions = gridWpn['grid_weapon']['object']['awakenings'];
                var awkObj = null;
                for(var j = 0; j < awkOptions.length; j++) {
                    var awkOption = awkOptions[j];
                    if(awkOption['name'][ctx['lang']] == awkType) {
                        awkObj = awkOption;
                        break;
                    }
                }

                if(awkObj)
                    __put(ctx, 'grid_weapons', gwId, '', {weapon: {awakening_id: awkObj['id'], awakening_level: awkLvl}}, true);
            }

            if('keys' in obj) {
                var keys = obj['keys'];
                var series = gridWpn['grid_weapon']['object']['series'];
                for(k2 in keys) {
                    var keyGbfId = keys[k2];

                    var options = __get(ctx, `weapon_keys?series=${series}&slot=${k2}`);
                    var keyId = __seek_id(options, function(o) {
                        var itemId = o['granblue_id'];
                        var mappingKey = `k${itemId}`;

                        if(mappingKey in keyMapping) {
                            var mapping = keyMapping[mappingKey];

                            function __parse(val) {
                                if(val.includes('-')) {
                                    var toks = val.split('-');
                                    var left = parseInt(toks[0]);
                                    var right = parseInt(toks[1]);
                                    return keyGbfId >= left && keyGbfId <= right;
                                }

                                return parseInt(val) == keyGbfId;
                            }

                            if(typeof mapping == 'string')
                                return __parse(mapping);
                            else for(k3 in mapping) {
                                var mappingElm = mapping[k3];
                                if(__parse(mappingElm))
                                    return true;
                            }
                        }
                        
                        return false;
                    });

                    var k3 = parseInt(k2) + 1;
                    var reqKey = `weapon_key${k3}_id`;
                    var req = {};
                    req[reqKey] = keyId;
                    __put(ctx, 'grid_weapons', gwId, '', {weapon: req}, true);
                }
            }
            
            if('ax' in obj) {
                var ax = obj['ax'];
                var axPut = {};

                for(k2 in ax) {
                    var axObj = ax[k2];
                    var axId = axObj['id'];
                    var axMod = axMapping['ax' + axId];
                    var putKey = parseInt(k2) + 1;

                    axPut[`ax_modifier${putKey}`] = axMod;
                    axPut[`ax_strength${putKey}`] = parseInt(axObj['val'].replace('+', '').replace('%', ''));
                }

                __put(ctx, 'grid_weapons', gwId, '', {weapon: axPut}, true);
            }

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
                __update_summon_level(ctx, gsId, 6, obj['transcend']);

            if('qs' in obj && obj['qs'])
                __post(ctx, 'summons/update_quick_summon', {summon: {id: gsId, 'quick_summon': true}});

            i++;
        }
    }

    if(friend) {
        var smId = __search(ctx, 'summons', {query: friend}, function(c) {
            return c['name'][ctx['lang']] == friend;
        });

        if(smId.length > 0) {
            var frSmObj =  __add_and_fix_conflicts(ctx, 'summons', pos, {summon: {
                'summon_id': smId,
                'party_id': ctx.party,
                'position': 6,
                'main': false,
                'friend': true,
                'uncap_level': 0
            }});

            var frSmId = frSmObj['grid_summon']['id'];
            var allowedUncaps = frSmObj['grid_summon']['object']['uncap'];
            var uncapLvl = (allowedUncaps['xlb'] ? 6 : (allowedUncaps['ulb'] ? 5 : (allowedUncaps['flb'] ? 4 : 3)));
            var transcend = (uncapLvl == 6 ? 5 : 0);
            __update_summon_level(ctx, frSmId, uncapLvl, transcend);
        }
    }
}

function __update_summon_level(ctx, smId, lvl, transcend) {
    __post(ctx, 'summons/update_uncap', {summon: {id: smId, 'uncap_level': lvl, 'transcendence_step': transcend}});
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

    if(arr == null || arr == undefined || arr.length == 0)
        return '';

    return arr[0]['id'];
}

function __get_auth() {
    var match = document.cookie.match(new RegExp('token\u002522\u00253A\u002522(.+?)\u002522'));
    if(match)
        return match[1];
}

function __get_user_string() {
    return prompt("Paste your Export here");
}

function __get(ctx, endpoint) {
    return __fetch(ctx, 'GET', endpoint, undefined, false);
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