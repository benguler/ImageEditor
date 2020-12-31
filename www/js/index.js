var ctx = document.getElementById('canvas').getContext('2d');   //Get canvas context. Canvas is needed to edit images

var filter = new Image();                                       //PNG filter to be drawn over face

var btnCamera = document.getElementById("btnCamera");
var btnUpload = document.getElementById("btnUpload");
var btnProcess = document.getElementById("btnProcess");
var btnSave = document.getElementById("btnSave");

var slctFilter = document.getElementById("filters");

var frmFilter = document.getElementById("frmFilter");

var txtFltrName = document.getElementById("txtFltrName");
var txtFltrLink = document.getElementById("txtFltrLink");

var img = new Image();

var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
        
        ctx.canvas.width = window.screen.width*0.92;                //*0.92 aligns canvas with other elements
        ctx.canvas.height = 10;
        
        btnProcess.disabled = true;
        btnSave.disabled = true;
        
        frmFilter.style.display = "none";
        
        frmFilter.style.width = window.screen.width + "px";
        
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
        
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
        
        btnSave.addEventListener('click', saveImage);   //Can oly save iamges when device is ready
        
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        console.log('Received Event: ' + id);
    }
    
};

//Upload picture from gallery
function uploadPic() {
    var srcType = Camera.PictureSourceType.SAVEDPHOTOALBUM;
    var options = setOptionsImage(srcType);

    navigator.camera.getPicture(function cameraSuccess(imageUri) {

        displayImage(imageUri);
        
        btnProcess.disabled = false;
        btnSave.disabled = false;

    }, function cameraError(error) {
        alert("Error: Unable to obtain picture");
        console.debug("Unable to obtain picture: " + error, "app");

    }, options);
    
}

//Upload picture from camera
function openCamera(selection) {
    var srcType = Camera.PictureSourceType.CAMERA;
    var options = setOptionsImage(srcType);

    navigator.camera.getPicture(function cameraSuccess(imageUri) {

        displayImage(imageUri);
        
        btnProcess.disabled = false;
        btnSave.disabled = false;
        
    }, function cameraError(error) {
        alert("Error: Unable to obtain picture:");
        console.debug("Unable to obtain picture: " + error, "app");

    }, options);
    
}

//Options for uploaded image
function setOptionsImage(srcType) {
    var options = {
        // Some common settings are 20, 50, and 100
        quality: 50,
        destinationType: Camera.DestinationType.FILE_URI,
        // In this app, dynamically set the picture source, Camera or photo gallery
        sourceType: srcType,
        encodingType: Camera.EncodingType.JPEG,
        mediaType: Camera.MediaType.PICTURE,
        allowEdit: true,
        correctOrientation: true  //Corrects Android orientation quirks
    }
    
    return options;
    
}

//Options for uploaded filter
function setOptionsFilter(srcType) {
    var options = {
        // Some common settings are 20, 50, and 100
        quality: 50,
        destinationType: Camera.DestinationType.FILE_URI,
        // In this app, dynamically set the picture source, Camera or photo gallery
        sourceType: srcType,
        encodingType: Camera.EncodingType.PNG,
        mediaType: Camera.MediaType.PICTURE,
        allowEdit: true,
        correctOrientation: true  //Corrects Android orientation quirks
    }
	
    return options;
    
}

//Draw image on canvas
function displayImage(imgUri) {
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);   //Prepare canvas to be drawn on again

    img = new Image();
    img.src = imgUri;
    
    img.onload = function(){                            //Wait till image is loaded to resize it and draw it
        var newDim = resizeImageToScale(img, ctx.canvas.width); //Resize image to canvas width
        ctx.canvas.height = newDim[1];                          //Resize canvas to image height
        
        ctx.drawImage(img, 0, 0, newDim[0], newDim[1]);         //Draw image with new dimensions
        
    }

}

//Save image to device
function saveImage(){
   window.canvas2ImagePlugin.saveImageDataToLibrary(
		function(msg) {
            alert("Success! Image saved to pictures folder");
			console.log(msg);
		},
		function(err) {
            alert("Error! Image not saved")
			console.log(err);
		},
		document.getElementById("canvas"),
		"jpg"
	);
    
}

//Return new dimensions to resize image while maintaing aaspect ratio
function resizeImageToScale(img, scale){
    var newWidth = scale;                               //Width = scale
    var newHeight = img.height * (newWidth/img.width);  //Change height to maintain aspect ratio w/ new width
    
    return {
        0:newWidth,
        1:newHeight
        
    };
    
}

//Open form to add custom filter
function openForm(){
    frmFilter.style.display = "block";
    
    
}

