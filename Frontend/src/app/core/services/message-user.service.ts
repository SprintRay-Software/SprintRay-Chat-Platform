import { inject, Injectable } from '@angular/core';
import { AppsyncClient } from '../clients';
import { getUserQuery } from '../../graphql';
import getUserById from '../../graphql/queries/getUserById';
import { combineLatest, Observable } from 'rxjs';
import { MessageUser } from '../models';

@Injectable({ providedIn: 'root' })
export class MessageUserService {
    private readonly _appsyncClient = inject(AppsyncClient);

    fetchMessageUser(messageUserId: string) {
        return new Observable<MessageUser>(subscriber => {
            let subscription: ZenObservable.Subscription | null | undefined;
            this._appsyncClient.client.then(client => {
                const observableUser = client.watchQuery<getUserQuery>({
                    query: getUserById,
                    variables: { cognitoId: messageUserId },
                    fetchPolicy: 'network-only',
                });

                subscription = observableUser.subscribe(res => {
                    const data = res.data;

                    if (data) {
                        subscriber.next(data.getUser);
                    } else {
                        subscriber.error(`Failed to get user data, messageUserId: ${messageUserId}`);
                    }

                    subscriber.complete();

                    subscription?.unsubscribe();
                });
            });

            return {
                unsubscribe: () => {
                    subscription?.unsubscribe();
                },
            };
        });
    }

    fetchMessageUsers(messageUserIds: string[]) {
        return combineLatest(messageUserIds.map(id => this.fetchMessageUser(id)));
    }
}
