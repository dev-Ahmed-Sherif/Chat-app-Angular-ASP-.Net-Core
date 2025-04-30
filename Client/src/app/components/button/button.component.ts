import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-button',
  imports: [],
  templateUrl: './button.component.html',
  styleUrl: './button.component.css',
})
export class ButtonComponent {
  isDisabled = input<boolean>(false);
  isLoading = input<boolean>(false);

  action = output<void>();
  text = input.required<string>();

  actionHandler() {
    this.action.emit();
  }
}
