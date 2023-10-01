const {
  listConfessions,
  createConfession,
} = require("../model/confessions.js");
const { getSession } = require("../model/session.js");
const { Layout } = require("../templates.js");

function get(req, res) {
  /* Currently any user can view any other user's private confessions!
    We need to ensure only the logged in user can see their page. */
  // [1] Get the session ID from the cookie
  const sid = req.signedCookies.sid;
  const session = getSession(sid);
  // [2] Get the session from the DB
  // [3] Get the logged in user's ID from the session
  const current_user = session && session.user_id;
  /*
  This above line extracts the user_id from the session object, if it exists. 
  It uses a JavaScript shorthand called "short-circuit evaluation" (&&) 
  to check if session is not undefined before trying to access its user_id property. 
  If the session object exists and has a user_id, current_user will be set to that value; 
  otherwise, it will be undefined.*/
  // [4] Get the page owner from the URL params
  const page_owner = Number(req.params.user_id);
  // [5] If the logged in user is not the page owner send a 401 response
  if (current_user !== page_owner) {
    return res.status(401).send("<h1>You aren't allowed to see that</h1>");
  }
  const confessions = listConfessions(req.params.user_id);
  const title = "Your secrets";
  const content = /*html*/ `
    <div class="Cover">
      <h1>${title}</h1>
      <form method="POST" class="Stack" style="--gap: 0.5rem">
        <textarea name="content" aria-label="your confession" rows="4" cols="30" style="resize: vertical"></textarea>
        <button class="Button">Confess 🤫</button>
      </form>
      <ul class="Center Stack">
        ${confessions
          .map(
            (entry) => `
            <li>
              <h2>${entry.created_at}</h2>
              <p>${entry.content}</p>
            </li>
            `
          )
          .join("")}
      </ul>
    </div>
  `;
  const body = Layout({ title, content });
  res.send(body);
}

function post(req, res) {
  /* Currently any user can POST to any other user's confessions (this is bad!)
   * We can't rely on the URL params. We can only trust the cookie.*/
  // [1] Get the session ID from the cookie
  const sid = req.signedCookies.sid;
  // [2] Get the session from the DB
  const session = getSession(sid);
  // [3] Get the logged in user's ID from the session
  const current_user = session && session.user_id;
  // [4] Use the user ID to create the confession in the DB
  if (!req.body.content || !current_user) {
    return res.status(401).send("<h1>Confession failed</h1>");
  }
  createConfession(req.body.content, current_user);

  // [5] Redirect back to the logged in user's confession page
  res.redirect(`/confessions/${current_user}`);
}

module.exports = { get, post };
