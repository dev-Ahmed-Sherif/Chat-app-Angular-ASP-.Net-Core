import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { VideoChatService } from './services/video-chat.service';
import { AuthService } from './services/auth.service';
import { MatDialog } from '@angular/material/dialog';
import { VideoChatComponent } from './components/video-chat/video-chat.component';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent implements OnInit {
  title = 'client';

  private videoService = inject(VideoChatService);
  private authService = inject(AuthService);
  private dialog = inject(MatDialog);
  ngOnInit(): void {
    if (!this.authService.getAccessToken) return;
    this.videoService.startConnection();
    this.startOfferReceive();
  }

  startOfferReceive() {
    this.videoService.offerReceived.subscribe(async (data) => {
      if (data) {
        console.log('Offer received:', data);
        let audio = new Audio('/phone-ring.wav');
        audio.play();
        this.dialog.open(VideoChatComponent, {
          width: '1500px',
          height: '600px',
          disableClose: false,
        });
        this.videoService.remoteUserId = data.senderId;
        this.videoService.inComingCall = true;
        // this.videoService.peerConnection.setRemoteDescription(
        //   new RTCSessionDescription(data.offer)
        // );
      }
    });
  }
}
