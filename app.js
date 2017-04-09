var restify = require('restify');
var builder = require('botbuilder');
var cognitiveservices = require('botbuilder-cognitiveservices');

var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', 
    server.name, 
    server.url);
});

var connector = new builder.ChatConnector({
    appID: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD });

var bot = new builder.UniversalBot(connector);
server.post('/api/messages', connector.listen());

var intents = new builder.IntentDialog();
bot.dialog('/beginning', intents);

var recognizer = new cognitiveservices.QnAMakerRecognizer({
    knowledgeBaseId: '58b93fa3-7fa6-4f67-81a1-fb306cec2a65',
    subscriptionKey: 'a03ceb44853b463cbb0b62e9e1770806'
});

var basicQnAMakerDialog = new cognitiveservices.QnAMakerDialog({
    recognizers: [recognizer],
    defaultMessage: "Sorry I can't answer that, try asking a different question!",
    qnaThreshold: 0.3
});

intents.onDefault([
    function (session, args, next) {
        if(!session.userData.name) {
            session.beginDialog('/profile');
        } else {
            next();
        }
    },
    function (session, results) {
        session.send('Hello %s!', session.userData.name);
    }
]);

bot.dialog('/', [
    function (session) {
        if (!session.userData.name) {
            session.beginDialog('/profile');
        } else {
            next();
        }
    },
    function (session, results) {
        session.send('Hello %s!', session.userData.name);
        if (!session.userData.age) {
            session.beginDialog('/age');
        } else {
            next();
        }
    },
    function (session, results) {
        session.send('%s years, got it', session.userData.age);
        if(!session.userData.sex) {
            session.beginDialog('/sex');
        } else {
            next();
        }
    },
    function (session, results) {
        session.send('Ok, %s', session.userData.sex);
        if (!session.userData.weight) {
            session.beginDialog('/weight');
        } else {
            next();
        }
    },
    function (session, results) {
        session.send('%s lbs', session.userData.weight);
        if (!session.userData.timeframe) {
            session.beginDialog('/timeframe');
        } else {
            next();
        }
    },
    function(session, results) {
        session.send('%s hours, got it', session.userData.timeframe);
        session.send('Cool, help me learn about how much you plan on drinking!');
        if (!session.userData.beer) {
            session.beginDialog('/beer');
        }
        else {
            next();
        }
    },
    function(session, results) {
        if (!session.userData.wine) {
            session.beginDialog('/wine');
        }
        else {
            next();
        }
    },
    function(session, results) {
        if (!session.userData.shots) {
            session.beginDialog('/shots');
        }
        else {
            next();
        }
    },
    function(session, results) {
  
        if (!session.userData.calculate) {
            var newweight = session.userData.weight*(453.592);
            var r = 0;
            if (session.userData.sex == 'female') {
                r = 0.55;
            }
            else {
                r = 0.68;
            }
            var alcohol = ((session.userData.beer)+(session.userData.wine)+(session.userData.shots))*14.0;
            var time = session.userData.timeframe;
            session.userData.calculate = ((alcohol/(newweight*r))*100)-(0.015*time);
            session.beginDialog('/calculate');

        } else {
            next();
        }
    },
    function(session, results) {
        if(!session.userData.bac) {
            session.send("People drink to feel the euphoric effects of alcohol. However there is a point "
                + "after which the more you drink, the worse you will feel. You may experience depression "
                + "along with physical uneasiness. For this reason, social drinkers tend to maintain a BAC between 0.02% - 0.06%.");
            
            session.beginDialog('/sugDrinks');
        } else {
            next();
        }
    },
    
    /*function(session,results) {
        session.send("Your blood alcohol content would be %s percent", session.userData.calculate);
        if (!session.userData.calculate) {
            session.beginDialog('/calculate');
        }
        else {
            next();
        }
    }*/
]);

// Q & A
/*
intents.matches(/^bac/i, [
    function (session) {
        builder.Prompts.text(session,'Do you have any questions?');
    },
    function (session) {
        session.beginDialog('/bacQnA');
    }
]);

bot.dialog('/bacQnA', basicQnAMakerDialog);

*/

