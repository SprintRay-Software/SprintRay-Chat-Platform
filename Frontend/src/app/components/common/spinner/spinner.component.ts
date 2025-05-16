import { Component, Input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'sr-spinner',
    standalone: true,
    imports: [MatIcon],
    template: `
        <mat-icon
            svgIcon="sr:loader"
            class="pi-spin d-inline-flex align-items-center justify-content-center"
            [inline]="true"
        />
    `,
    styleUrl: './spinner.component.scss',
    host: {
        '[style.width.px]': 'size',
        '[style.height.px]': 'size',
        '[style.color]': 'color',
    },
})
export class SpinnerComponent {
    @Input() size = 24;
    @Input() color = '#cc0033';
}
