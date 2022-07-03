import { templates, classNames, select } from '../settings.js';

class Home {
  constructor(wrapper) {
    const thisHome = this;
    thisHome.render(wrapper);
    thisHome.initListeners();
    thisHome.initCarousel();
  }

  render(wrapper) {
    const thisHome = this;
    const generatedHTML = templates.home();

    thisHome.dom = {};
    thisHome.dom.wrapper = wrapper;
    thisHome.dom.wrapper.innerHTML = generatedHTML;
    thisHome.dom.homeLinks = thisHome.dom.wrapper.querySelector(select.home.links).children;
    thisHome.dom.pages = document.querySelector(select.containerOf.pages).children;
    thisHome.dom.navLinks = document.querySelectorAll(select.nav.links);
    thisHome.dom.carousel = thisHome.dom.wrapper.querySelector('.carousel');
  }

  initListeners() {
    const thisHome = this;

    for (let link of thisHome.dom.homeLinks) {
      link.addEventListener('click',function(event){
        const clickedElement = this;
        event.preventDefault();
        const id = clickedElement.getAttribute('href').replace('#','');
        thisHome.activatePage(id);
        window.location.hash = '#/' + id;
      });
    }

  }

  activatePage(pageID) {
    const thisHome = this;

    for (let page of thisHome.dom.pages) {
      page.classList.toggle(classNames.pages.active, page.id === pageID);
    }
    for (let link of thisHome.dom.navLinks){
      link.classList.toggle( classNames.nav.active, link.getAttribute('href') === '#' + pageID );
    }

  }

  initCarousel() {
    const thisHome = this;

    thisHome.wrapper = document.querySelector(select.widgets.carousel);

    //eslint-disable-next-line no-undef
    thisHome.flickity = new Flickity (thisHome.wrapper, {
      //options
      cellAlign: 'left',
      contain: true,
      autoPlay: true,
      prevNextButtons: false,
      wrapAround: true,
      imagesLoaded: true,
    });

  }

}

export default Home;