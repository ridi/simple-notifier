/**
 * Service authenticator
 *
 * @since 1.0.0
 */

const URL = require('url');

const User = require('./../repository/User');
const Status = require('./../repository/Status');
const StatusType = require('../repository/StatusType');

const util = require('./../util');

const config = require('../config/server.config');

function view(request, reply, childViewName, context) {
  const ctx = context || {};
  ctx.childComponentName = childViewName;
  if (request.auth) {
    ctx.auth = {
      isAuthenticated: request.auth.isAuthenticated,
      username: request.auth.credentials ? request.auth.credentials.username : undefined,
    };
  }
  ctx.state = `window.state = ${JSON.stringify(ctx)}`;
  return reply.view('Layout', ctx);
}

module.exports = [
  {
    method: 'GET',
    path: '/',
    handler: (request, reply) => Promise.all([
      Status.findAll({ endTime: -1, startTime: -1, isActivated: -1 }),
      StatusType.find(),
    ]).then(([items, statusTypes]) => view(request, reply, 'StatusList', { items, statusTypes })
    ).catch(error => view(request, reply, 'Error', { error })),
  },
  {
    method: 'GET',
    path: '/login',
    handler: (request, reply) => {
      if (request.auth.isAuthenticated) {
        return reply.redirect('/');
      }
      return view(request, reply, 'Login');
    },
    config: {
      auth: false,
    },
  },
  {
    method: 'GET',
    path: '/logout',
    handler: (request, reply) => reply.redirect('/login').unstate('token'),
  },
];

