const socket = io("/");
const chatInputBox = document.getElementById("chat_message");
const all_messages = document.getElementById("all_messages");
const main__chat__window = document.getElementById("main__chat__window");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
var recorder;
myVideo.muted = true;

var peer = new Peer(undefined, {
    path: "/peerjs",
    host: "/",
    port: "3000",
});



var displayMediaOptions = {
    video: {
        cursor: "always"
    },
    audio: false
};

let myVideoStream;
let currentId;

let map = new Map();


const peers = {}
var getUserMedia =
    navigator.getUserMedia ||
    navigator.webkitGetUserMedia ||
    navigator.mozGetUserMedia;

navigator.mediaDevices
    .getUserMedia({
        video: true,
        audio: true,
    })
    .then((stream) => {
        myVideoStream = stream;
        addVideoStream(myVideo, stream);

        peer.on("call", (call) => {
            call.answer(stream);
            const video = document.createElement("video");
            call.on("stream", (userVideoStream) => {
                addVideoStream(video, userVideoStream);
            });
        });

        socket.on("user-connected", (userId) => {
            currentId = userId;
            connectToNewUser(userId, stream);
        });
        document.addEventListener("keydown", (e) => {
            if (e.which === 13 && chatInputBox.value != "") {
                socket.emit("message", chatInputBox.value);
                chatInputBox.value = "";
            }
        });

        socket.on("createMessage", (msg) => {
            console.log(msg);
            let li = document.createElement("li");
            li.innerHTML = msg;
            all_messages.append(li);
            main__chat__window.scrollTop = main__chat__window.scrollHeight;
        });
    })
socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close()
})
peer.on("open", (id) => {
    socket.emit("join-room", ROOM_ID, id);
});
peer.on("call", function (call) {
    getUserMedia(
        { video: true, audio: true },
        function (stream) {
            call.answer(stream);
            const video = document.createElement("video");
            call.on("stream", function (remoteStream) {
                addVideoStream(video, remoteStream);
            });
        },
        function (err) {
            console.log("Cannot get local stream", err);
        }
    );
});

function connectToNewUser(userId, streams) {
    var call = peer.call(userId, streams);
    console.log(call);
    var video = document.createElement("video");
    call.on("stream", (userVideoStream) => {
        console.log(userVideoStream);
        addVideoStream(video, userVideoStream);
    });
    call.on('close', () => {
        video.remove()
    })

    peers[userId] = call
};

const addVideoStream = (videoEl, stream) => {
    videoEl.srcObject = stream;
    videoEl.addEventListener("loadedmetadata", () => {
        videoEl.play();
    });

    videoGrid.append(videoEl);
    let totalUsers = document.getElementsByTagName("video").length;
    if (totalUsers > 1) {
        for (let index = 0; index < totalUsers; index++) {
            document.getElementsByTagName("video")[index].style.width =
                100 / totalUsers + "%";
        }
    }
};
const numerofparti = () => {
    let totalUsers = document.getElementsByTagName("video").length
    alert('Total of ' + totalUsers + ' participants are there in this meeting');
}
const playStop = () => {
    let enabled = myVideoStream.getVideoTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getVideoTracks()[0].enabled = false;
        setPlayVideo();
    } else {
        setStopVideo();
        myVideoStream.getVideoTracks()[0].enabled = true;
    }
};

const muteUnmute = () => {
    const enabled = myVideoStream.getAudioTracks()[0].enabled;
    if (enabled) {
        myVideoStream.getAudioTracks()[0].enabled = false;
        setUnmuteButton();
    } else {
        setMuteButton();
        myVideoStream.getAudioTracks()[0].enabled = true;
    }
};

const setPlayVideo = () => {
    const html = `<i class="unmute fa fa-pause-circle"></i>`;
    document.getElementById("playPauseVideo").innerHTML = html;
};

const setStopVideo = () => {
    const html = `<i class="fas fa-video"></i>`;
    document.getElementById("playPauseVideo").innerHTML = html;
};

const setUnmuteButton = () => {
    const html = `<i class="unmute fa fa-microphone-slash"></i>`;
    document.getElementById("muteButton").innerHTML = html;
};
const setMuteButton = () => {
    const html = `<i class="fa fa-microphone"></i>`;
    document.getElementById("muteButton").innerHTML = html;
};

const sendInvite = () => {
    prompt(
        "Copy the link and send it to person you want to invite to this meeting",
        window.location.href
    );
}

const showHideChat = () => {
    var x = document.getElementById("right");
    var y = document.getElementById("left");
    if (x.style.display === "none") {
        x.style.display = "block";
    } else {
        x.style.display = "none";
        y.style.cssText = ' flex: 1; display: flex; flex - direction: column; background - color: #f5f5f5;'
    }
}


function screenShare() {

    console.log('clicked')
    const video = document.createElement("video");
    try {
        navigator.mediaDevices.getDisplayMedia(displayMediaOptions).then(stream => {
            addVideoStream(myVideo, stream);

            peer.on("call", (call) => {
                call.answer(stream);
                const video = document.createElement("video");
                call.on("stream", (userVideoStream) => {
                    addVideoStream(video, userVideoStream);
                });
            });
            socket.on("user-connected", (userId) => {
                currentId = userId;
                connectToNewUser(userId, stream);
            });
        });

    } catch (err) {
        console.error("Error: " + err);
    }

}