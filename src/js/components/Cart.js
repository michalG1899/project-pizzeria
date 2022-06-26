import CartProduct from './CartProduct.js';
import {select, settings, classNames, templates} from '../settings.js';
import {utils} from '../utils.js';

// Cart
class Cart {
  constructor(element) {
    const thisCart = this;

    thisCart.products = [];
    thisCart.getElements(element);
    thisCart.initActions();
  }

  getElements(element) {
    const thisCart = this;

    thisCart.dom = {};
    thisCart.dom.wrapper = element;

    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);

    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelectorAll(select.cart.totalPrice);
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);

    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
  }

  initActions() {
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function () {
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });

    thisCart.dom.productList.addEventListener('updated', function() {
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', function() {
      thisCart.remove(event.detail.cartProduct);
    });

    thisCart.dom.form.addEventListener('submit', function (event) {
      event.preventDefault();
      thisCart.sendOrder();
    });

  }

  sendOrder() {
    const thisCart = this;
  
    const url = settings.db.url + '/' + settings.db.orders;
    
    const payload = {
      address: thisCart.dom.form.address.value,
      phone: thisCart.dom.form.phone.value,
      totalPrice: thisCart.totalPrice,
      subTotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: thisCart.deliveryFee,
      products: [],
    };
  
    for (let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }
    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', },
      body: JSON.stringify(payload)
    };
  
    fetch(url, options)
      .then(response => response.json())
      .then(parsedResponse => console.log('parsedResponse: ', parsedResponse));
  
  }


  add(menuProduct) {
    const thisCart = this;

    const generatedHTML = templates.cartProduct(menuProduct); 
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);

    thisCart.dom.productList.appendChild(generatedDOM);

    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    thisCart.update();
  }

  remove(cartProduct) {
    const thisCart = this;

    cartProduct.dom.wrapper.remove();

    const productIndex = thisCart.products.indexOf(cartProduct);
    if (productIndex !== -1) {
      thisCart.products.splice(productIndex, 1);
      thisCart.update();
    }
  }

  update() {
    const thisCart = this;

    let deliveryFee = parseInt(settings.cart.defaultDeliveryFee);
    let totalNumber = 0;
    let subtotalPrice = 0;

    for (let cartProduct of thisCart.products) {
      totalNumber += cartProduct.amount;
      subtotalPrice += cartProduct.price;
    }
    thisCart.totalPrice = subtotalPrice + deliveryFee;

    thisCart.dom.totalNumber.innerHTML = totalNumber;

    if(totalNumber === 0) {
      deliveryFee = 0;
    }
    thisCart.dom.deliveryFee.innerHTML = deliveryFee;
    thisCart.dom.subtotalPrice.innerHTML = subtotalPrice;
      
    for (let price of thisCart.dom.totalPrice) {
      price.innerHTML = thisCart.totalPrice;
    }
  }
}

export default Cart;