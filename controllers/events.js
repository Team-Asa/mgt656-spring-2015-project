'use strict';

var events = require('../models/events');
var validator = require('validator');

// Date data that would be useful to you
// completing the project These data are not
// used a first.
//
var allowedDateInfo = {
  months: {
    0: 'January',
    1: 'February',
    2: 'March',
    3: 'April',
    4: 'May',
    5: 'June',
    6: 'July',
    7: 'August',
    8: 'September',
    9: 'October',
    10: 'November',
    11: 'December'
  },
  minutes: [0, 30],
  hours: [
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
    12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23
  ]
};

/**
 * Controller that renders a list of events in HTML.
 */
function listEvents(request, response) {
  var currentTime = new Date();
  var contextData = {
    'events': events.all,
    'time': currentTime
  };
  response.render('event.html', contextData);
}

/**
 * Controller that renders a page for creating new events.
 */
function newEvent(request, response){
  var contextData = {};
  response.render('create-event.html', contextData);
}

/**
 * Controller to which new events are submitted.
 * Validates the form and adds the new event to
 * our global list of events.
 */
function saveEvent(request, response){
  var contextData = {errors: []};

  if (validator.isLength(request.body.title, 5, 50) === false) {
    contextData.errors.push('Your title should be between 5 and 50 letters.');
  }
  
  if (validator.isLength(request.body.location, 5, 50) === false) {
    contextData.errors.push('Your location should be between 5 and 50 letters.');
  }
  
  if(request.body.image.indexOf('http://') === -1 && request.body.image.indexOf('https://') === -1){
    contextData.errors.push('Image URL must begin with "http://" or "https://"');
  }
  
  if(request.body.image.indexOf('.png') === -1 && request.body.image.indexOf('.gif') === -1){
    contextData.errors.push('Image URL must begin with "http://" or "https://"');
  }
  
  if(request.body.year > 2016 || request.body.year < 2015 || isNaN(request.body.year)){
    contextData.errors.push('The year must be 2015 or 2016');
  }
  if(request.body.month > 11 || request.body.month < 0 || isNaN(request.body.month)){
    contextData.errors.push('Must select a month');
  }
  if(request.body.day > 31 || request.body.day < 1 || isNaN(request.body.day)){
    contextData.errors.push('Must select a day');
  }
  if(request.body.hour > 23 || request.body.hour < 0 || isNaN(request.body.hour)){
    contextData.errors.push('Must select an hour');
  }
  /*
  if((request.body.minute !== 30) && (request.body.minute !== 0) || isNaN(request.body.minute)){
    contextData.errors.push('Must select a minute');
  }*/
  
  var eventyear   = request.body.year;
  var eventmonth  = request.body.month;
  var eventday    = request.body.day;
  var eventhour   = request.body.hour;
  var eventminute = request.body.minute;
   /*
  contextData.errors.push(eventyear);
  contextData.errors.push(eventmonth);
  contextData.errors.push(eventday);
  contextData.errors.push(eventhour);
  contextData.errors.push(eventminute);
  */
  
  var newid = events.all.length + 1;

  if (contextData.errors.length === 0) {
    var newEvent = {
      id: newid,
      title: request.body.title,
      location: request.body.location,
      image: request.body.image,
      date: new Date(eventyear, eventmonth, eventday, eventhour, eventminute, 0, 0),
      attending: []
    };
    events.all.push(newEvent);
    //response.redirect('/events');
    response.redirect('/events/' +newid);
  }else{
    response.render('create-event.html', contextData);
  }
}

function eventDetail (request, response) {
  var ev = events.getById(parseInt(request.params.id));
  if (ev === null) {
    response.status(404).send('No such event');
  }
  response.render('event-detail.html', {event: ev});
}

function rsvp (request, response){
  var ev = events.getById(parseInt(request.params.id));
  if (ev === null) {
    response.status(404).send('No such event');
  }

  if(validator.isEmail(request.body.email)){
    ev.attending.push(request.body.email);
    response.redirect('/events/' + ev.id);
  }else{
    var contextData = {errors: [], event: ev};
    contextData.errors.push('Invalid email');
    response.render('event-detail.html', contextData);    
  }

}

function api (request, response){
  var output = {events: events.all};
  response.send(output);
}

/**
 * Export all our functions (controllers in this case, because they
 * handles requests and render responses).
 */
module.exports = {
  'listEvents': listEvents,
  'eventDetail': eventDetail,
  'newEvent': newEvent,
  'saveEvent': saveEvent,
  'rsvp': rsvp,
  'api': api
};