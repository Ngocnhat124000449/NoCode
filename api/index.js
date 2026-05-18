const handlerModule = require('../apps/hub-api/dist/apps/hub-api/api/index.js');

module.exports = handlerModule.default || handlerModule;
