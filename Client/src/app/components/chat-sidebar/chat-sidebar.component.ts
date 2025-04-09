import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-chat-sidebar',
  imports: [MatIconModule, MatMenuModule],
  templateUrl: './chat-sidebar.component.html',
  styles: ``,
})
export class ChatSidebarComponent {}
