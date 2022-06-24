import { Component } from "./Component.js";

export class Tooltip extends Component {
  constructor(closeNotifierFunction, tooltipText, title, hostElementId) {
    super(hostElementId);
    this.closeNotifier = closeNotifierFunction;
    this.tooltipText = tooltipText;
    this.title = title;
    this.create();
  }

  closeTooltip = () => {
    this.detach();
  };

  create() {
    const tooltipElement = document.createElement("div");
    tooltipElement.className = "card";
    const tooltipTemplate = document.getElementById("tooltip");
    const tooltipBody = document.importNode(tooltipTemplate.content, true);
    tooltipBody.querySelector("p").textContent = this.title;
    tooltipBody.querySelector("h3").textContent = this.tooltipText;
    tooltipElement.appendChild(tooltipBody);

    tooltipElement.setAttribute(
      "style",
      "background-color: #fffff; color: black; height: 200px; width:60%;  padding:10px; text-align:center;font-size: 15px"
    );

    const hostElPosleft = this.hostElement.offsetLeft;
    const hostElPosTop = this.hostElement.offsetTop;
    const hostHeight = this.hostElement.clientHeight;
    const parentElementScrolling = this.hostElement.parentElement.scrollTop;

    const x = hostElPosleft + 20;
    const y = hostElPosTop + hostHeight - parentElementScrolling - 10;
    tooltipElement.style.position = "absolute";
    tooltipElement.style.left = x + "px"; //20px
    tooltipElement.style.top = y + "px";

    tooltipElement.addEventListener("click", this.detach);
    this.element = tooltipElement;
  }
}
