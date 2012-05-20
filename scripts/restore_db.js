var userData = ["Mike", "Prashant", "Gokul", "Nate", "Felix", "Neil", "Tim", "Mark", "Ben", "Justin"];
var gameData = [
    { winner: 0, loser: 1, losingGoals: 7, goalIds: [] },
    { winner: 2, loser: 3, losingGoals: 8, goalIds: [] },
    { winner: 3, loser: 1, losingGoals: 3, goalIds: [] }
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

print("*** Restoring Teams ***")
var teamCount = db.teams.count();
print(" - removing " + teamCount + " teams");
db.teams.remove();
var uniqueUserIndexes = [];
gameData.forEach(function(game) {
    if (uniqueUserIndexes.indexOf(game.winner) === -1) {
        uniqueUserIndexes.push(game.winner);
    }
    if (uniqueUserIndexes.indexOf(game.loser) === -1) {
        uniqueUserIndexes.push(game.loser);
    }
});
var numberOfTeams = uniqueUserIndexes.length;
print(" - adding " + numberOfTeams + " teams");
uniqueUserIndexes.forEach(function(userIndex) {
    db.teams.insert({
        type:"singles",
        members:[users[userIndex]._id]
    });
});
var teams = db.teams.find().toArray();
printjson(teams);

var teamForUserIndex = {};
for (var i=0; i<numberOfTeams; i++) {
    teamForUserIndex[uniqueUserIndexes[i]] = teams[i];
}

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
        winningTeam  = teamForUserIndex[gameData[i].winner],
        losingTeam  = teamForUserIndex[gameData[i].loser],
        losingGoals = gameData[i].losingGoals;
    print("   - adding 10 goals for " + users[gameData[i].winner].name);
    for (var j=0; j<10; j++) {
        goalId = new ObjectId();
        goalIds.push(goalId);
        db.goals.insert({ _id: goalId, team: winningTeam._id });
    }
    print("   - adding " + losingGoals + " goals for " + users[gameData[i].loser].name);
    for (var j=0; j<losingGoals; j++) {
        goalId = new ObjectId();
        goalIds.push(goalId);
        db.goals.insert({ _id: goalId, team: losingTeam._id });
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
        winningTeam  = teamForUserIndex[gameData[i].winner],
        losingTeam  = teamForUserIndex[gameData[i].loser],
        losingGoals = gameData[i].losingGoals;
    print("   - adding " + users[gameData[i].winner].name + " (10) vs " + users[gameData[i].loser].name + " (" + losingGoals + ")");
    db.games.insert({
        gameType: "singles",
        teams: [ winningTeam._id, losingTeam._id ],
        goals: goalIds,
        state: "complete",
        startDate: new Date("May 18, 2012 12:05:00"),
        completeDate: new Date("May 18, 2012 12:20:00"),
        winner: winningTeam._id,
        loser: losingTeam._id
    });
}
printjson(db.games.find().toArray());

