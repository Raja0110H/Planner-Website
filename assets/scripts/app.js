class DomHelper {
  static clearEventListener(element) {
    const clonedElement = element.cloneNode(true);
    element.replaceWith(clonedElement);
    return clonedElement;
  }
  static moveElement(elementId, newDestinationSelector) {
    const element = document.getElementById(elementId);
    const destinationElement = document.querySelector(newDestinationSelector);
    destinationElement.append(element);
  }
}
class Tooltip {
  constructor(closeNotifierFunction) {
    this.closeNotifier = closeNotifierFunction;
  }
  show() {
    const tooltipElement = document.createElement("div");
    tooltipElement.className = "card";

    const elementIndex = document.querySelector("#list h2");
    //    tooltipElement.textContent = elementIndex[0].innerHTML;
    // get selected element index
    for (var i = 0; i < elementIndex.length; i++) {
      tooltipElement.textContent = elementIndex[i].innerHTML;
      console.log(elementIndex[i].innerHTML);
    }

    tooltipElement.addEventListener("click", this.detach);
    this.element = tooltipElement;
    document.body.append(tooltipElement);
  }
  detach = () => {
    this.element.remove();
    this.closeNotifier();
    // for older browser
    // his.element.parentElement.removeChild(this.element)
  };

  closeTooltip = () => {
    this.detach();
  };
}

class ProjectItem {
  hasActiveTooltip = false;
  constructor(id, updateProjectListFunction, type) {
    this.id = id;
    this.updateProjectListHandler = updateProjectListFunction;
    this.connectSwitchButton(type);
    this.connectMoreInfoButton();
  }

  showMoreInfoHandler() {
    if (this.hasActiveTooltip) {
      return;
    }

    const tooltip = new Tooltip(() => {
      this.hasActiveTooltip = false;
    });
    tooltip.show();
    this.hasActiveTooltip = true;
  }
  connectMoreInfoButton() {
    const projectitemElement = document.getElementById(this.id);
    const moreInfoBtn = projectitemElement.querySelector(
      "button:first-of-type"
    );
    moreInfoBtn.addEventListener("click", this.showMoreInfoHandler);
  }

  connectSwitchButton(type) {
    const projectItemElement = document.getElementById(this.id);
    let switchBtn = projectItemElement.querySelector("button:last-of-type");
    switchBtn = DomHelper.clearEventListener(switchBtn);
    switchBtn.textContent = type === "active" ? "Finish" : "Activate";
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

class ProjectList {
  projects = [];

  constructor(type) {
    this.type = type;
    const projectItems = document.querySelectorAll(`#${type}-projects li`);
    for (const projectItem of projectItems) {
      this.projects.push(
        new ProjectItem(
          projectItem.id,
          this.switchProject.bind(this),
          this.type
        )
      );
    }
    console.log(this.projects);
  }

  setSwitchHandlerFunction(switchHandlerFunction) {
    this.switchHandler = switchHandlerFunction;
  }
  addProject(project) {
    this.projects.push(project);
    console.log(this);
    DomHelper.moveElement(project.id, `#${this.type}-projects ul`);
    project.update(this.switchProject.bind(this), this.type);
  }
  switchProject(projectId) {
    // const projectIndex = this.projects.findIndex(
    //   (project) => project.id == projectId
    // );
    // this.projects.splice(projectIndex, 1);
    this.switchHandler(
      this.projects.find((project) => project.id == projectId)
    );
    this.projects = this.projects.filter((project) => project.id !== projectId);
  }
}

class App {
  static init() {
    const activeProjectList = new ProjectList("active");
    const finishedProjectList = new ProjectList("finished");
    activeProjectList.setSwitchHandlerFunction(
      finishedProjectList.addProject.bind(finishedProjectList)
    );
    finishedProjectList.setSwitchHandlerFunction(
      activeProjectList.addProject.bind(activeProjectList)
    );
  }
}

App.init();
