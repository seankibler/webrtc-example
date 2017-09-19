var wideAspect = 1.7777777777777777;
var standardAspect = 1.3333333333333333;
var videoEventListener = false;
var currentStream;
var meta = {
  resolution: '?',
  aspectRatio: '?'
};
var defaultConstraints = {
  audio: false,
  video: {
    width: {min: 800, ideal: 1280},
    aspectRatio: {exact: 1.3333}
  }
};

var playCamera = function(video, videoConstraints) {
  var vc = _.extend(defaultConstraints.video, videoConstraints);
  var constraints = _.extend(defaultConstraints, {video: vc});

  document.getElementById('constraints').innerHTML = JSON.stringify(constraints);

  navigator.mediaDevices.getUserMedia(constraints).then(function(stream) {
    currentStream = stream;
    video.srcObject = stream;

    if (!videoEventListener) {
      video.addEventListener('loadedmetadata', function() {
        meta.resolution = video.videoWidth + 'x' + video.videoHeight;

        aspect = video.videoWidth / video.videoHeight;

        if ( aspect == wideAspect) {
          meta.aspectRatio = '16:9' + ' (' + wideAspect + ')';
        }

        if (aspect == standardAspect) {
          meta.aspectRatio = '4:3' + ' (' + standardAspect + ')';
        }

        recordVideoMeta();

        video.play();
      });

      videoEventListener = true;
    }
  }, function(e) {
    console.log(e);
    alert("Unable to use selected camera because it does not meet requirements of constraint: " + e.constraint);
  });
};

var recordVideoMeta = function() {
  var resolution = document.getElementById('video-resolution');
  var aspectRatio = document.getElementById('video-aspect-ratio');
  resolution.innerHTML = meta.resolution;
  aspectRatio.innerHTML = meta.aspectRatio;
};

document.addEventListener('DOMContentLoaded', function() {
  var video = document.getElementById('video-output');
  var cameraOptionsTpl = _.template(document.getElementById('camera-options-template').innerHTML);
  var cameraSelect = document.getElementById('camera-selector');

  cameraSelect.addEventListener('change', function(evt) {
    video.srcObject = null;
    _.each(currentStream.getTracks(), function(track) {
      track.stop();
    });
    playCamera(video, {deviceId: {exact: this.value}});
  });

  navigator.mediaDevices.enumerateDevices().then(function(devices) {
    var videoDevices = _.filter(devices, function(device) {
      return device.kind === 'videoinput';
    });

    cameraSelect.innerHTML = cameraOptionsTpl({devices: videoDevices});
  }, function(e) {
    console.log(e);
  });

  playCamera(video);
});
