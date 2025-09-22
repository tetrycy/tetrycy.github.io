// W teams.js:
role: "nowa_rola"

// W player.js dodaj case:
case "nowa_rola":
    return createNowaRolaBehavior(bot, ballNearby);

// I napisz funkcję:
function createNowaRolaBehavior(bot, ballNearby) {
    return {
        getTarget: function() {
            return { x: ball.x, y: ball.y };
        },
        getSpeed: function() {
            return bot.maxSpeed;
        }
    };
}
