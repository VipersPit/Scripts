module.exports.load = function () {
    global.RTD = {};
    var playerEffects = {};
    var MIN_COOLDOWN = 105;
    var MAX_COOLDOWN = 120;

    function Effect(name, chance, duration, type) {
        this.name = name;
        this.chance = chance;
        this.duration = duration;
        this.type = type;
    }

    var Positive, Neutral, Negative;
    Effect.positive = Positive = 0;
    Effect.neutral  = Neutral  = 1;
    Effect.negative = Negative = 2;

    var Short, ShortMedium, Medium, MediumLong, Long;
    Effect.short       = Short       = 10;
    Effect.shortMedium = ShortMedium = 15;
    Effect.medium      = Medium      = 20;
    Effect.mediumLong  = MediumLong  = 25;
    Effect.long        = Long        = 30;

    var VeryCommon, Common, Uncommon, Rare, VeryRare;
    Effect.veryCommon = VeryCommon = 1/15;
    Effect.common     = Common     = 1/18;
    Effect.uncommon   = Uncommon   = 1/23;
    Effect.rare       = Rare       = 1/25;
    Effect.veryRare   = VeryRare   = 1/30;

    // Name Chance Duration Type
    var effects = {
        // Emotes
        /*bigger_emotes: new Effect('Bigger Emotes', VeryRare, Medium, Positive),

        nobody_cares: new Effect('Nobody Cares', Common, Long, Neutral),
        im_blue: new Effect("I'm Blue", Common, Long, Neutral),
        happy: new Effect('Happy', Rare, Long, Neutral),*/
        emote_infection: new Effect('Emote Infection', Rare, Long, Positive),

        /*blank_emotes: new Effect('Blank Emotes', Uncommon, MediumLong, Negative),
        smaller_emotes: new Effect('Smaller Emotes', Common, MediumLong, Negative),
        random_emotes: new Effect('Random Emotes', Uncommon, MediumLong, Negative),*/

        // Chat text
        big_text: new Effect('Big Text', Rare, Medium, Positive),
        pew: new Effect('Pew!', VeryRare, Long, Positive),
        ye_olde: new Effect('Ye Olde', Rare, Long, Neutral),
        rage: new Effect('RAGE', Uncommon, MediumLong, Negative),
        small_text: new Effect('Small Text', Common, Long, Negative),
        screech: new Effect('Screech', Uncommon, MediumLong, Negative)
    };

    RTD.getTypeColor = function (type) {
        // positive neutral negative
        return ['#2de727', '#0a281f', '#e41a28'][type];
    };

    RTD.rollString = function (effect) {
        var obj = effects[effect];
        return "rolled and won <b style='color:" + RTD.getTypeColor(obj.type) + "'>" + obj.name + "</b> for <b>" + obj.duration + "</b> seconds.";
    };

    RTD.randomEffect = function () {
        return Utils.randomSample(effects);
    };

    RTD.giveEffect = function (id, effect, duration, timeout) {
        var ip = sys.ip(id);

        if (typeof timeout !== 'function') {
            timeout = function (){};
        }

        effect = effect || RTD.randomEffect();
        duration = duration || effects[effect].duration;

        // NOTE: These are not garbage collected, it's not necessary and keeps things simple.
        playerEffects[ip] = {
            effect: effect,
            timer: -1,
            at: sys.time(),
            duration: duration,
            active: true,
            cooldown: sys.rand(MIN_COOLDOWN, MAX_COOLDOWN + 1)
        };

        playerEffects[ip].timer = sys.setTimer(function () {
            if (playerEffects[ip]) {
                playerEffects[ip].active = false;
            }
            timeout();
        }, duration * 1000, false);
        return effect;
    };

    RTD.hasEffect = function (id, effect) {
        var peffect = playerEffects[sys.ip(id)];
        return peffect && peffect.effect === effect && peffect.active;
    };

    // If the result of this function <= 0, the player may roll the dice again.
    RTD.cooldownFor = function (id) {
        var ip = sys.ip(id);
        if (!playerEffects[ip]) {
            return 0;
        }

        return playerEffects[ip].at + playerEffects[ip].cooldown - sys.time();
    };

    RTD.getPlayer = function (id) {
        return playerEffects[sys.ip(id)];
    };

    RTD.takeEffect = function (id) {
        var ip = sys.ip(id);
        if (!playerEffects[ip]) {
            return false;
        }

        return (delete playerEffects[ip]);
    };

    RTD.effects = effects;
    RTD.MIN_COOLDOWN = MIN_COOLDOWN;
    RTD.MAX_COOLDOWN = MAX_COOLDOWN;
};

module.reload = function () {
    module.exports.load();
    return true;
};
