var userData = ["Mike", "Prashant", "Gokul", "Nate", "Felix", "Neil", "Tim", "Mark", "Ben", "Justin"];
var gameData = [
    { winner: 0, loser: 1, losingGoals: 7, goalIds: [] },
    { winner: 2, loser: 3, losingGoals: 8, goalIds: [] }
]

print("*** Restoring Users ***")
var userCount = db.users.count();
print(" - removing " + userCount + " users");
db.users.remove();
print(" - adding " + userData.length + " users");
userData.forEach(function(userName) {
    db.users.insert({name:userName,email:"blackhole@blah.com",password:"password"});
});
var users = db.users.find().toArray();
printjson(users);

print("*** Restoring Goals ***")
var goalCount = db.goals.count();
print(" - removing " + goalCount + " goals");
db.goals.remove();

var numberOfGoals = 0;
gameData.forEach(function(game) { numberOfGoals += (10 + game.losingGoals) });
var numberOfGames = gameData.length;
print(" - adding " + numberOfGoals + " goals");
for (var i=0; i<numberOfGames; i++) {
    var goalId,
        goalIds = gameData[i].goalIds,
        winningUser  = users[gameData[i].winner],
        losingUser  = users[gameData[i].loser],
        losingGoals = gameData[i].losingGoals;
    print("   - adding 10 goals for " + winningUser.name);
    for (var j=0; j<10; j++) {
        goalId = new ObjectId();
        goalIds.push(goalId);
        db.goals.insert({ _id: goalId, user: winningUser._id });
    }
    print("   - adding " + losingGoals + " goals for " + losingUser.name);
    for (var j=0; j<losingGoals; j++) {
        goalId = new ObjectId();
        goalIds.push(goalId);
        db.goals.insert({ _id: goalId, user: losingUser._id });
    }
}
var goals = db.goals.find().toArray();
printjson(goals);

print("*** Restoring Games ***")
var gameCount = db.games.count();
print(" - removing " + gameCount + " games");
db.games.remove();

print(" - adding " + numberOfGames + " game");
for (var i=0; i<numberOfGames; i++) {
    var goalIds = gameData[i].goalIds,
        winningUser  = users[gameData[i].winner],
        losingUser  = users[gameData[i].loser],
        losingGoals = gameData[i].losingGoals;
    print("   - adding " + winningUser.name + " (10) vs " + losingUser.name + " (" + losingGoals + ")");
    db.games.insert({
        gameType: "singles",
        players: [ winningUser._id, losingUser._id ],
            goals: goalIds,
            state: "complete",
        startDate: new Date("May 18, 2012 12:05:00"),
        completeDate: new Date("May 18, 2012 12:20:00"),
        winner: winningUser._id,
        loser: losingUser._id
    });
}
printjson(db.games.find().toArray());

