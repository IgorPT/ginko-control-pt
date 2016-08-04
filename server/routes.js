// Load modules

var Users           = require('./controllers/users'),
    CTypes          = require('./controllers/content_types'),
    Groups          = require('./controllers/groups'),
    Getters         = require('./controllers/getters'),
    Categories      = require('./controllers/categories'),
    Media           = require('./controllers/media'),
  	Home            = require('./home'),
  	Admin           = require('./admin');

// API Server Endpoints
exports.endpoints = [
  { method: ['GET','POST'], path: '/{params*}',                         config: Home.get },

  { method: 'GET',          path: '/uploads/{path*}',                   config: Home.uploadsFolder },
  { method: 'GET',          path: '/assets/{param*}',                   config: Home.assets },
  { method: 'GET',          path: '/serveAdmin',                        config: Home.serveAmin },


  { method: 'GET',          path: '/admin/{param*}',                    config: Admin.get },
  { method: 'GET',          path: '/admin/blocks/{params*}',            config: Admin.getBlocks },
  { method: 'GET',          path: '/admin/template/{params*}',          config: Admin.getServerTemplates },


  /* TEMP */
  { method: 'POST',         path: '/install',                           config: CTypes.install },
  /* TEMP */

  { method: 'POST',         path: '/authcheck',                         config: Users.authcheck },

  { method: 'POST',         path: '/user/auth',                         config: Users.auth },
  { method: 'POST',         path: '/user/logout',                       config: Users.logout },
  { method: 'PUT',          path: '/api/users/{userId?}',               config: Users.set },

  { method: 'PUT',          path: '/api/ctype/{params*}',               config: CTypes.set },
  { method: 'PUT',          path: '/api/settings',                      config: CTypes.setSettings },
  { method: 'PUT',          path: '/api/ctype/edit',                    config: CTypes.setChild },
  { method: 'POST',         path: '/api/ctype/{type}/{id?}',            config: CTypes.get },
  { method: 'POST',         path: '/api/ctype/edit/{id?}',              config: CTypes.edit },
  { method: 'DELETE',       path: '/api/ctype/{type}/{id}',             config: CTypes.delete },
  { method: 'POST',         path: '/api/{params*}',                     config: CTypes.view },

  { method: 'POST',         path: '/api/menus/edit',                    config: CTypes.editMenu },

  { method: 'PUT',          path: '/api/ctype/category/{type}',         config: Categories.setCategory },
  { method: 'DELETE',       path: '/api/ctype/category/{type}',         config: Categories.deleteCategory },

  { method: 'POST',         path: '/api/infoupdate',                    config: Getters.infoupdate },
  { method: 'POST',         path: '/api/blocks',                        config: Getters.blocks },
  { method: 'POST',         path: '/api/admin/{type}',                  config: Getters.general },

  { method: 'POST',         path: '/api/media/del',                     config: Media.del },
  { method: 'POST',         path: '/api/media',                         config: Media.upload },

  { method: 'PUT',          path: '/api/groups',                        config: Groups.set },
  { method: 'DELETE',       path: '/api/groups/{id}',                   config: Groups.delete },
  { method: 'GET',          path: '/getTemplate/{params*}',             config: CTypes.getTemplate },
  { method: 'GET',          path: '/getBackTemplate/{params*}',         config: CTypes.getBackTemplate },

];
