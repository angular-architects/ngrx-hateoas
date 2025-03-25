import { HATEOAS_ANTI_FORGERY, HATEOAS_CUSTOM_HEADERS, HATEOAS_LOGIN_REDIRECT } from './../provide';
import { Injectable, InjectionToken, inject } from "@angular/core";
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export const WINDOW = new InjectionToken<Window>('Global window object', { factory: () => window });

@Injectable()
export class RequestService {
    private window = inject(WINDOW);
    private antiForgeryOptions = inject(HATEOAS_ANTI_FORGERY, { optional: true });
    private loginRedirectOptions = inject(HATEOAS_LOGIN_REDIRECT, { optional: true });
    private customHeadersOptions = inject(HATEOAS_CUSTOM_HEADERS, { optional: true });

    private httpClient = inject(HttpClient);

    public async request<T>(method: 'GET' | 'PUT' | 'POST' | 'DELETE', url: string, body?: unknown): Promise<HttpResponse<T>> {
        let headers = new HttpHeaders().set('Content-Type', 'application/json');

        if(this.customHeadersOptions) {
            for(const key in this.customHeadersOptions.headers) {
                headers = headers.set(key, this.customHeadersOptions.headers[key]);
            };
        }
                        
        if(method !== 'GET' && this.antiForgeryOptions) {
            const xsrfToken = this.getXsrfCookie(this.antiForgeryOptions.cookieName);

            if(xsrfToken) {
                headers = headers.set(this.antiForgeryOptions.headerName, xsrfToken);
            }
        }

        try {
            return await firstValueFrom(this.httpClient.request<T>(method, url, { body, headers, observe: 'response' }));
        } catch(errorResponse) {
            if(typeof errorResponse === 'object' && errorResponse !== null && 'status' in errorResponse && errorResponse.status === 401 && this.loginRedirectOptions) {
                // Redirect to sign in 
                const currentUrl = this.window.location.href;
                this.window.location.href = `${this.loginRedirectOptions.loginUrl}?${this.loginRedirectOptions.redirectUrlParamName}=` + encodeURIComponent(currentUrl);
            }
            throw errorResponse;
        }
    }

    private getXsrfCookie(cookieName: string) {
        const o=document.cookie.split(";").map(t=>t.trim()).filter(t=>t.startsWith(cookieName+"="));
        return 0===o.length?null:decodeURIComponent(o[0].split("=")[1]);
    }

}
