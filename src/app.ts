import { autoinject, PLATFORM } from "aurelia-framework";
import { EventAggregator } from "aurelia-event-aggregator";

@autoinject
export class App {
  router: any;
  eventAggregator: EventAggregator;

  constructor(eventAggregator: EventAggregator) {
    this.eventAggregator = eventAggregator;
 }

  configureRouter(config, router) {
    config.map([
      { route: ['', '/home'], name: 'home', moduleId: PLATFORM.moduleName('resources/views/home'), nav: true, title: "TechStuff AndSuch" },
      { route: '/about', name: 'about', moduleId: PLATFORM.moduleName('resources/views/about'), nav: true, title: 'About' }
    ]);

    this.router = router;
  }
}