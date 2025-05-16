import { inject, Pipe, PipeTransform } from '@angular/core';
import { MessageUser } from '../models';
import { AvatarService } from '../services';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments';

@Pipe({
    name: 'messageUserAvatar',
    standalone: true,
})
export class MessageUserAvatarPipe implements PipeTransform {
    private readonly _avatarService = inject(AvatarService);

    transform(value: MessageUser, isAiBot: boolean | null = false): Observable<string | undefined> {
        return new Observable(subscriber => {
            subscriber.next(undefined);

            const subscription = (
                isAiBot ? of(environment.aiBotMetadata.avatarUrl) : this._avatarService.get(value.id)
            ).subscribe({
                next: v => {
                    subscriber.next(v);
                    subscriber.complete();
                },
            });

            return {
                unsubscribe() {
                    subscription.unsubscribe();
                },
            };
        });
    }
}
