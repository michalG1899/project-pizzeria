import { select, templates } from '../settings.js';
import AmountWidget from './AmountWidget.js';


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
  }

  initWidgets() {
    const thisBooking = this;

    thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);

    thisBooking.dom.peopleAmount.addEventListener('updated', function () {
      console.log('test peopleAmount');
    });

    thisBooking.dom.hoursAmount.addEventListener('updated', function () {
      console.log('test hoursAmount');
    });

  }
}
export default Booking;