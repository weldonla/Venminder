import { Router } from 'aurelia-router';
import { autoinject } from 'aurelia-framework';

@autoinject
export class Navbar {
    constructor(private router: Router) {

    }
}