//Create new filter based on linked image
function localFilter(){
    var srcType = Camera.PictureSourceType.SAVEDPHOTOALBUM;
    var options = setOptionsFilter(srcType);

    navigator.camera.getPicture(function cameraSuccess(imageUri) {

        var tmpUri = imageUri;
        
        txtFltrLink.value = tmpUri;

    }, function cameraError(error) {
        alert("Error: Unable to obtain picture");
        console.debug("Unable to obtain picture: " + error, "app");

    }, options);
    
}

//Add custom filter to list of premade filters
function addFilter(){
   var option = document.createElement("option");
    
    var correctEntry = true;
    
    var tstImg = new Image();
    tstImg.src = txtFltrLink.value;
    
    tstImg.onerror = function(){    //If invalid filter link
        correctEntry = false;
        
        alert("Please enter a valid link");
        
    }
    
    if(txtFltrName.value == "" || txtFltrName.value == null){   //If invalid filter name
       correctEntry = false;
        
        alert("Please enter a valid name");
        
    }
    
    tstImg.onload = function(){
        if(correctEntry){                       //If form completed correctly
            option.value = txtFltrLink.value;
            option.text = txtFltrName.value;
            
            slctFilter.add(option, null);       //Add filter to select

            alert("Filter '" + txtFltrName.value + "' added");
            
            //Reset and close form
            txtFltrLink.value = "";
            txtFltrName.value = "";

            frmFilter.style.display = "none";
            
            closeForm();
            
        }
        
    }

}

//Reset and close form
function closeForm(){
    txtFltrLink.value = "";
    txtFltrName.value = "";
    
    frmFilter.style.display = "none";
    
}

/*
    Modified pico code. Function has to be implemented directy. Not in Library
*/

var facefinder_classify_region = function(r, c, s, pixels, ldim) {return -1.0;};

//Get data provided by pico library
var cascadeurl = 'https://raw.githubusercontent.com/nenadmarkus/pico/c2e81f9d23cc11d1a612fd21e4f9de0921a5d0d9/rnt/cascades/facefinder';

fetch(cascadeurl).then(function(response) {
    response.arrayBuffer().then(function(buffer) {
        var bytes = new Int8Array(buffer);
        facefinder_classify_region = pico.unpack_cascade(bytes);
        console.log('* cascade loaded');
    })
    
})

//prepare the image and canvas context

//a function to transform an RGBA image to grayscale

function rgba_to_grayscale(rgba, nrows, ncols) {
    var gray = new Uint8Array(nrows*ncols);
    for(var r=0; r<nrows; ++r)
        for(var c=0; c<ncols; ++c){
            // gray = 0.2*red + 0.7*green + 0.1*blue
            gray[r*ncols + c] = (2*rgba[r*4*ncols+4*c+0]+7*rgba[r*4*ncols+4*c+1]+1*rgba[r*4*ncols+4*c+2])/10;
            
        }
            
    return gray;
}

//Detect faces in image and draw filter over them
function processImage() {
    //Redraw fresh image (no filter) on canvas
    ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
    
    if(slctFilter[slctFilter.selectedIndex].value != "NONE"){       //If a filter was selected
        filter.src = slctFilter[slctFilter.selectedIndex].value;
        
        //Wait for filter to load
        filter.onload = function(){
            var rgba = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height).data;
            // prepare input to `run_cascade`
            image = {
                "pixels": rgba_to_grayscale(rgba, ctx.canvas.height, ctx.canvas.width),
                "nrows": ctx.canvas.height,
                "ncols": ctx.canvas.width,
                "ldim": ctx.canvas.width
            }
            params = {
                "shiftfactor": 0.1, // move the detection window by 10% of its size
                "minsize": 50,      // minimum size of a face (not suitable for real-time detection, set it to 100 in that case)
                "maxsize": 1000,    // maximum size of a face
                "scalefactor": 1.1  // for multiscale processing: resize the detection window by 10% when moving to the higher scale
            }

            // run the cascade over the image
            // dets is an array that contains (r, c, s, q) quadruplets
            // (representing row, column, scale and detection score)
            dets = pico.run_cascade(image, facefinder_classify_region, params);
            // cluster the obtained detections
            dets = pico.cluster_detections(dets, 0.2); // set IoU threshold to 0.2
            // draw results
            qthresh = 5.0 // this constant is empirical: other cascades might require a different one
			//dets.length == number of detected faces
            for(i=0; i<dets.length; ++i){
                // check the detection score
                // if it's above the threshold, draw it
                if(dets[i][3]>qthresh)
                {
                    /*
                    des[i][1] = x position of face
                    des[i][0] = y position of face
                    des[i][2] = scale (width of face)
                    des[i][3] = detection score

                    */

                    var newDim = resizeImageToScale(filter, dets[i][2]);

                    ctx.drawImage(filter, dets[i][1]-newDim[0]/2, dets[i][0]-newDim[1]/2, newDim[0], newDim[1]);    //Draw filter over center of face
                    
                }
                
            }
            
        }
        
    }
    
}