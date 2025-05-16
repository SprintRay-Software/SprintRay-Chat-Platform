import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'decodeURI',
    standalone: true,
})
export class DecodeURIPipe implements PipeTransform {
    transform(value: string | null | undefined, ...args: unknown[]): string {
        return decodeURI(value ?? '');
    }
}
