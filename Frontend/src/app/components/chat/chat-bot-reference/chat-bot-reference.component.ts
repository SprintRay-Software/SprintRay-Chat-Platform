import { Component, HostListener, Input, OnChanges, SimpleChange } from '@angular/core';
import { ChatBotReference, ChatBotReferenceType } from '../../../core/models';
import { FileTypeIconMap, FileTypes } from '../../../core/constants';
import { capitalize, last } from 'lodash-es';
import { MatIcon } from '@angular/material/icon';
import { TranslateService } from '@ngx-translate/core';
import { filesize } from 'filesize';
import { NgIf } from '@angular/common';
import { downloadFile } from '../../../core/utils';
import { DialogService } from 'primeng/dynamicdialog';
import { PreviewFileDialogComponent } from '../../../dialogs';
import { PreviewFileDialogConfig } from '../../../dialogs/preview-file-dialog/preview-file-dialog-config';

interface Action {
    handler(ev: Event): unknown;
    icon?: string;
}

type ActionKeys = 'download' | 'previewPdf' | 'openLinkExternal';

@Component({
    selector: 'sr-chat-bot-reference',
    standalone: true,
    imports: [MatIcon, NgIf],
    templateUrl: './chat-bot-reference.component.html',
    styleUrl: './chat-bot-reference.component.scss',
})
export class ChatBotReferenceComponent implements OnChanges {
    @Input() data?: ChatBotReference | null;

    protected icon?: string | null;
    protected action?: Action | null;
    protected name?: string | null;
    protected description?: string | null;

    private readonly actions: Record<ActionKeys, Action> = {
        download: {
            handler: (ev: Event) => {
                if (this.data?.file?.downloadLink) downloadFile(this.data?.file?.downloadLink);
            },
            icon: 'download',
        },
        previewPdf: {
            handler: (ev: Event) => {
                this.previewPdf();
            },
        },
        openLinkExternal: {
            handler: (ev: Event) => {
                this.openLink({ external: true });
            },
            icon: 'open-external',
        },
    } as const;

    constructor(
        private readonly _translateService: TranslateService,
        private readonly _dialogService: DialogService
    ) {}

    ngOnChanges(changes: Record<keyof ChatBotReferenceComponent, SimpleChange>) {
        if (changes.data && changes.data.previousValue !== changes.data.currentValue && this.data) {
            this.parseData();
        }
    }
    @HostListener('click', ['$event'])
    onClick() {
        if (this.data && this.data.file?.name.endsWith(FileTypes.pdf)) {
            this.previewPdf();
        }
    }

    protected openLink({ external = false }) {
        if (this.data?.link) {
            window.open(this.data.link, external ? '_blank' : '_self');
        }
    }

    protected previewPdf() {
        if (this.data?.file) {
            this._dialogService.open(PreviewFileDialogComponent, {
                showHeader: false,
                data: {
                    file: this.data.file,
                } as PreviewFileDialogConfig,
                styleClass: 'preview-file-dialog',
            });
        }
    }

    protected download() {}

    private parseData() {
        const { data } = this;

        if (data) {
            const { type, file } = data;
            const fileExtension = last(file?.name.split('.'));
            const fileType = type === 'link' || !file ? FileTypes.link : fileExtension;
            if (fileType) this.icon = FileTypeIconMap[fileType];
            switch (type) {
                case ChatBotReferenceType.link:
                    this.name = data.title ?? capitalize(this._translateService.instant('general.link'));
                    this.description = data.link ?? '';
                    this.action = this.actions.openLinkExternal;
                    break;
                case ChatBotReferenceType.file:
                    this.name = data.title ?? data.file?.name;
                    this.description = `${filesize(data.file?.size ?? 0, { round: 2 })}`;
                    this.action = this.actions.download;
                    break;
            }
        }
    }
}
