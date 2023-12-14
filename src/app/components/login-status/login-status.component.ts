import { Component, Inject, OnInit } from '@angular/core';
import { OKTA_AUTH, OktaAuthStateService } from '@okta/okta-angular';
import { OktaAuth } from '@okta/okta-auth-js';

@Component({
  selector: 'app-login-status',
  templateUrl: './login-status.component.html',
  styles: [
    `
      .security-btn {
        position: relative;
        right: 0;
        min-width: 95px;
        color: #fff;
        border: 10px solid #205b8d;
        -webkit-border-radius: 3px;
        -moz-border-radius: 3px;
        border-radius: 43px;
        background: #205b8d;
      }
      .login-status-header {
        display: -webkit-box;
        display: -webkit-flex;
        display: -moz-box;
        display: -ms-flexbox;
        display: flex;
      }
      .login-status-user-info {
        line-height: 43px;
        border: 1px;
        padding: 0 17px;
        -webkit-border-radius: 3px;
        -moz-border-radius: 3px;
        border-radius: 3px;
        -webkit-transition: all 0.5s ease;
        -o-transition: all 0.5s ease;
        -moz-transition: all 0.5s ease;
        transition: all 0.5s ease;
      }
    `,
  ],
})
export class LoginStatusComponent implements OnInit {
  isAuthenticated = false;
  userFullName = '';

  constructor(
    private oktaAuthService: OktaAuthStateService, // servicio de angular
    @Inject(OKTA_AUTH) private oktaAuth: OktaAuth
  ) {}

  ngOnInit(): void {
    // subscribe to authentication state changes
    this.oktaAuthService.authState$.subscribe(result => {
      this.isAuthenticated = result.isAuthenticated as boolean;
      this.getUserDetails();
    });
  }

  logout() {
    // terminates the session with Okta and removes current tokens
    this.oktaAuth.signOut();
  }

  getUserDetails() {
    if (this.isAuthenticated) {
      // fetch the logged in user details ( user's claims)
      // user full name is exposed as a property name
      this.oktaAuth.getUser().then(res => {
        this.userFullName = res.name as string;
      });
    }
  }
}
