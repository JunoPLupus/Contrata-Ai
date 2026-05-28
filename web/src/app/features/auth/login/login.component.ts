import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  protected readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  protected readonly submitted = signal(false);

  protected get emailControl() {
    return this.form.controls.email;
  }

  protected onSubmit(): void {
    this.submitted.set(true);
    if (this.form.valid) {
      console.log(this.form.value);
      this.router.navigate(['/cliente/home']);
    }
  }
}
