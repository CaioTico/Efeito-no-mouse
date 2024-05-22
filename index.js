let x1 = 0, y1 = 0;
const vh = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
const dist_to_draw = 50;
const delay = 1000;
const fsize = ['1.1rem', '1.4rem', '.8rem', '1.7rem'];
const colors = [
  '#E23636',
  '#F9F3EE',
  '#E1F8DC',
  '#B8AFE6',
  '#AEE1CD',
  '#5EB0E5'
];

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const selRand = (o) => o[rand(0, o.length - 1)];
const distanceTo = (x1, y1, x2, y2) => Math.sqrt((Math.pow(x2 - x1, 2)) + (Math.pow(y2 - y1, 2)));
const shouldDraw = (x, y) => (distanceTo(x1, y1, x, y) >= dist_to_draw);

const addStr = (x, y) => {
  const str = document.createElement("div");
  str.innerHTML = '&#10022;';
  str.className = 'star';
  str.style.top = `${y + rand(-20,20)}px`;
  str.style.left = `${x}px`;
  str.style.color = selRand(colors);
  str.style.fontSize = selRand(fsize);
  document.body.appendChild(str);

  const fs = 10 + 5 * parseFloat(getComputedStyle(str).fontSize);
  
  str.animate({
    translate: `0 ${(y + fs) > vh ? vh - y : fs}px`,
    opacity: 0,
    transform: `rotateX(${rand(1, 500)}deg) rotateY(${rand(1, 500)}deg)`
  }, {
    duration: delay,
    fill: 'forwards'
  });

  setTimeout(() => {
    str.remove();
  }, delay);
};

addEventListener("mousemove", (e) => {
  const {clientX, clientY} = e;
  if(shouldDraw(clientX, clientY)){
    addStr(clientX, clientY);
    x1 = clientX;
    y1 = clientY;
  }
});


class ClickSpark extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.root = document.documentElement;
    this.svg;
  }

  get activeEls() {
    return this.getAttribute("active-on");
  }

  connectedCallback() {
    this.setupSpark();

    this.root.addEventListener("click", (e) => {
      if (this.activeEls && !e.target.matches(this.activeEls)) return;

      this.setSparkPosition(e);
      this.animateSpark();
    });
  }

  animateSpark() {
    let sparks = [...this.svg.children];
    let size = parseInt(sparks[0].getAttribute("y1"));
    let offset = size / 2 + "px";

    let keyframes = (i) => {
      let deg = `calc(${i} * (360deg / ${sparks.length}))`;

      return [
        {
          strokeDashoffset: size * 3,
          transform: `rotate(${deg}) translateY(${offset})`
        },
        {
          strokeDashoffset: size,
          transform: `rotate(${deg}) translateY(0)`
        }
      ];
    };

    let options = {
      duration: 660,
      easing: "cubic-bezier(0.25, 1, 0.5, 1)",
      fill: "forwards"
    };

    sparks.forEach((spark, i) => spark.animate(keyframes(i), options));
  }

  setSparkPosition(e) {
    let rect = this.root.getBoundingClientRect();

    this.svg.style.left =
      e.clientX - rect.left - this.svg.clientWidth / 2 + "px";
    this.svg.style.top =
      e.clientY - rect.top - this.svg.clientHeight / 2 + "px";
  }

  setupSpark() {
    let template = `
      <style>
        :host {
          display: contents;
        }
        
        svg {
          pointer-events: none;
          position: absolute;
          rotate: -20deg;
          stroke: var(--click-spark-color, currentcolor);
        }

        line {
          stroke-dasharray: 30;
          stroke-dashoffset: 30;
          transform-origin: center;
        }
      </style>
      <svg width="30" height="30" viewBox="0 0 100 100" fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="4">
        ${Array.from(
          { length: 8 },
          (_) => `<line x1="50" y1="30" x2="50" y2="4"/>`
        ).join("")}
      </svg>
    `;

    this.shadowRoot.innerHTML = template;
    this.svg = this.shadowRoot.querySelector("svg");
  }
}

customElements.define("click-spark", ClickSpark);

/** Demo scripts **/

const spark = document.querySelector("click-spark");
const colorPicker = document.getElementById("click-spark-color");

colorPicker.addEventListener("change", (e) => {
  spark.style.setProperty("--click-spark-color", e.target.value);
});
