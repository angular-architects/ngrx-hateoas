import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AppState } from './app.state';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink],
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = 'Flight Management Client';
  appState = inject(AppState);
  rootApiLoaded = this.appState.rootApi.isLoaded;

  logIn() {
    window.location.href  = './login?redirectUri=' + encodeURIComponent(window.origin);
  }

  logOut() {
    window.location.href  = './logout';
  }

}
