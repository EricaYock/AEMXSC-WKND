import {
  loadCSS,
} from './aem.js';

loadCSS(`${window.hlx.codeBasePath}/styles/slider.css`);

// Handling Next / Previous Arrow Image
function arrowIcon(props) {
  const icon = document.createElement('img');
  icon.src = `${window.hlx.codeBasePath}/icons/${props}.svg`;
  icon.alt = `${props}`;
  icon.loading = 'lazy';
  icon.dataset.iconName = `${props}`;
  return icon;
}

// Handling Anchor Tag
function arrow(props) {
  const p = document.createElement('p');
  p.className = 'button-container';
  const anchor = document.createElement('button');
  anchor.className = `button ${props}`;
  anchor.title = `${props}`;
  anchor.type = 'button';
  anchor.append(arrowIcon(props));
  p.append(anchor);
  return p;
}

export default async function createSlider(block) {
  const nextBtn = 'next';
  const prevBtn = 'prev';
  block.append(arrow(`${nextBtn}`));
  block.append(arrow(`${prevBtn}`));

  // Call function after page load
  const moveRightBtns = document.querySelectorAll(`.${nextBtn}`);
  const moveLeftBtns = document.querySelectorAll(`.${prevBtn}`);
  const itemList = [...document.querySelectorAll('.carousel > ul > li')];
  const observerOptions = {
    rootMargin: '0px',
    threshold: 0.25,
  };

  function moveDirection(carousel, itemWidth, option) {
    const carouselItems = carousel.querySelector('ul');
    carouselItems.style.transition = 'all 0.5s ease-in-out';
    if (option === '+') {
      carouselItems.style.transform = `translateX(-${itemWidth}px)`;
      setTimeout(() => {
        carouselItems.style.transition = 'none';
        carouselItems.style.transform = 'translateX(0)';
        carouselItems.scrollLeft += itemWidth;
      }, 500);
    } else {
      carouselItems.style.transform = `translateX(${itemWidth}px)`;
      setTimeout(() => {
        carouselItems.style.transition = 'none';
        carouselItems.style.transform = 'translateX(0)';
        carouselItems.scrollLeft -= itemWidth;
      }, 500);
    }
  }

  // Button Event Handler
  moveLeftBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const carousel = btn.closest('.carousel-container').querySelector('.carousel');
      const carouselItems = carousel.querySelector('ul');
      const totalItems = carouselItems.children.length || 1;
      const itemWidth = parseInt(carouselItems.scrollWidth / totalItems, 10);
      moveDirection(carousel, itemWidth, '-');
    }, true);
  });

  moveRightBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const carousel = btn.closest('.carousel-container').querySelector('.carousel');
      const carouselItems = carousel.querySelector('ul');
      const totalItems = carouselItems.children.length || 1;
      const itemWidth = parseInt(carouselItems.scrollWidth / totalItems, 10);
      moveDirection(carousel, itemWidth, '+');
    }, true);
  });

  // Observer Callback Function
  const callBack = (entries) => {
    const dir = document.documentElement.dir || 'ltr';
    let disableLeftBtn = false;
    let disableRightBtn = false;

    if (dir === 'rtl') {
      document.querySelector('.next').style.right = 'auto';
      document.querySelector('.prev').style.right = 'auto';
      document.querySelector('.next').style.left = '0';
      document.querySelector('.prev').style.left = '0';
    }

    entries.forEach((entry) => {
      const {
        target,
      } = entry;
      if (entry.intersectionRatio >= 0.25) {
        target.classList.remove('opacity');
        target.classList.add('active');
        target.style.transition = 'opacity 0.3s ease-in-out';
      } else {
        target.classList.remove('active');
        target.classList.add('opacity');
        target.style.transition = 'opacity 0.3s ease-in-out';
      }
    });

    try {
      if (entries[0].target.parentElement.children[0].className === 'active') {
        if (dir === 'rtl') {
          disableLeftBtn = false;
          disableRightBtn = true;
        } else {
          disableLeftBtn = true;
          disableRightBtn = false;
        }
      } else if (entries[0].target.parentElement.children[entries[0].target.parentElement.children.length - 1].className === 'active') {
        if (dir === 'rtl') {
          disableLeftBtn = true;
          disableRightBtn = false;
        } else {
          disableLeftBtn = false;
          disableRightBtn = true;
        }
      }
      moveLeftBtn.disabled = disableLeftBtn;
      moveRightBtn.disabled = disableRightBtn;
    } catch (e) {
      /* error structure was not as expected */
    }
  };

  // Create Observer instance
  const observer = new IntersectionObserver(callBack, observerOptions);

  // Apply observer on each item
  itemList.forEach((item) => {
    observer.observe(item);
  });
}