//

bot.dialog('/profile', [
    function (session) {
        builder.Prompts.text(session, "Hi, I'm BuzzyBot! What is your name?");
    },
    function (session, results) {
        session.userData.name = results.response;
        session.endDialog();
    }
]);

bot.dialog('/age', [
    function (session) {
        builder.Prompts.number(session, 'How old are you?');
    },
    function (session, results) {
        session.userData.age = results.response;
        session.endDialog();
    }
]);

bot.dialog('/sex', [
    function (session) {
        builder.Prompts.choice(session, 'Is your sex male or female?',["male", "female"]);
    },
    function (session, results) {
        session.userData.sex= results.response.entity;
        session.endDialog();
    }
]);

bot.dialog('/weight', [
    function (session) {
        builder.Prompts.number(session, 'How much do you weigh in pounds?');
    },
    function (session, results) {
        session.userData.weight = results.response;
        session.endDialog();
    }
]);

bot.dialog('/timeframe', [
    function (session) {
        builder.Prompts.number(session, 'Over how many hours will you be drinking?');
    },
    function (session, results) {
        session.userData.timeframe = results.response;
        session.endDialog();
    }
]);

bot.dialog('/beer', [
    function (session) {
        builder.Prompts.number(session, 'How many cans/bottles of beer (12 oz) do you plan on drinking?');
    },
    function (session, results) {
        session.userData.beer = results.response;
        session.send("%s cans/bottles of beer", session.userData.beer);
        session.endDialog();
    }
]);
bot.dialog('/wine', [
    function(session) {
        builder.Prompts.number(session,'How many glasses of wine (5 oz) do you plan on drinking?');
    },
    function(session, results) {
        session.userData.wine= results.response;
        session.send("%s glasses of wine", session.userData.wine);
        session.endDialog();
    }
]);
bot.dialog('/shots', [
    function(session) {
        builder.Prompts.number(session, "How many shots of hard liquor (1.5 oz) do you plan on drinking?");
    },
    function(session,results) {
        session.userData.shots = results.response;
        session.send("%s shots", session.userData.shots);
        session.endDialog();
    }
]);
bot.dialog('/sugDrinks',[
    function(session){
        builder.Prompts.number(session, "With this new information in mind, what is the BAC you'd want to maintain while drinking?");
    },
    function(session, results) {
        session.userData.bac = results.response;
        session.send("Ok, let me calculate the number of drinks for a BAC of %s", session.userData.bac);
        var newweight = session.userData.weight*(453.592);
        if (session.userData.sex == 'female') {
            var r = 0.55;
        }
        else {
            var r = 0.68;
        }
        var time = session.userData.timeframe;
        session.userData.sugDrinks = (((session.userData.bac + (0.015*time))*(newweight*r))/100)/14;
        session.send("The number of suggested drinks over %s hours for a BAC of %s would be %s drink(s)", session.userData.timeframe,
            session.userData.bac, session.userData.sugDrinks);
        session.send("Thanks for using BuzzyBot-- now have fun partying responsibly!")
        session.endDialog();
    }
]);
bot.dialog('/calculate', [
    function(session) {
        session.send("Your blood alcohol content (BAC) would be %s percent", session.userData.calculate);
        session.endDialog();
    }
]);

/*bot.dialog('/calculate', [
    function(session) {
        var newweight = session.userData.weight*(453.592);
        if (session.userData.sex == 'female') {
            var r = 0.55;
        }
        else {
            var r = 0.68;
        }
        var alcohol = ((session.userData.beer)+(session.userData.wine)+(session.userData.shots))*14.0;
        var time = session.userData.timeframe;
        session.userData.calculate = ((alcohol/(newweight*r))*100)-(0.015*time);
    },
    function(session,results) {
        session.userData.calculate = results.response;
        //session.send("Your blood alcohol content would be %s percent", session.userData.calculate);
        session.endDialog();
    }
]);*/
