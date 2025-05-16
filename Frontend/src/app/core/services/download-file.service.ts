import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { first } from 'rxjs';
import { last } from 'lodash-es';

@Injectable({
    providedIn: 'root',
})
export class DownloadFileService {
    constructor(private readonly http: HttpClient) {}

    download(link: string, filename?: string, { success, error }: { success?: () => any; error?: () => any } = {}) {
        filename ??= last(new URL(link).pathname.split('/')) ?? '';
        return new Promise<void>((resolve, reject) => {
            this.http
                .get(link, { responseType: 'blob' })
                .pipe(first())
                .subscribe({
                    next: res => {
                        import('file-saver')
                            .then(({ default: { saveAs } }) => {
                                saveAs(res, filename);
                                success?.();
                                resolve();
                            })
                            .catch(e => error?.());
                    },
                    error: () => {
                        error?.();
                        reject();
                    },
                });
        });
    }
}
