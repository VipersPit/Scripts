global.Emotes = {
    list: {},
    names: [],
    display: []
};

(function () {
    var emoteRegex = {};
    var nonAlpha = /\W/;
    /*var marxmotes = ["lenin1", "stalin1"];*/

    var emojiRegex = /:([a-z0-9\+\-_]+):/g;
    var emojiFile = sys.getFileContent(Config.datadir + 'emoji.json') || "";
    var emojis = {};

    if (emojiFile.length) {
        emojis = JSON.parse(emojiFile);
    }

    Emotes.code = function (name) {
        return Emotes.list[name];
    };

    Emotes.random = function () {
        return Emotes.names[sys.rand(0, Emotes.names.length)];
    };

    Emotes.add = function (alts, code) {
        var regex, alt, len, i;

        if (!Array.isArray(alts)) {
            alts = [alts];
        }

        len = alts.length;

        for (i = 0; i < len; i += 1) {
            alt = alts[i];
            Emotes.names.push(alt);
            Emotes.list[alt] = code;

            regex = Utils.escapeRegex(alt);
            if (!nonAlpha.test(alt)) {
                regex = "\\b" + regex + "\\b";
            }
            emoteRegex[alt] = new RegExp(regex, "g");
        }

        Emotes.display.push(alts.join(" | "));
    };

    Emotes.addUnlisted = function (alts, code) {
        var regex, alt, len, i;

        if (!Array.isArray(alts)) {
            alts = [alts];
        }

        len = alts.length;

        for (i = 0; i < len; i += 1) {
            alt = alts[i];
            Emotes.list[alt] = code;

            regex = Utils.escapeRegex(alt);
            if (!nonAlpha.test(alt)) {
                regex = "\\b" + regex + "\\b";
            }
            emoteRegex[alt] = new RegExp(regex, "g");
        }
    };

    Emotes.format = function (message, limit, src) {
        if (!Config.emotesEnabled) {
            return message;
        }

        var emotes = [],
            emojiCount = 0,
            uobj = SESSION.users(src),
            timeout = 3,
            lastEmote = [],
            time = sys.time(),
            size = "",
            auth = true,
            i;

        if (limit && src && uobj) {
            //timeout = perm ? 4 : 7;
            if (uobj.lastEmoteTime && uobj.lastEmoteTime + timeout > time) {
                lastEmote = uobj.lastEmote || [];
            } else {
                uobj.lastEmote = [];
            }
        }

        /*if (src) {
            if (RTD.hasEffect(src, 'bigger_emotes')) {
                size = " width='100' height='100'";
            } else if (RTD.hasEffect(src, 'smaller_emotes')) {
                size = " width='25' height='25'";
            }
        }*/

        function assignEmote(emote) {
            return function ($1) {
                var code = false;

                if (emotes.length > 4 || (limit && lastEmote.indexOf(emote) !== -1)) {
                    return Utils.escapeHtml($1);
                }

                emotes.push(emote);

                if (limit && uobj && uobj.lastEmote) {
                    uobj.lastEmote.push(emote);
                    /*if (!EmoteUsage.hasOwnProperty(emote)) {
                        EmoteUsage[emote] = 0;
                    }

                    EmoteUsage[emote] += 1;
                    Reg.saveVolatile("EmoteUsage", EmoteUsage);*/
                }

                /*if (marxmode && marxmotes.indexOf(emote) === -1) {
                    emote = Utils.arrRandom(marxmotes);
                    code = Emotes.code(emote);
                } else if (georgemode) {
                    emote = "george1";
                    code = Emotes.code("george1");
                } else if (src) {
                    if (RTD.hasEffect(src, 'blank_emotes')) {
                        code = emote = "invalid";
                        size = " width='50' height='50'";
                    } else if (RTD.hasEffect(src, 'nobody_cares')) { // Sorry for the inline html!
                        emote = "nc";
                        code = "data:image/gif;base64,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";
                    } else if (RTD.hasEffect(src, 'im_blue')) {
                        emote = "blu2";
                        code = "data:image/png;base64,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";
                    } else if (RTD.hasEffect(src, 'happy')) {
                        emote = "hface1";
                        code = "data:image/png;base64,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";
                    } else if (RTD.hasEffect(src, 'random_emotes')) {
                        emote = Emotes.random();
                        code = Emotes.code(emote);
                    }
                }*/

                if (code === false) {
                    code = Emotes.code(emote);
                }

                return "<img src='" + code + "'" + size + ">";
            };
        }

        // First, pokemons, icons, items, and avatars.
        // pokemon:subtitute|pokemon:30&cropped=true
        if (src && !Utils.mod.hasBasicPermissions(src)) {
            auth = false;
        }

        if (auth) {
            message = message.replace(/((trainer|icon|item|pokemon):([(\d|\-)&=(gen|shiny|gender|back|cropped|num|substitute|true|false)]+))/g, "<img src='$1'>");
        }

        for (i in Emotes.list) {
            if (emotes.length > 4) {
                break;
            }

            // Major speed up.
            if (message.indexOf(i) !== -1) {
                message = message.replace(emoteRegex[i], assignEmote(i));
            }
        }

        // Emoji effects
        /*if (src) {
            if (RTD.hasEffect(src, 'bigger_emotes')) {
                size = " width='44' height='44'";
            } else if (RTD.hasEffect(src, 'smaller_emotes')) {
                size = " width='11' height='11'";
            }
        }*/

        message = message.replace(emojiRegex, function (name) {
            var emoji = name.substr(1, name.length - 2),
                code;

            if ((emotes.length + emojiCount) > 5) {
                return name;
            }

            if (emojis.hasOwnProperty(emoji)) {
                code = emojis[emoji];

                /*if (src && RTD.hasEffect(src, 'blank_emotes')) {
                    code = "invalid";
                    size = " width='22' height='22'";
                }*/

                emojiCount += 1;
                return "<img src='" + code + "'" + size + ">";
            }

            return name;
        });

        if (limit && uobj && uobj.lastEmote && lastEmote.toString() !== uobj.lastEmote.toString()) {
            uobj.lastEmoteTime = time;
        }

        return message;
    };

    // Enum for Emotes.format, not literally rate limiting all the time
    Emotes.ratelimit = true;

    // Accepts either a name (the player must be online) or id
    Emotes.enabledFor = function (src) {
        var id = sys.id(src) || src,
            name = SESSION.users(id).originalName.toLowerCase();
        return Emotetoggles.hasOwnProperty(name);
    };

    Emotes.load = function () {
        var emoteSource = JSON.parse(sys.synchronousWebCall(Config.emotesurl)),
            emote;
        delete emoteSource["@NOTICE"];

        Emotes.list = {};
        Emotes.names = [];
        Emotes.display = [];

        for (emote in emoteSource) {
            Emotes.add(emote.split(','), emoteSource[emote]);
        }

        // Misc emotes
        Emotes.addUnlisted(":(", "item:177");
        Emotes.addUnlisted(":charimang:", "pokemon:6&gen=2");
        Emotes.addUnlisted(":mukmang:", "pokemon:89&gen=1");
        Emotes.addUnlisted(":feralimang:", "pokemon:160&gen=2");
        Emotes.addUnlisted("oprah1", "pokemon:124&gen=1");
        Emotes.addUnlisted("oprah2", "pokemon:124&gen=2");
        Emotes.add("depnv", "data:image/gif;base64,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");
        Emotes.add("depyeah", "data:image/gif;base64,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");
        Emotes.add("depgay","data:image/gif;base64,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");
        Emotes.add("kermit2","data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAB3QSURBVGhDRZl1cJ3pleZVySazmckmPd1tElpkMV0xM8uWhbaYZTEzMzNYYIsttJgtybZkyZKx7cYJdWYmU7u1O1u72alKaivpTj37vFfu2j9OvVffle3ze5+Dn2UaW8rR2FyGhoYi1NTkoaI8HWXFd1CQG4ucjEhkpoUjJysaRcVJqKnNQltrEfq6KzAyXI+5qQ6sPxzAzup97G+O4enOJJ49eoDnj+fw6tky3r/cxtfvHuObzw/x9fun+PLtAd6/3sfbV/t4/XIPr6T2CGen2zg+3sCzozWcPtvAy+MtvOLPZ4ereLwzg4XZu+jtqUBVfTpKqpNRXJWG4sp0FNPXyrpc1DcXQaa1swot7ZVobqsgUCnq6vJQXZmJ8tIUFOXHIy87BgV5sQRMRXNjHno7y3DvbjUejDZhaaYbm0sD2FsfkUIc703j+cEszp7M47UUZAtff3ZAmCf44s0+3tHpN2e7eHm6gxfPt6UAZ/x8+nwLpydbfLbF77fxls9fEuToYAkba5OYmOpBOy+vrDYdBVUpyK9MQWFFGorK01Bek43apgLItHfVoq2zBq0dVVKYpuZi1Nfno7YqC5VlqSgtTERFyR001mSiu60Yw32VGBuswcxII1Zmu7C7MojD3QmcPp7Fy8MFvD5aJMQS3hwv493ZJj5/uUuAXamDL082cXa8iZNn6zg+WscJPwsIAfbqbAdvCPBaQPG7J/uL2NqaxcLiKO6Pd6G1qxzF1WnIK09CTlkS8mjFH0BqBEhnTzWEtXdVoVUo01KKxoYCNNZSsqoM1JaloLk6E51N+RjoKsXo3UpMDtVijopszHXjycYIzh7P0PElvDtdw+cvNvD+bB2fPV/Dm5M1OsZQOdlgyKzh5HAFR09WcPh4Gc+eruD58TpenW7hLSHOAValKuztzmNjYwZLK5OYmbuPoZEONLWXoaA8BVmFcbQE5Jcko7QyQxpatU2FkOnjDff1V6GHMdjZUYY2KtLcmI+2hjy01eWgqyEHkwM1mB1pwYP7TZgaqsH8aAOWp1qx+7APz3bGqcJDfPFiHV+/2cFXtC9ebeOzUxHrazh7topTAhw/WcLhwSKe8qaPHi/hOeP/FQHfEOQlgY743e72DNYZSkvL41hYGsfcwzFMzgzh7nA786AUeUXJSM+JRiZDvrA0DRXVVKMh/zxHBgfKMTRQgYG75ejvKWX4FKKrKQ89tLst+ZgeqsPmTC9DZx17q+PYnOvB+nQ7Nmc78Xh1EGf703h/uopv3u7gn97tMSf28fnrXd7yJl4QQgAcHTzE4f6C1MTn06fLLAbreE2AFwR69mQZT/j8gLa1M4vtR3NYWX+AmYVRTE7fw/2xXrS0ViK/MAkZOTHIKUhACRO9SqjRWHAOcn+wDCNDwspx/24phrpLMECYobYCrAxXY5958ObRPI54W/sr9/Fsm/mwN4PnzItnW6N49XSOamwQYA/fvH/MxD7A529EUotQYSjtz+Ppo1kc0rljKcQSnV/BGUNLgB6dTGH7pAfLT5ux8qwBq89a0DdSid7BVgL0Y2C4C8MjvXjwYJghX4S8/AQUFCWhjDlcU1+AuqYiGkNr8l4Zpu6XY3qkAlPDFRjvL8NoTwkWBitxONuKz3am8HzrAfaWhuj4JN7Rud++P8Kvae+fr+LNs0Um9Rq+IsjXnxPk/Q8gTORD5sLeHI4Ickyg08cEoUIvRb6czmBurxJloz6IazVGaJ0+btfowj9bHyoaikhIjkHf3VZ09zUzhxtojejqqkNxMSsWW0H5B5Aa5nN1fR5k5scqsDBehYe0Wd7EFENtmmG2P9uGl+wNx2vj2JjqxJOVEbzeG8cXhzP4+sUWvv3yjBVph7aNz5kTX7x9JIX46oMi0tAiyAlBTgjynGH1iko8J8Di41pUjt9EbIsx/Eo04ZmrBq88NXjnayAi0xsWlqaorClAd28DugjRQYCm1grU1BWijk4LkFK2iCoWpMraHGmuyCyPVmKFECvj1VgZq8F0fwke9OTjZO0uTjbGsDbRgo0HXThZ7cabGXe8WbyBtzvp+OygFl+cLTGcjvBPXxyx6Z2rIezLt3t4/2Kbaq3hxeNFaXM8fTmD5Sf1qJ3yR0KbCQE04JGtCrdMFbhnqvGzGjyzryG1LARRMcGoZRi1d1ajraP6HKK+EIUlqWjryUN9U460GQqA8uoshlkmZDYYUtsE2SbIXH0ihtOvY6IgGKst6RgricKDlmxsjdbh+UwW3k9b4e1iMl5PueDVojPePR/Br754RnuKX391iN/96pRQT/ENu/m7t+zMr2dx8HwQk7sFqJr0RVKXBUJr9eBbpAmXdBU4pSnDmad7FkFyCEK7mW6GgspEaQI3tBRLc0DcfBGrVFJqBELTbVHdGU3FsqSqCAiRLzIH4xV4Nl2LvfZkTIcaYdRbDRM3tTF4XR2djkro9dHEULQEKxWmeH/PBs/z/XGc7ouTMie8222Tjh1fvN7B7397hn/757f4w7dv8Juvj9A/n4ysHnukdtkwB0wQ2SDBrSo9+BVrwStHnUqowTlNRQrkmqlKED4jkEOSMrwSJUjOu8XOnYyismRkF8QhMSUE/hEOsI9QQXCuISqb7jBPMqhIpjS8ZM6mq/DZg1I8z3bGaZg+XoQb4nWkAc4idXHor46zUE3sxBjhsEwH30wY4MthC7ypN8OLdne8f8LbbshGXagjRmtS8WRpkCV4n1AvcX+hCP6Z1+Cbp46gUh0ElmrDt1CEkxpDSRWuGYSgCQjXDFU4pSrDLvkqrBIUYRmtAMtQFTjzYj3DLeERbg7HEF1YRyjDKkoB9jGKSKpwZUfn9EEIUYJl3s/V4Ju+BPwh3Qr/O9Uaf8q3x58r7PAf1bb4X7mm+D8FFvhtoQu+bTfCv01q4DcP9fHlkgRv9zLw9uU6GkMdEK/6IyRc+xnu6Pwjcu010RrhynyrR113ErzjNOCeqAyfLN4688GDt+5GFVwYVsJ5xw9md0cJdklXYZ2oCGvCWMcJIEVYRCrCSpyEs4qR5zN5KYxH8jUUNoYx9AqkISjzq4f1+E2lP/5MiO/LXPF9pze+3wrC317F4G9M7L9N3MIfO2/h99V6+NchFXw5pIQ3I+p4uRLDqjSHcmdtJCn/GMkqP0XS1f+ERMWfIFHpJ0jx4T9U6IfYLDtYeMnCyl8WjrGKcKazLqnCCEAFBIADnwlzSuEzmsgbZ37vnCpO5hKf2d9RhG08AWOoVqQCbAhzO88EVa0paGorg8y/r9fjf5T64LtUW3xX5Y6/Lofg+38vwfd/m8T3v0vE9+vx+J8t13ESpo6lQEVM3rqIybgreFjtiaH0AGSr/xzpdDxN7sdIufwjpF75EXKsGS7XVWDldxGOYfzHgxVg7CMLic8VmBLIKlQe9rEKsItnmPD2He4QKJGKUA0HwgnHnVOuSmFcRR7xdEomcIISbKmOFVWyDOPfEaOE+DIXNHawIf5xox5/LPPB9wyf7xp98JeHt/HX/6jHd3+qw/cnQfhrpx3+a4EEL2I08dBLGT3WCqiVyKHc4DIKNT9CrurPkaX0M2TI/hSZl3+CbOVf4EFvDcpbUuB8SwW2t+SYoApwoAP2UUqwuq0AEz85GN64AkPfKzC5fQWW4XKw4U2L27bhrdswrGwJaUtIe6EYQYV69vECRAnW4Qy1EIZZmALcEtWRXx8KmX9haP0h0xPfJdnguxI3/PVuAP6yF4XvDsLw3YAz/txsh//e5Igv803xKFgF057yGHCUQ5uNLOrML6HC6CIKdD9F7rWPpRCd0ddxyF1j/3Adte0ZcLmtCofbvOlQJdiH0SneplMsneJtWvJn4wB5GNyQhR7VMvSThVGALExvy8OccBYR4pRnnjA/mCN2H0CsQhVhygsyI4wVlQlINYbM71ea8a+VdL6QoZXnhP9b6oS/FFvju1o7/KXGBv8tX4LPknWwf0sVC86yGLO+hH7LS2i3uIgmgtSYXESp0QUU6V1Aha06dsQ8xt1jj6PI8sYDZJUHwz2E1SlEFS5hjPcw5gPNPpxn1FXYEsw6UglmtxRg5C8HXW9ZaLlfhpbHZWh7XaLx5Gf9m1SOQNb8ffNgOZgEytLkYBokB4dwFch8u9GEr7ri8C+NrvhTsjl+zTL3bawO/jlJB3/IMMDvCk3wIlkPKz5KmDS7iGGdj9Cm9QvUaP4SlRq/ROm1X6BI/SMUanyM0cpUnL7ewyG3u10OiEtrU+i/34CQOybwCmfZjVCHSzgVIphtkDIsAwgQoABJgBwkwXQsRA7GIbIwpJM6BFJ3vgwVm4tQtbkEA19ZhqACzILlYczPRiI0aUb8bO6vCJnTB9V4MV6Cl/W38as4Cxz7qGLzphLWGN/bLJ1PMnWxEauN+RsqmDS/jCGtf0ST2s9QrvyfUaz0UxQo/ARFV/8eDV6m2Oc89Yyr7BPu3TvcOx6ujGN0ohcltdHwimTZjWAR4OnM044wlsFKkPjJQ9eXt+7L2+ep48fbJ4ghb13C8DGh42YMNQuGmAlv38DrCnQcL0GLpuPG3+XPZr4KkHk0VIKD+yV4MlKC436OIfVRWI82xdANRdwLU0Ufb7HLTwVjHsqYsZPHEHOi8drPUX7171Ak/2PksdyWmsphdrAWRy92mB9b5yB7D6Ug98a60dFbhchMW4aVEiFYlSJZpWjWEaICKcA0jGqEMubprHkknWavsGGptotTkp5CCaObVMnlMjQsqZDJBaiaX4CGw0XoMAxNrxNkrTcP6/15WOW52pePpwR6O1aM1VJfDEXooi/4Gqqvq6Ha9SqG7OUxYnYZ3Xofo171H1Cm+Hco1PoIvXnh2OOk+/R0U5roj6UgVGR5AvdGu9HV24Ti2ni4RzGs6JQjc8JO2gvkYcsmZyMsjj9LTR7WsaxI/M6ccMZMfn3miQZDTFlyAUr6n+Kq8acMN4I4UUWqYnJdHjJLHRlY7c7GWlc25lvTsNCWjiPOXy8mS7HOsjYSa4KWQF1UcgZrsr+MTuNP0Kn3CVq0fola7Y/QGuaMFY74+0drUjUOT3eoyCZDawmLKxPct7sgXnC0dlQiJseZiU7n6aB1GE2UXSpgHSkHqwg5mPOZyW32m6DLrGQMMzqpYXcRKiafEuATKBp8AmUqoWZ/EZquhBBFwPsKe5QcQei4gFhpy8BsQxKmeXML9QlYZ8fc78/Fk+YIzKc5YCBQB/12sugx+iVadP8LGszk0BXjgdnJTmxw3zjgrnHI/ftIgBwLkPMcuXuvHY0cwxtbKjkb5eB2mjnsCGJDswqVZT+QZcWShTEbpb4Pc8XtEjQd6awVAYwvQFHvUwJQBbNPzwH4/XlFu0KQK9BlaBl7E0QArHdkYaU1HfP1SZivTcRibQLmKmOx3JKK/YEEbGQ6YzlIH6MO8uh1uIKRRGf0VadgbLwNC8sj2NydxWPxBuR0G88I8pQguwdLWCCIWFmrG0q4xRVzjyhDeX0KfOP1YMsKZU2zYEIbsbTqehPA5RLU7S5B1eqC9OaVzZgLVnzmcAkaApAhpuMtjBCehCGEtvMlGLpfgczD5hQsE2KlOR2L9clYrLuDJcLMVcUzb5Iw1uWN9nRr1IZLkMGxoybfCrMzdRgcbsTYVAfml+59AFljxdrBMavW4fGWFGSeIN13m1FWXcCdIY87RD5qCZRXHgH3SHVYE8JSVCZWKSP/K9AT4cTGqOlBp2lawlnhNJ9pUy0doZi0r/A7dxqTX5slWt+NINNUYZFL1EZbFtYIs9KYjCXCCGWWh2LQW++IijvmyAkzQGSAGitQCMa5NQ4MNWCMYTW/NIzNnRkm+AeQF49wePIBZJkgAy1SkNKKXO4Peaiqzkd1TS7u5PjAjh3fimXWjGbK3DAOZl8IvAIDhpkeVdLjqSNOjjICQjiv6cqTymk4MsyolBYT3kCATDUkY5nhtdOZg93ObOYGlZE+S8PSeCSaS61RlGCCFDbK6HANjExmY2ioHncJMjpBkMVhbAgQhtYPIEcn23j0eJk5MoEehlZ5TSFB8lBeSVWquGfTyspTEZxizoGSSU5FzNkQTYOY6EIdARMgTAARRkBQBQ2GkTqTX93uAq7x1LAnCPuJgassFWEeiGTf7cvDQX8+drrP82WtPwPjQ36oyjFHdrQBYm5pIj3HDBPT1ejtq8bd4foPIPfOQcT7KeaHCK1zkBVp1eobakdlXTHVKOCOnU8IYbmoqsxGaX0MG6QqTP1YeXjzxv6XIaEKRlKIc2UMOH/pUhFt5oYYXa7ReTXriywGF6DO8xrLsr4LFZntyIToJY8Gi3AwWIhd9pS1rhysjKShq90F+WkmSAzXwa0gFZQ3eWJiqokgNRhgjgiQOSnItLRq/f9kZ2h9UKR/uBM1jeWoqitCNa2qhvt7NZWpyEZVVToismykihjTWaPrNDF2EEr/JkswTwEilNHnxKzP3xF5Ia1o5qxillSGMPquBJnpysUSG+HmQCG2aJtUZbU3H/PjiaittUJaoj4iQtQRwOm1fyIeYxNt6Buox+C9ZoZZF2Yf3sPa1jT2ni6zj2ziSHT2ow1ss/zOE+TuvS7Ut1YRphS1rF619UWoqaUqQpHiNGTkBsOFI4vYUwwZQvqsXqIM6/mwGgkgqiVVhrAS5pCEoSZyQ5UdXkX0FIsLMHBh+Z3qzMUCHV/pL2A4FWCFUAs9Obg3wOW/WIKEWE0E31JGUKwyJpeKMDregcH7LRgeacPIBEEWhrC6OUUFFtk/1qUD48HhGjY5oswujaH/XqcUpLapgmtpGeobCVNHVQhSUpSK3OwYhKZYSZPeiLOW6OK6wlix9KmQ7nV+phL6nMEMAziOMJck1+XYKC9B2ZQdnmbmwel3rDUT0wylhZ48LHTnYaYjGw86M9HT44vMbCZ4tDr8WV1C0q5heqVW6vz98U6pjU52Y2ZhECsbk1RgAQdM+CesXvtPV1iS5zG7OCoFaWirQT0bYkNLhbSX1FGVqqocgqQgJysWeZW34RGnBlOGkIFwnhBarhfY2TlLMcl1mR/6LM2GzCGRP2IClrAJqgtV2PWd/HUhM9yYhgmW3mkBQKjRhjQMN91hN3ZGcroWwqNVcYMLTFyhIZZ3e9g7emk9hOBngkzPD2J5fQLbe/PcQZa5UK1g7/ESNrZnqdZ9JnsHGgnSQFUaWwnTXI66BuYLQUpLUlGQl4CK1ijczNSCzW32FMIIRUR5VbMWCc2ZihVK20UMiITijiIKgjn3F7MbCtCxvYLr4WaQ6a9Nwf3mTIy1ZON+fRr6KhLRXR3DbmyHxDQN3IpShjdnoJwmJyxvD2OEIKMP+ngSZqIHU7MD3DvGsfVojpVqSbpQ7XAXEXkzPX8PfSy/AuIHRRqazxWprs4hTCY6u1mOu2/CN0uLY70C7bwM61EZTVYpVSazkoRjiuHHHFM+Zun9lAl/UToNW4Vw5w9WRlS6K2R6a1Ix3JiJe43Z6K9KQXtRLDqrYlHd5IDYFDUERCnCI1wWDSOBOHo1j/Hpu7hHgHsT3dL/SZqY7cfD1TFssLuLPNkljAgzkTfTc8MsDC3nIdUsIMRJkIZCNDYWsheVov1uKArrbZFUbAKfWC3OTfLs1JeYL6xeogTTYQ1WqqsWn0JB8gkUCKRs9gnLMJOc4WbHIpRa6g2ZvtoMDDVlY5AgPVVJaCuOQWtZNCrqnRCRooIbnFYdAi8hIEMTo5uZePpiBguro6xYvRge7cDYdB+r0yjW2Eu2qcT2wSI2qY4It6mZAfT0N6GOFUtqIj+Y7I1NJegnROvdEJQ22aO43gZFhMmtssLtBG3YelIZdy5UntwCmS9GHFEk3OsNfBh27gSzvwJVWzZGp4t8dhn+SUaQGWjKw2BzHu42ZDOkUtBWFo+WMipS44PQZO7aYnxgbBr7XcL1XFVUj93EwtMq7J4OYfdwCqvbwqY5Ac9jh4psUY11qrO4Oo7xB/3o7G1g2S1FS3s1ugnV0laFrr5iNPYE0Xk7FDfYoqTRFqXNdtIzp8IUsWlaCIlVQxD3l5vc8wPYNEPi1RCSqI7QJIZ7ggZuRKnDjVumQ6ASPEJVIbM81YXFCQ5/o62Y5tgx0V+Fke4y9HWmITFfwvWU+wLj1oo7gw0XHodkedwoUEV8ixkaZm5hci8f6yet2Dntw/G7WTz/bBnHb5fw5GwOG/sTWNwcwvxGN+Z3G/HotJcL2H00dIYgIUuCrFIz5FdboLDGEgU8cyvNaKZIZ2GJY35GJakhOvkaYpI1EJ+miUQWnzsZ2jy1kZCqidhkTUQSKoIruczOfBfWZzqwMtWGxfFmLIw1YXakCQ/u13P0DobvHa6msXKwE+uneCUTxxU0nstRojxcMhThW6SGsDpdJHWYomDQFXUP/AgYgLaHwehaCkfjTCDKxz0JbozkZis09gXyhrXhF6mBrBIT5JaZILNIAt8w/j1J2sguNUIGQZJzdJGQrimFiE3RkEKcGyFo8QSJozpRiR9Aeipi0FkWhY7SSKm101pLOCwWR6KuOBzpuc6EUYcjQeyiFGDLjU5sdbaEkr5Uo0q2CQrSN4EuadzJ0xThmnkVHtnK8MxVgXu2CrwYkraxVxFbZAV/QtgHKiMxWx8ZBXSYp3PAVRixL4SnaiOzwADp+fpIZQ8Tjrv6KcGXofODEolp56cACAxVQcwdDZomZHKi3JAb7Y7cGHfkxXogL84LObTMWC+kx3ojNc4HkdHW0tc5ThFUI5wgwlgErFiWxVtCC1Y1C57W0fyZISherFkSWuzd4sWa+OybasAYN4A9p4TQDB1ekAGSM/XgEqDECiVWXyXE0MG0HELk6CGFIEFRajDwloVzsBJV0PpgBCHUDcJJnGVxO1oNsVRGJv6GOeJ9LRDLM8rHBBHeJgjxNEGwhwkCaDfdTXDd1Rg+HobwuyWBX5Qe3MJVYR+qCGs2MEvuEaLum/GzBddXE9EHuCwJM+Zno6ArsIlQRkSGBK68jIBshkY2HSWEzy0VSAhhFa4AhyglaZILgORMHYaTFqz85fnnZWEdoIBYhpJQIp6/I76zD1JkxZKDw3V5RCWoQybS0xBRnkaIoKMhbnoIdtFDoIs+/Gm+TvzHHHTh5WgALwd96enjaggvd1343NSGu786nINUYeOvBMtABVgEykt3b2PWfxOaMbc+CadXn9hruBGvAb8cbYTl0tEsPQREqHHipRKRzDvxlj7mKuLp6B1x43TWm2FjLJYuqm/qz7BjKCUw4RP43W3mhPktPhdvJ7mLBHLolIn00IewcHc9hLpSTicdBDjr4iYhbjgSwk4bnna6cLfVgZuNFtysteFKc7MhiK02vJx04eZ4DR7uGrh+g8+81eF5k+UxSAte/prwDdFCUJIWggt0cbtYB3EMm9BYOuLLsBNKEMKeBcQ1Rll62wIkNO4adxT2EYaoeO9rxMsI4KgkIOJSNOEeehVmDG3zUHnoecjC8YYiZIIcmDT2GvC3uwY/W96cjTq8rNThYakOFwt1OJkz0c14Wmjw8zU4mqrDwUQNdsKMVWBvrAZbCVUxUpGedsKMGXp87sg/GxCmjdv5uggtJ0ChDqIZFjZ+zJvQ8/95chBVkDBu0QRJ1UI8v3dibzBmqJoz38wJY0iVPUKoGL8PZ7m1pPJmDGNz/h1GvBCRKzKB9tfgb6tOCBohrlurwctSDW7mqnAxV5OakxlPQrnQMSdTNTgIAIkyHOmwE8EcCWUvYXMyUSGoqvRnBxP+vq0GgtP1EFHFRC/TRWSuDjzCrkrDwp7OCwihhi2BPAQIIYLY6CQMpfM3jsw1FhEDhqg9Q1f0jZsMI2PuJhYRrKAxSmwLVzmmXIWMn702fG01cd1GA97WGvCw0oCblSZvXwN2ZhqwNeVJE+cPn4XZGKvDRqJGU4U1T2sjNVgZqdNUpWZN8/TTQUSlBGHV+ggu0UJgugYcopUIoQSnxPP/uLGLYwlnVfPkcCpKqU2AIiQsIGYRzA+acej52mt6Qw5R/F5UMH2Gmngzf97T+PfQZG57GuOWhzGrlASB7kbwczXCTRcj+DgxqZ2M4Ck1CTwdjeDhaAh3mpu9IVztDOFiwx5gowdnaz04WevTDOBkpQtHKx14sihEFpgjutYIoRW6CCzkZWVyrBBjzx1lKYhQwy5WgCjCO0qFPUYVRuK/CiJY+QhhwrIuCTlfdQ28ryAoRg3mN+SlLyNERbQWr1yprF2cEv4fAN0MAbo+WIEAAAAASUVORK5CYII=");
            
        Emotes.display.sort();
    };

    Emotes.interpolate = function (src, msg, vars, checkEnabled, rateLimit) {
        var i;
        for (i in vars) {
            msg = msg.replace(new RegExp(Utils.escapeRegex(i), "gi"), vars[i]);
        }

        if (rateLimit !== false) {
            rateLimit = Emotes.ratelimit;
        }

        if ((!checkEnabled) || (checkEnabled && Emotes.enabledFor(src))) {
            msg = Emotes.format(msg, rateLimit, src);
        }

        return msg;
    };

    Emotes.always = false;
    Emotes.emoji = emojis;
}());

module.reload = function () {
    Emotes.load();
    return true;
};
