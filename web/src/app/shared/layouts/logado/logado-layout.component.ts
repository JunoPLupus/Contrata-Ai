import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderLogadoComponent } from '../../components/header-logado/header-logado.component';

@Component({
  selector: 'app-logado-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderLogadoComponent],
  templateUrl: './logado-layout.component.html',
  styleUrl: './logado-layout.component.scss',
})
export class LogadoLayoutComponent {}
