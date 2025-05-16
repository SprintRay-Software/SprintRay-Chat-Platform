import { Pipe, PipeTransform } from '@angular/core';
import { extractAnchorElements } from '../utils';

@Pipe({
    name: 'extractAnchorElements',
    standalone: true,
})
export class ExtractAnchorElementsPipe implements PipeTransform {
    transform(value: string): string {
        return extractAnchorElements(value);
    }
}
