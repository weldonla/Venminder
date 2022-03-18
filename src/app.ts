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
      { route: ['', '/scorer'], name: 'scorer', moduleId: PLATFORM.moduleName('resources/views/scorer'), nav: true, title: "Venminder Bowling Scorer" },
      { route: '/about', name: 'about', moduleId: PLATFORM.moduleName('resources/views/about'), nav: true, title: 'About' }
    ]);

    this.router = router;
  }
}