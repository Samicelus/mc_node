const crypto = require('crypto');

var authme = {};

authme.computeHash = function (password, salt, name) {
    return "$SHA$" + salt + "$" + sha256(sha256(password) + salt)
};

function sha256(str){
    return  crypto.createHash('sha256') .update(str).digest('hex');
}

authme.comparePassword = function (password, hashedPassword, playerName) {
    let hash = authme.getHash(hashedPassword);
    let salt = authme.getSalt(hashedPassword);
    return hash == authme.getHash(authme.computeHash(password, salt, ""));
};

authme.getHash = function (hashedPassword){
    return hashedPassword.split("$")[3];
};

authme.getSalt = function (hashedPassword){
    return hashedPassword.split("$")[2];
};

module.exports = authme;