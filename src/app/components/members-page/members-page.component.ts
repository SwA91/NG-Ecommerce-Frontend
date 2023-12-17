import { Component, type OnInit } from '@angular/core';

@Component({
  selector: 'app-members-page',
  templateUrl: './members-page.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class MembersPageComponent implements OnInit {
  ngOnInit(): void {}
}
