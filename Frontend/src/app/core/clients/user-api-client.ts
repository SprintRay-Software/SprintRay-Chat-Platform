import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

const basePath = 'users';

@Injectable({ providedIn: 'root' })
export class UserApiClient {
    constructor(private readonly _httpClient: HttpClient) {}

    getUserAvatar(userId: string): Observable<string> {
        return this._httpClient.get<string>(`${basePath}/${userId}/profile-picture`);
    }
}
