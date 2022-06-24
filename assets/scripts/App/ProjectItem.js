import { DomHelper } from '../Utility/DomeHelper.js';
import { Tooltip } from './Tooltip.js';

export class ProjectItem {
  hasActiveTooltip = false;
  constructor(id, updateProjectListFunction, type) {
    this.id = id;
    this.updateProjectListHandler = updateProjectListFunction;
    this.connectSwitchButton(type);
    this.connectMoreInfoButton();
    this.startDrag();
  }

  showMoreInfoHandler() {
    if (this.hasActiveTooltip) {
      return;
    }
    const projectElement = document.getElementById(this.id);
    const title = projectElement.querySelector("h2").innerHTML;
    const tooltipText = projectElement.dataset.extraInfo;

    const tooltip = new Tooltip(
      () => {
        this.hasActiveTooltip = false;
      },
      tooltipText,
      title,
      this.id
    );
    tooltip.show();

    this.hasActiveTooltip = true;
  }
  //start drag//
  startDrag() {
    document.getElementById(this.id).addEventListener("dragstart", (event) => {
      event.dataTransfer.setData("text/plain", this.id);
      event.dataTransfer.effectAllowed = "move";
    });
  }
  connectMoreInfoButton() {
    const projectitemElement = document.getElementById(this.id);
    const moreInfoBtn = projectitemElement.querySelector(
      "button:first-of-type"
    );
    moreInfoBtn.addEventListener("click", this.showMoreInfoHandler.bind(this));
  }

  connectSwitchButton(type) {
    const projectItemElement = document.getElementById(this.id);
    let switchBtn = projectItemElement.querySelector("button:last-of-type");
    switchBtn = DomHelper.clearEventListener(switchBtn);
    if ((switchBtn.textContent = type === "active")) {
      switchBtn.textContent = "Finish";
      switchBtn.setAttribute(
        "style",
        "background-color:#ff2579; border-color: #ff2579"
      );
    } else {
      switchBtn.setAttribute(
        "style",
        "background-color:green; border-color: green;"
      );

      switchBtn.textContent = "Activate";
    }

    switchBtn.addEventListener(
      "click",
      this.updateProjectListHandler.bind(null, this.id)
    );
  }
  update(updateProjectListFn, type) {
    this.updateProjectListHandler = updateProjectListFn;
    this.connectSwitchButton(type);
  }
}
