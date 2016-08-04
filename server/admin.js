'use strict';

/** load client folder*/

exports.get = {
  handler: {
    directory: {
      path: 'admin/src',
      listing: false
    }
  }
}
exports.getServerTemplates = {
  handler: {
    directory: {
      path: 'server/views/admin',
      listing: false
    }
  }

};
exports.getBlocks = {
    handler: {
      directory: {
        path: 'template/src/blocks',
        listing: false
      }
    }

};
