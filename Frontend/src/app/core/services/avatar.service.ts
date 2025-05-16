import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { environment } from '../../../environments';

const basePath = `${environment.apis.dashboard.baseUrl}${environment.apis.dashboard.basePath}/users`;
const maxCacheSize = 500;
const _avatarsMap = new Map<string, Observable<string>>();

@Injectable({
    providedIn: 'root',
})
export class AvatarService {
    private readonly _http = inject(HttpClient);

    get(userId: string) {
        let avatar = _avatarsMap.get(userId);
        if (avatar == null) {
            if (_avatarsMap.size > maxCacheSize) {
                _avatarsMap.clear();
            }
            avatar = this._http.get<string>(`${basePath}/${userId}/profile-picture`).pipe(shareReplay(1));
            _avatarsMap.set(userId, avatar);
        }

        return avatar;
    }
}
