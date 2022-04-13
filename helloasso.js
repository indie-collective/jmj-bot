const EventEmitter = require('events');

class HelloAssoEvents extends EventEmitter {}

module.exports = new HelloAssoEvents();
