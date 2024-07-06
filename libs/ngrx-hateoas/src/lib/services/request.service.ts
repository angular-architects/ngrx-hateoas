import { HATEOAS_ANTI_FORGERY, HATEOAS_CUSTOM_HEADERS, HATEOAS_LOGIN_REDIRECT } from './../provide';
import { Injectable, inject } from "@angular/core";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RequestService {
    private antiForgeryOptions = inject(HATEOAS_ANTI_FORGERY, { optional: true });
    private loginRedirectOptions = inject(HATEOAS_LOGIN_REDIRECT, { optional: true });
    private customHeadersOptions = inject(HATEOAS_CUSTOM_HEADERS, { optional: true });

    private httpClient = inject(HttpClient);

    public async request<T>(method: 'GET' | 'PUT' | 'POST' | 'DELETE', url: string, body?: any): Promise<T | undefined> {
        let headers = new HttpHeaders().set('Content-Type', 'application/json');

        if(this.customHeadersOptions) {
            for(let key in this.customHeadersOptions.headers) {
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
            let response = await firstValueFrom(this.httpClient.request<T>(method, url, { body, headers }));
            return response;
        } catch(errorResponse: any) {
            if(errorResponse.status === 401 && this.loginRedirectOptions) {
                // Redirect to sign in 
                const currentUrl = window.location.href;
                window.location.href = `${this.loginRedirectOptions.loginUrl}?${this.loginRedirectOptions.redirectUrlParamName}=` + encodeURIComponent(currentUrl);
                return undefined;
            } else {
                throw errorResponse;
            }
        }
    }

    private getXsrfCookie(cookieName: string) {
        const o=document.cookie.split(";").map(t=>t.trim()).filter(t=>t.startsWith(cookieName+"="));
        return 0===o.length?null:decodeURIComponent(o[0].split("=")[1]);
    }

}
