import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './layouts/header';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

const icons = [
    'header-home',
    'chat-land-beta',
    'loader',
    'success',
    'contact-support',
    'alert-info',
    'support-agent',
    'company-logo',
    'left-arrow',
    'right-arrow',
    'file-type-pdf',
    'file-type-link',
    'download',
    'open-external',
    'close',
    'add',
    'error',
];

@Component({
    selector: 'sr-root',
    standalone: true,
    imports: [RouterOutlet, HeaderComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
    title = 'SprintRay Chat';

    constructor(
        private readonly _iconRegistry: MatIconRegistry,
        private readonly _sanitizer: DomSanitizer
    ) {
        this.registerIcons();
    }

    ngOnInit() {}

    private registerIcons() {
        // `sr` is abbreviation of `sprint-ray`
        icons.forEach(icon =>
            this._iconRegistry.addSvgIconInNamespace(
                'sr',
                icon,
                this._sanitizer.bypassSecurityTrustResourceUrl(`/assets/svg-icons/${icon}.svg`)
            )
        );
    }
}
