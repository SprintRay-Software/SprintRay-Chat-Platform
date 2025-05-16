import { Component, Optional } from '@angular/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { PreviewFileDialogConfig } from './preview-file-dialog-config';
import { last } from 'lodash-es';
import { FileTypeIconMap, FileTypes } from '../../core/constants';
import { SafePipe } from 'safe-pipe';
import { MatIcon } from '@angular/material/icon';
import { NgIf } from '@angular/common';
import { filesize } from 'filesize';
import { Button } from 'primeng/button';
import { TranslateModule } from '@ngx-translate/core';
import { DownloadFileService } from '../../core/services';
import { SpinnerComponent } from '../../components/common/spinner';

@Component({
    selector: 'sr-preview-file-dialog',
    standalone: true,
    imports: [SafePipe, MatIcon, NgIf, Button, TranslateModule, SpinnerComponent],
    templateUrl: './preview-file-dialog.component.html',
    styleUrl: './preview-file-dialog.component.scss',
})
export class PreviewFileDialogComponent {
    protected canPreview = false;
    protected file?: PreviewFileDialogConfig['file'];
    protected fileExtension?: string;
    protected icon?: string;
    protected fileSize?: string;
    protected isDownloading = false;

    constructor(
        private readonly _downloadService: DownloadFileService,
        @Optional() private readonly _config?: DynamicDialogConfig<PreviewFileDialogComponent>,
        @Optional() protected readonly _ref?: DynamicDialogRef
    ) {
        this.file = this._config?.data?.file;
        this.fileExtension = last(this.file?.name.split('.'));
        this.canPreview = this.fileExtension === FileTypes.pdf;
        // @ts-ignore
        this.icon = FileTypeIconMap[this.fileExtension];
        this.fileSize = filesize(this.file?.size ?? 0);
    }

    protected async download() {
        if (this.file && this.file.downloadLink && !this.isDownloading) {
            const link = this.file.downloadLink;
            this.isDownloading = true;
            await this._downloadService.download(link).catch(console.warn);
            this.isDownloading = false;
        }
    }

    protected exit() {
        this._ref?.close();
    }
}
