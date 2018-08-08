import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {ElectronService} from '../../providers/electron.service';

import {NgbModal, ModalDismissReasons, NgbModalRef, NgbActiveModal} from '@ng-bootstrap/ng-bootstrap';

import * as path from 'path';

@Component({
  selector: 'app-modal-success',
  template: `
    <div class="container" style="height: 10vh;">
      <div class="row" style="height: 10vh;">
        <div class="col-12 my-auto text-center">
          Theme Fusion
        </div>
      </div>
    </div>
    <div class="container" style="height: 10vh; background-color: #34ce57">
      <div class="row" style="height: 10vh;">
        <div class="col-12 my-auto text-center text-white">
          Success
        </div>
      </div>
    </div>
  `
})

export class ModalSuccessComponent {
  constructor(public activeModal: NgbActiveModal){}
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  pickIconsFolderEnabled = true;
  pickDestinationFolderEnabled = true;

  pickedIconsFolder = '';
  pickedDestinationFolder = '';

  modal: NgbModalRef;

  sizes = {
    // iPhone Sizes
    s60: {
      prefix: '',
      size: 60,
      isPad: false,
      enabled: true
    },
    s120: {
      prefix: '@2x',
      size: 120,
      isPad: false,
      enabled: true
    },
    s180: {
      prefix: '@3x',
      size: 180,
      isPad: false,
      enabled: true
    },
    // iPad Sizes
    s76: {
      prefix: '~ipad',
      size: 76,
      isPad: true,
      enabled: true
    },
    s152: {
      prefix: '@2x~ipad',
      size: 152,
      isPad: true,
      enabled: true
    }
  };

  constructor(public electronService: ElectronService, private modalService: NgbModal) {
  }

  ngOnInit() {
  }

  clickButton(content) {
    // this.electronService.openDialog((data) => {
    //   console.log(data);
    // });
    this.modal = this.modalService.open(content, {centered: true});
    this.modal.result.then(() => {
      this.modalService.open(ModalSuccessComponent);
    }, () => {
      this.closeModal();
    });
  }

  convertButtonIsDisabled() {
    return this.pickedIconsFolder === '' && this.pickedDestinationFolder === '';
  }

  closeModal() {
    this.pickDestinationFolderEnabled = true;
    this.pickIconsFolderEnabled = true;
    this.pickedIconsFolder = '';
    this.pickedDestinationFolder = '';
  }

  pickFolder(entry) {
    this.electronService.openDialog((data) => {
      if (entry === 0) {
        this.pickedIconsFolder = data[0];
        this.pickIconsFolderEnabled = false;
      } else {
        this.pickedDestinationFolder = data[0];
        this.pickDestinationFolderEnabled = false;
      }
    });
  }

  convert() {
    const files = this.electronService.fs.readdirSync(this.pickedIconsFolder);
    const filelist = [];
    files.forEach((file) => {
      if (!this.electronService.fs.statSync(this.pickedIconsFolder + '/' + file).isDirectory()) {
        filelist.push(file);
      }
    });
    // console.log(filelist);
    filelist.forEach((item) => {
      // return {name: path.basename(item, path.extname(item)), ext: path.extname(item)};
      const sharp = window.require('sharp');
      Object.keys(this.sizes).forEach((sise) => {
        const size = this.sizes[sise];
        if (size.enabled) {
          sharp(this.pickedIconsFolder + '/' + item)
            .resize(size.size, size.size) // Use resize otherwise it applies crop (From the Doc).
            .max()
            .toFile(this.pickedDestinationFolder + '/' + path.basename(item, path.extname(item)) + size.prefix + path.extname(item))
            .then((ImageResult) => {
              this.closeModal();
              this.modal.close();
            })
            .catch(() => {
            });
        }
      });
    });
  }
}
