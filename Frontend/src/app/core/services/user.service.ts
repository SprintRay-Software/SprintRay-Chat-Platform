import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments';
import { Observable } from 'rxjs';

const basePath = `${environment.apis.dashboard.baseUrl}${environment.apis.dashboard.basePath}/users`;

@Injectable({
    providedIn: 'root',
})
export class UserService {
    private readonly _http = inject(HttpClient);

    getUserProfile(): Observable<any> {
        return this._http.get(`${basePath}/profile`);
    }
}
