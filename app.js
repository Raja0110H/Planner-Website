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
    element.scrollIntoView({ behavior: "smooth" });
  }
}

class Component {
  constructor(hostElementId, insertBefore = false) {
    if (hostElementId) {
      this.hostElement = document.getElementById(hostElementId);
    } else {
      this.hostElement = document.body;
    }

    this.insertBefore = insertBefore;
  }
  detach = () => {
    if (this.element) {
      this.element.remove();
      this.closeNotifier();
    }

    // for older browser
    // his.element.parentElement.removeChild(this.element)
  };
  show() {
    this.hostElement.insertAdjacentElement(
      this.insertBefore ? "afterbegin" : "beforeend",
      this.element
    );
  }
}
class Tooltip extends Component {
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

class ProjectItem {
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
        "background-color:green; border-color: green; opacity:0.5"
      );
   
      switchBtn.textContent = "Done";
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
    this.endDrag();
  }
  //end drag//{
  endDrag() {
    const list = document.querySelector(`#${this.type}-projects ul`);
    list.addEventListener("dragenter", (event) => {
      if (event.dataTransfer.types[0] === "text/plain") {
        list.parentElement.classList.add("droppable");
        event.preventDefault();
      }
    });
    list.addEventListener("dragover", (event) => {
      event.preventDefault();
    });

    list.addEventListener("dragleave", (event) => {
      if (event.relatedTarget.closest(`#${this.type}-projects ul`) !== list) {
        list.parentElement.classList.remove("droppable");
      }
    });
    list.addEventListener("drop", (event) => {
      const projectId = event.dataTransfer.getData("text/plain");
      if (this.projects.find((project) => project.id === projectId)) {
        return;
      }
      document
        .getElementById(projectId)
        .querySelector("button:last-of-type")
        .click();
      list.parentElement.classList.remove("droppable");
      event.preventDefault();
    });
  }

  setSwitchHandlerFunction(switchHandlerFunction) {
    this.switchHandler = switchHandlerFunction;
  }
  addProject(project) {
    this.projects.push(project);

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
