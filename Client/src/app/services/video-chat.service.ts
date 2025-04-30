import { inject, Injectable } from '@angular/core';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
} from '@microsoft/signalr';
import { AuthService } from './auth.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VideoChatService {
  private hubUrl = 'http://localhost:5093/hubs/video';
  public hubConnection!: HubConnection;
  public peerConnection!: RTCPeerConnection;

  public inComingCall = false;
  public isCallActive = false;

  public remoteUserId = '';

  public offerReceived = new BehaviorSubject<{
    senderId: string;
    offer: RTCSessionDescriptionInit;
  } | null>(null);
  public answerReceived = new BehaviorSubject<{
    senderId: string;
    answer: RTCSessionDescription;
  } | null>(null);
  public iceCandidateReceived = new BehaviorSubject<{
    senderId: string;
    candidate: RTCIceCandidate;
  } | null>(null);

  private authService = inject(AuthService);

  startConnection() {
    if (this.hubConnection?.state === HubConnectionState.Connected) return;

    this.hubConnection = new HubConnectionBuilder()
      .withUrl(this.hubUrl, {
        accessTokenFactory: () => this.authService.getAccessToken!,
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => {
        console.log('Connected to video hub');
      })
      .catch((err) => console.log('Connection error', err));

    this.hubConnection.on('ReceiveOffer', (senderId, offer) => {
      // console.log('Received call:', data);
      // Handle the incoming call data here
      this.offerReceived.next({ senderId, offer: JSON.parse(offer) });
    });

    this.hubConnection.on('ReceiveAnswer', (senderId, answer) => {
      // console.log('Received call:', data);
      // Handle the incoming call data here
      this.answerReceived.next({ senderId, answer: JSON.parse(answer) });
    });
    this.hubConnection.on('ReceiveIceCandidate', (senderId, candidate) => {
      // console.log('Received call:', data);
      // Handle the incoming call data here
      this.iceCandidateReceived.next({
        senderId,
        candidate: JSON.parse(candidate),
      });
    });
  }

  sendOffer(receiverId: string, offer: RTCSessionDescriptionInit) {
    this.hubConnection
      .invoke('SendOffer', receiverId, JSON.stringify(offer))
      .catch((err) => console.error('Error sending offer:', err));
  }
  sendAnswer(receiverId: string, answer: RTCSessionDescriptionInit) {
    this.hubConnection
      .invoke('SendAnswer', receiverId, JSON.stringify(answer))
      .catch((err) => console.error('Error sending answer:', err));
  }
  sendIceCandidate(receiverId: string, candidate: RTCIceCandidate) {
    this.hubConnection
      .invoke('SendIceCandidate', receiverId, JSON.stringify(candidate))
      .catch((err) => console.error('Error sending ice candidate:', err));
  }

  sendEndCall(receiverId: string) {
    this.hubConnection
      .invoke('EndCall', receiverId)
      .catch((err) => console.error('Error sending end call:', err));
  }

  stopConnection() {
    if (this.hubConnection?.state === HubConnectionState.Disconnected) return;
    this.hubConnection.stop().then(() => {
      console.log('Disconnected from video hub');
    });
  }
}
