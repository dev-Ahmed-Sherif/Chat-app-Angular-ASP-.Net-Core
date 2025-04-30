import {
  Component,
  ElementRef,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { VideoChatService } from '../../services/video-chat.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-video-chat',
  imports: [MatIconModule],
  template: `
    <div class="relative h-full w-full overflow-hidden">
      <video
        class="w-32 h-52 absolute z-20 right-5 top-4 object-cover border-blue-500 border-2 rounded-lg"
        #localVideo
        autoplay
        playsInline
      ></video>
      <video
        class="w-full h-full absolute object-cover"
        #remoteVideo
        autoplay
        playsInline
      ></video>
      <div
        class="absolute bottom-10 left-0 right-0 p-4 z-50 flex justify-center space-x-3"
      >
        @if (signalRService.inComingCall) {
        <button
          class="bg-green-500 flex items-center gap-2 hover:bg-gray-700
                shadow-xl text-white font-bold px-4 py-2 rounded-full"
          (click)="acceptCall()"
        >
          <mat-icon>call</mat-icon>Accept
        </button>
        <button
          class="bg-red-500 flex items-center gap-2 hover:bg-gray-700
                shadow-xl text-white font-bold px-4 py-2 rounded-full"
          (click)="declineCall()"
        >
          <mat-icon>call_end</mat-icon>Decline
        </button>
        } @if (!signalRService.inComingCall && !signalRService.isCallActive) {

        <button
          class="bg-green-500 flex items-center gap-2 hover:bg-gray-700
                shadow-xl text-white font-bold px-4 py-2 rounded-full"
          (click)="startCall()"
        >
          <mat-icon>call</mat-icon>Start Call
        </button>
        } @if (!signalRService.inComingCall) {
        <button
          class="bg-red-500 flex items-center gap-2 hover:bg-red-900
                shadow-xl text-white font-bold px-4 py-2 rounded-full"
          (click)="endCall()"
        >
          <mat-icon>call_end</mat-icon>End Call
        </button>
        }
      </div>
    </div>
  `,
  styles: ``,
})
export class VideoChatComponent implements OnInit {
  @ViewChild('localVideo') localVideo!: ElementRef<HTMLVideoElement>;
  @ViewChild('remoteVideo') remoteVideo!: ElementRef<HTMLVideoElement>;

  private peerConnection!: RTCPeerConnection;
  signalRService = inject(VideoChatService);
  private dialogRef: MatDialogRef<VideoChatComponent> = inject(MatDialogRef);
  private localStream!: MediaStream;
  private remoteStream!: MediaStream;
  private iceCandidateQueue: RTCIceCandidate[] = [];

  ngOnInit(): void {
    this.setupPeerConnection();
    this.startLocalVideo();
    this.signalRService.startConnection();
    this.setupSignalRListeners();
    // this.setupLocalStream();
  }
  setupSignalRListeners() {
    this.signalRService.hubConnection.on('CallEnded', () => {});

    this.signalRService.answerReceived.subscribe(async (data) => {
      if (data) {
        try {
          // Check if the signaling state allows setting the remote description
          if (this.peerConnection.signalingState === 'have-local-offer') {
            await this.peerConnection.setRemoteDescription(
              new RTCSessionDescription(data.answer)
            );

            // Process queued ICE candidates
            this.iceCandidateQueue.forEach(async (candidate) => {
              await this.peerConnection.addIceCandidate(candidate);
            });
            this.iceCandidateQueue = []; // Clear the queue
          } else {
            console.error(
              `Cannot set remote description in state: ${this.peerConnection.signalingState}`
            );
          }
        } catch (error) {
          console.error('Error setting remote description:', error);
        }
      }
    });

    this.signalRService.iceCandidateReceived.subscribe(async (data) => {
      if (data) {
        const candidate = new RTCIceCandidate(data.candidate);

        if (this.peerConnection.remoteDescription) {
          // Add ICE candidate if remote description is already set
          await this.peerConnection.addIceCandidate(candidate);
        } else {
          // Queue ICE candidate if remote description is not set
          this.iceCandidateQueue.push(candidate);
        }
      }
    });
  }

  declineCall() {
    // Implement logic to decline the call
    // For example, you can send a message to the server or update the UI
    // Clear the incoming call
    this.signalRService.inComingCall = false;
    this.signalRService.isCallActive = false;

    this.signalRService.sendEndCall(this.signalRService.remoteUserId);
    // Close the dialog
    this.dialogRef.close();
    // this.signalRService.hubConnection.invoke('DeclineCall', 'userId');
  }

  async acceptCall() {
    this.signalRService.inComingCall = false;
    this.signalRService.isCallActive = true;

    let offer = await this.signalRService.offerReceived?.getValue()?.offer;
    if (offer) {
      await this.peerConnection.setRemoteDescription(
        new RTCSessionDescription(offer)
      );

      if (this.peerConnection.signalingState === 'have-remote-offer') {
        let answer = await this.peerConnection.createAnswer();
        await this.peerConnection.setLocalDescription(answer);
        this.signalRService.sendAnswer(
          this.signalRService.remoteUserId,
          answer
        );
      }
    }
  }

  async startCall() {
    this.signalRService.isCallActive = true;

    let offer = await this.peerConnection.createOffer();

    if (this.peerConnection.signalingState === 'stable') {
      await this.peerConnection.setLocalDescription(offer);
      this.signalRService.sendOffer(this.signalRService.remoteUserId, offer);
    }
  }

  setupPeerConnection() {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun.services.mozilla.com' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:st2.l.google.com:19302' },
      ],
    });

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        this.signalRService.sendIceCandidate(
          this.signalRService.remoteUserId,
          event.candidate
        );
      }
    };

    this.peerConnection.ontrack = (event) => {
      if (!this.remoteStream) {
        this.remoteStream = new MediaStream();
        this.remoteVideo.nativeElement.srcObject = this.remoteStream;
      }
      event.streams[0].getTracks().forEach((track) => {
        this.remoteStream.addTrack(track);
      });
    };
  }

  async startLocalVideo() {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    this.localStream = stream; // Store the local stream
    this.localVideo.nativeElement.srcObject = stream;

    stream.getTracks().forEach((track) => {
      this.peerConnection.addTrack(track, stream);
    });
  }

  async endCall() {
    if (this.peerConnection) {
      this.dialogRef.close();
      this.signalRService.isCallActive = false;
      this.signalRService.inComingCall = false;
      this.signalRService.remoteUserId = '';
      this.peerConnection.close();
      this.peerConnection = new RTCPeerConnection();
    }

    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop());
      this.localVideo.nativeElement.srcObject = null;
    }

    if (this.remoteStream) {
      this.remoteStream.getTracks().forEach((track) => track.stop());
      this.remoteVideo.nativeElement.srcObject = null;
    }

    this.signalRService.sendEndCall(this.signalRService.remoteUserId);
  }
}
