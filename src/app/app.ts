import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button'; // <-- Импорт компонента PrimeNG

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ButtonModule], // <-- Подключаем в imports
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly title = signal('Mantera Hostel Group');
}
