import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { UsersService } from '../../../services/users.service';
import { Subject, takeUntil } from 'rxjs';
import { ToastService } from '../../../services/toast.service';
import {
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  userService = inject(UsersService);
  toastService = inject(ToastService);
  _fb = inject(FormBuilder);
  registrationForm = this._fb.group({
    fullName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
    IsAcceptedTerms: new FormControl(false, [Validators.required]),
  });
  destroyRef$ = new Subject<boolean>();
  userProfile!: any;

  createAccount() {
    this.userService
      .createAccount(this.generatePayload())
      .pipe(takeUntil(this.destroyRef$))
      .subscribe({
        next: (user: any) => {
          this.toastService.showSuccess('Your account created successfully!!');
        },
        error: (err: any) => {
          this.toastService.showError(err.message);
        },
      });
  }

  generatePayload() {
    const regPayload = {
      fullName: this.registrationForm.value.fullName,
      email: this.registrationForm.value.email,
      password: this.registrationForm.value.password,
      profilePicture: this.userProfile,
      accountMode: 'user-reg',
    };
    console.log('generate-payload', regPayload);
    return regPayload;
  }

  loadSelectedProfile(evt: any) {
    const files = evt.target.files;
    console.log('files=', files);
    let fileReader = new FileReader();
    fileReader.readAsDataURL(files[0]);
    fileReader.onload = (load) => {
      this.userProfile = fileReader.result;
    };
    // for (let index = 0; index < files.length; index++) {
    //   let fileReader = new FileReader();
    //   fileReader.readAsDataURL(files[index]);
    //   fileReader.onload = (load) => {
    //     this.productImages.push(fileReader.result);
    //   };
    // }
  }

  ngOnDestory() {
    this.destroyRef$.next(true);
    this.destroyRef$.unsubscribe();
  }
}
