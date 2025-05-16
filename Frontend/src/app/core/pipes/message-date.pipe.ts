import { Inject, LOCALE_ID, Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
    name: 'messageDate',
    standalone: true,
})
export class MessageDatePipe extends DatePipe implements PipeTransform {
    constructor(
        @Inject(LOCALE_ID) locale: string,
        private translateService: TranslateService
    ) {
        super(locale);
    }

    override transform(
        value: Date | string | number,
        format?: string,
        timezone?: string,
        locale?: string
    ): string | null;
    override transform(value: null | undefined, format?: string, timezone?: string, locale?: string): null;
    override transform(
        value: Date | string | number | null | undefined,
        format?: string,
        timezone?: string,
        locale?: string
    ): string | null {
        value ??= new Date();

        const currentLang = this.translateService.currentLang;

        const date =
            typeof value === 'string'
                ? new Date(value.endsWith('Z') ? value : value + 'Z')
                : typeof value === 'number'
                  ? new Date(value)
                  : value;
        const today = new Date();

        const diffInTime = today.getTime() - date.getTime();
        const diffInDays = diffInTime / (1000 * 3600 * 24);

        if (diffInDays < 7) {
            format = 'EEEE HH:mm';
        }

        return super.transform(date, format, timezone, currentLang) ?? '';
    }
}
