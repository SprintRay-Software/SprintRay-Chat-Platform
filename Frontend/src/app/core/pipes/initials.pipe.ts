import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'initials',
    standalone: true,
})
export class InitialsPipe implements PipeTransform {
    transform(value: string, ...args: unknown[]): string {
        return value
            .split(' ')
            .map(i => i?.[0]?.toUpperCase() ?? '')
            .join('');
    }
}
