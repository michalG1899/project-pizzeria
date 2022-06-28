import { select, templates } from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';

class Booking {
  constructor(element) {
    const thisBooking = this;
    console.log('Booking: ', element, '. ', thisBooking);

    thisBooking.render(element);
    thisBooking.initWidgets();
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
  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.datePicker = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPicker = new HourPicker(thisBooking.dom.hourPicker);

    thisBooking.dom.peopleAmount.addEventListener('updated', function () {
      console.log('test peopleAmount');
    });

    thisBooking.dom.hoursAmount.addEventListener('updated', function () {
      console.log('test hoursAmount');
    });

    thisBooking.dom.datePicker.addEventListener('updated', function () {
      console.log('test datePicker');
    });
    thisBooking.dom.hourPicker.addEventListener('updated', function () {
      console.log('test on hourPicker');
    });
  }
}
export default Booking;