import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'profilePicture',
    standalone: true,
})
export class ProfilePicturePipe implements PipeTransform {
    transform(userId: string, ...args: unknown[]): string {
        return '';
    }
}
