import { select } from '../settings.js';

class BaseWidget {
  constructor(wrapperElement, initialValue) {
    const thisWidget = this;

    thisWidget.dom = {};
    thisWidget.dom.wrapper = wrapperElement;
    thisWidget.dom.amountDecrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.dom.amountIncrease = thisWidget.dom.wrapper.querySelector(select.widgets.amount.linkIncrease);

    thisWidget.correctValue = initialValue;
  }

  get value() {
    const thisWidget = this;

    return thisWidget.correctValue;
  }

  set value(value) {
    const thisWidget = this;
    const newValue = thisWidget.parseValue(value);

    if (thisWidget.correctValue !== newValue && this.isValid(newValue)) {
      thisWidget.correctValue = newValue;
      thisWidget.announce();
    }
    thisWidget.renderValue();
  }

  setValue(value) {
    const thisWidget = this;

    thisWidget.value = value;
  }

  isValid(value) {
    return  !isNaN(value);
  }

  parseValue(value) {
    return parseInt(value);
  }

  renderValue() {
    const thisWidget = this;

    thisWidget.dom.wrapper.innerHTML = thisWidget.correctValue;
  }

  announce() {
    const thisWidget = this;

    const event = new CustomEvent('updated', {
      bubbles: true,
    });
    thisWidget.dom.wrapper.dispatchEvent(event);
  }
}

export default BaseWidget;