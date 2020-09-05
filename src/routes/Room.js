import React, { useRef, useEffect, useState } from "react";
import { View, Text } from 'react-native'
import io from "socket.io-client";
import {
    RTCView,
    RTCPeerConnection,
    RTCIceCandidate,
    RTCSessionDescription,
    mediaDevices,
  } from 'react-native-webrtc';

const Room = (props) => {
    const userVideo = useRef();
    const partnerVideo = useRef();
    const peerRef = useRef();
    const socketRef = useRef();
    const otherUser = useRef();
    const userStream = useRef();
    const [stream, setStream] = useState()
    const [remoteStream, setRemoteStream] = useState()

    useEffect(() => {

            socketRef.current = io.connect("http://192.168.0.107:3333");
            console.log(props.route.params.roomID)
            //socketRef.current.on('yourID', id => alert(id))
            socketRef.current.emit("join room", props.route.params.roomID);

            socketRef.current.on('other user', userID => {
                callUser(userID);
                otherUser.current = userID;
            });

            socketRef.current.on("user joined", userID => {
                otherUser.current = userID;
            });

            socketRef.current.on("offer", handleRecieveCall);

            socketRef.current.on("answer", handleAnswer);

            socketRef.current.on("ice-candidate", handleNewICECandidateMsg);
        }, []);

        useEffect(() => {
            if (!stream) {
              (async () => {
                const availableDevices = await mediaDevices.enumerateDevices();
                const {deviceId: sourceId} = availableDevices.find(
                  // once we get the stream we can just call .switchCamera() on the track to switch without re-negotiating
                  // ref: https://github.com/react-native-webrtc/react-native-webrtc#mediastreamtrackprototype_switchcamera
                  device => device.kind === 'videoinput' && device.facing === 'front',
                );

                const constraints = {
                    audio: true,
                    video: {
                      mandatory: {
                        // Provide your own width, height and frame rate here
                        minWidth: 500,
                        minHeight: 300,
                        minFrameRate: 30,
                      },
                      facingMode: 'user',
                      optional: [{sourceId}],
                    },
                  }
        
                mediaDevices.getUserMedia(constraints)
                    .then(stream => {
                        setStream(stream)
                    })
                    .catch(e => alert(e));
        
                //setStream(streamBuffer);
                //peerRef.current.addStream(streamBuffer)
              })();
            }
          }, [stream]);


    function callUser(userID) {
        peerRef.current = createPeer(userID);
        console.log(stream)
        peerRef.current.addStream(stream)
        //peerRef.current.addStream(stream)
        //stream.getVideoTracks().forEach(track => peerRef.current.addstream(track, userStream.current));
        // peerRef.current.onaddstream = event => {
        //     console.log('On Add Stream', event);
        //     setRemoteStream(event.stream);
        //   };
        //stream.getTracks().forEach(track => peerRef.current.addstream(track, stream));
        //stream.getTracks().forEach(track => peerRef.current.addTrack(track, stream));
        //userStream.current.getTracks().forEach(track => peerRef.current.addTrack(track, userStream.current));
    }

    function createPeer(userID) {
        const peer = new RTCPeerConnection({
            iceServers: [
                {
                    urls: "stun:stun.stunprotocol.org"
                },
                {
                    urls: 'turn:numb.viagenie.ca',
                    credential: 'muazkh',
                    username: 'webrtc@live.com'
                },
            ]
        });

        peer.onicecandidate = handleICECandidateEvent;
        peer.onaddstream = handleTrackEvent
        //peer.ontrack = handleTrackEvent;
        peer.onnegotiationneeded = () => handleNegotiationNeededEvent(userID);

        return peer;
    }

    function handleNegotiationNeededEvent(userID) {
        peerRef.current.createOffer({offerToReceiveVideo: true , offerToReceiveAudio: false}).then(offer => {
            return peerRef.current.setLocalDescription(offer);
        }).then(() => {
            const payload = {
                target: userID,
                caller: socketRef.current.id,
                sdp: peerRef.current.localDescription
            };
            socketRef.current.emit("offer", payload);
        }).catch(e => console.log(e));
    }

    function handleRecieveCall(incoming) {
        peerRef.current = createPeer();
        const desc = new RTCSessionDescription(incoming.sdp);
        peerRef.current.setRemoteDescription(desc).then(() => {
            //console.log(userStream.current.video)
            //peerRef.current.addStream(userStream.current)
            //peerRef.current.addStream(stream)
            //stream.getTracks().forEach(track => peerRef.current.addTrack(track, stream));
            //userStream.current.getTracks().forEach(track => peerRef.current.addTrack(track, userStream.current));
        }).then(() => {
            return peerRef.current.createAnswer();
        }).then(answer => {
            return peerRef.current.setLocalDescription(answer);
        }).then(() => {
            const payload = {
                target: incoming.caller,
                caller: socketRef.current.id,
                sdp: peerRef.current.localDescription
            }
            socketRef.current.emit("answer", payload);
        })
    }

    function handleAnswer(message) {
        const desc = new RTCSessionDescription(message.sdp);
        peerRef.current.setRemoteDescription(desc).catch(e => console.log(e));
    }

    function handleICECandidateEvent(e) {
        if (e.candidate) {
            const payload = {
                target: otherUser.current,
                candidate: e.candidate,
            }
            socketRef.current.emit("ice-candidate", payload);
        }
    }

    function handleNewICECandidateMsg(incoming) {
        const candidate = new RTCIceCandidate(incoming);

        peerRef.current.addIceCandidate(candidate)
            .catch(e => console.log(e));
    }

    function handleTrackEvent(e) {
        console.log('oi')
        setRemoteStream(e.stream)
        //console.log(remoteStream)
    };

    return (
        <View 
            style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center"
            }}
        >
            <View style={{flexDirection: "row"}}>
                <RTCView ref={userStream} objectFit='cover' streamURL={stream?.toURL()} style={{width: 150, height: 150}} />
                <RTCView ref={partnerVideo} streamURL={remoteStream?.toURL()} style={{width: 150, height: 150, backgroundColor: '#000'}} />
            </View>
            <Text>{props.route.params.roomID}</Text>
        </View>
    );
};

export default Room;