import { select, templates, settings, classNames } from '../settings.js';
import { utils } from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element) {
    const thisBooking = this;
    console.log('Booking: ', element, '. ', thisBooking);

    thisBooking.render(element);
    thisBooking.initWidgets();
    thisBooking.getData();

    thisBooking.selectedTable = 0;

  }

  render(element) {
    const thisBooking = this;
    // generate HTML from template
    const generatedHTML = templates.bookingWidget();

    //create DOM
    thisBooking.dom = {};
    //add new wrapper property and assign element from method arguments
    thisBooking.dom.wrapper = element;
    //change innerHTML to generatedHTML
    thisBooking.dom.wrapper.innerHTML = generatedHTML;

    thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
    thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);

    thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
    thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);

    thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
    thisBooking.dom.floorPlan = thisBooking.dom.wrapper.querySelector(select.booking.floorPlan);

    thisBooking.dom.starters = thisBooking.dom.wrapper.querySelectorAll(select.booking.starters);
    thisBooking.dom.orderConfirmation = thisBooking.dom.wrapper.querySelector(select.booking.orderConfirmation);
    thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);
    thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address);
    thisBooking.dom.bookingButton = thisBooking.dom.orderConfirmation.querySelector(select.booking.bookingButton);
  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.wrapper.addEventListener('updated', function () {
      thisBooking.updateDOM();
    });

    thisBooking.dom.floorPlan.addEventListener('click', function (event) {
      thisBooking.initTables(event.target);
    });

    thisBooking.dom.bookingButton.addEventListener('click', function (event) {
      event.preventDefault();
      thisBooking.sendBooking();
    });
  }

  initTables(table) {
    const thisBooking = this;

    if (table.classList.contains('table')) {
      const tableNumber = parseInt(table.getAttribute(settings.booking.tableIdAttribute));
      table.classList.toggle(classNames.booking.selected);


      for (let singleTable of thisBooking.dom.tables) {
        const tableId = parseInt(singleTable.getAttribute(settings.booking.tableIdAttribute));

        if (tableId != tableNumber) {
          singleTable.classList.remove(classNames.booking.selected);
        }

        if (tableNumber == tableId && singleTable.classList.contains(classNames.booking.selected) && !(singleTable.classList.contains(classNames.booking.booked))) { 
          thisBooking.selectedTable = tableId; 
        }
        else if (tableNumber == tableId && !(singleTable.classList.contains(classNames.booking.selected))) {
          thisBooking.selectedTable = 0; 
        }
      }
    }
  }

  getData() {
    const thisBooking = this;

    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePicker.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePicker.maxDate);

    const params = {
      booking: [
        startDateParam,
        endDateParam,
      ],
      eventsCurrent: [
        settings.db.notRepeatParam,
        startDateParam,
        endDateParam,
      ],
      eventsRepeat: [
        settings.db.repeatParam,
        startDateParam,
      ],
    };

    const urls = {
      bookings: settings.db.url + '/' + settings.db.booking
        + '?' + params.booking.join('&'),
      eventsCurrent: settings.db.url + '/' + settings.db.event
        + '?' + params.eventsCurrent.join('&'),
      eventsRepeat: settings.db.url + '/' + settings.db.event
        + '?' + params.eventsRepeat.join('&'),
    };

    Promise.all([
      fetch(urls.bookings),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function (allResponses) {
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })
      .then(function ([bookings, eventsCurrent, eventsRepeat]) {
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    const thisBooking = this;

    thisBooking.booked = {};

    for (let item of bookings) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    for (let item of eventsCurrent) {
      thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = thisBooking.datePicker.minDate;
    const maxDate = thisBooking.datePicker.maxDate;

    for (let item of eventsRepeat) {
      if (item.repeat == 'daily') {
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate,1)) {
          thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }
    thisBooking.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    const thisBooking = this;

    if (typeof thisBooking.booked[date] == 'undefined') {
      thisBooking.booked[date] = {};
    }

    const startHour = utils.hourToNumber(hour);

    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock+= 0.5){
      if (typeof thisBooking.booked[date][hourBlock] == 'undefined') {
        thisBooking.booked[date][hourBlock] = [];
      }
      thisBooking.booked[date][hourBlock].push(table);
    }
  }

  updateDOM() {
    const thisBooking = this;

    thisBooking.date = thisBooking.datePicker.value;
    thisBooking.hour = utils.hourToNumber(thisBooking.hourPicker.value);

    let allAvailable = false;

    if (typeof thisBooking.booked[thisBooking.date] == 'undefined' || typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined') {
      allAvailable = true;
    }

    for (let table of thisBooking.dom.tables) {

      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }

      if (!allAvailable &&
        thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)) { 
        table.classList.add(classNames.booking.tableBooked);
        table.classList.remove(classNames.booking.selected);
        table.removeEventListener('click', function () {
        });
      }
      else { 
        table.classList.remove(classNames.booking.tableBooked); 
        table.classList.remove(classNames.booking.selected);
        thisBooking.selectedTable = 0;
      }
    }
  }

  sendBooking() {
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.booking;
    thisBooking.payloadDate = thisBooking.datePicker.value;
    thisBooking.payloadHour = thisBooking.hourPicker.value;

    if (thisBooking.selectedTable == 0) {
      alert('Please choose a table!');
    } else {
      const bookingPayload = {
        date: thisBooking.payloadDate,
        hour: thisBooking.payloadHour,
        table: thisBooking.selectedTable,
        duration: thisBooking.hoursAmountWidget.value,
        ppl: thisBooking.peopleAmountWidget.value,
        starters: [],
        phone: thisBooking.dom.phone.value,
        address: thisBooking.dom.address.value
      };

      for(let starter of thisBooking.dom.starters){
        if(starter.checked == true){
          bookingPayload.starters.push(starter.value);
        }
        else if (starter.checked == false) {
          const index = bookingPayload.starters.indexOf(starter.value);
          if (index >= 0) {
            bookingPayload.starters.splice(index, 1);
          }
        }
      }
      const options = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', },
        body: JSON.stringify(bookingPayload)
      };

      fetch(url, options).then(response => response.json())
        .then(bookingResponse => {
          console.log('bookingResponse: ', bookingResponse);
          thisBooking.makeBooked(bookingPayload.date, bookingPayload.hour, bookingPayload.duration, bookingPayload.table);
        });

    }
  }

}
export default Booking;