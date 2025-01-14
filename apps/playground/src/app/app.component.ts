import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AppStore } from './app.store';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, RouterLink],
    templateUrl: './app.component.html'
})
export class AppComponent {

  store = inject(AppStore);
  rootApiLoaded = this.store.rootApiState.isLoaded;

  logIn() {
    window.location.href  = './login?redirectUri=' + encodeURIComponent(window.origin);
  }

  logOut() {
    window.location.href  = './logout';
  }

}
