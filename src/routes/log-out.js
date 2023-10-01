const { removeSession } = require("../model/session");

function post(req, res) {
  // [1] Get the session ID from the cookie
  const sid = req.signedCookies.sid;
  // [2] Remove that session from the DB
  removeSession(sid);
  // [3] Remove the session cookie
  res.clearCookie("sid");
  // [4] Redirect back home
  res.redirect("/");
}

module.exports = { post };
