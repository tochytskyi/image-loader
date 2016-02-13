// class for files that should be uploded
var File = function(file) {
	this.file = file || null;
	this.reviewed = true;
	this.preview = null;
	this.progressBar = null;
};

// read image and make preview
function readImage(file, callback) {
	var deferred = $.Deferred();
	if (typeof FileReader !== "undefined") {
	    var reader = new FileReader();
	    reader.onload = function(event) {
	    	callback(event.target.result, file);
	        deferred.resolve(event.target.result);
	    };
	    reader.onerror = function() {
	        deferred.reject(this);
	    };
	    reader.readAsDataURL(file);
	    return deferred.promise();
	} else {
		//browser doesn't support FileReader
		var deferred = $.Deferred();
		callback('', file);
	    deferred.resolve();
	    return deferred.promise();
	}
};

jQuery(document).ready(function() {
	var form = jQuery('#image-upload-form');
	var input = jQuery('#image-upload-input');
	var previewBlock = jQuery('#image-upload-preview');
	var previewTemplate = jQuery('#image-upload-preview .thumb');
	var selectBtn = jQuery('#image-upload-select-btn');
	var uploadBtn = jQuery('#image-upload-btn');
	var resetBtn = jQuery('#image-reset-btn');
	var blockModal= jQuery('#blockModal');
	var files = [];
	uploadBtn.hide();
	resetBtn.hide();

	input.change(function() {		
		resetPreview(previewBlock);
	    if (!this.files || !this.files.length) {
	    	uploadBtn.hide();	    	
	    	return false;
	    } else {
	    	blockModal.modal('show');
	    	var promises = [];
	    	for (var i = 0, file; file = this.files[i]; i++) {
	    		if (!file.type.match('image.*')) {
		        	console.log('Unsupported image extension');
		            continue;
		        }
		        
		        var previewPromise = readImage(file, function (src, fileToUpload) {	
		        	//generate preview with progress bar
		        	var image = previewTemplate.clone();         	
		        	image.find('img').first().attr('src', src);
		        	image.addClass('reviewed');
		        	image.show();
		        	previewBlock.append(image);	
		        	bindRotationEvent(image);

		        	// save file for uploading later	
		        	var toUpload = new File(fileToUpload);
		        	toUpload.reviewed = src !== '';
		        	toUpload.preview = image;
		        	toUpload.progressBar = image.find('progress');
		        	files.push(toUpload);				      	
		        });
		        promises.push(previewPromise);   	        	        
	    	};	

	    	//show handle buttons when all previews created
	    	Promise.all(promises).then(function(values) {
		        uploadBtn.show();
    			resetBtn.show();
    			blockModal.modal('hide');
		    }).catch(function(exeption) {
        		console.warn(exeption);
	        });	    	
	    };
	});

	//trigger uploading files to the server
	uploadBtn.click(function() {	
		if (files.length < 1) {
			alert('No images selected');
			return false;
		}			
		for (var i = 0; i < files.length ; i++) {
			var fileInfo = files[i];
			var rotation = fileInfo.preview.find('img').attr('data-rotate');
			uploadFile(fileInfo, rotation);
		}
		jQuery(this).hide();
	});
	

	//send a single file via AJAX to the server and save it 
	function uploadFile(fileInfo, rotation) {
		var formData = new FormData();
		formData.append('image', fileInfo.file);
	    formData.append('rotation', rotation);
	    var progressBar = fileInfo.progressBar;
		jQuery.ajax({
	        type: 'post',
	        dataType: 'json',
	        url: 'server/save-image.php',
	        data: formData,
	        cache: false,
	        contentType: false,
	        processData: false,
	        //handler for updating progress bar
	        xhr: function() {
				var xhr = new window.XMLHttpRequest();
				xhr.upload.addEventListener("progress", function(evt){
				  if (evt.lengthComputable && progressBar) {
				    var percentComplete = evt.loaded / evt.total;
				    progressBar.attr('value', percentComplete * 100);
				    if (percentComplete === 1) {
				    	progressBar.slideUp(2000, function(){
				    		progressBar.attr('value', 0);
				    	});				    	
				    }
				  } 
				}, false);
				return xhr;
			},
	        success: function(data) {
	        	if (data.error && data.error === true) {
	        		console.log(`${data.name} can not be uploaded`);
	        	} else {
	        		//set image preview if it doesn't exist yet
	        		if (!fileInfo.reviewed) {
	        			fileInfo.preview.find('img').attr('src', data.url);
	        		}
		        	console.log(`${data.name} uploaded successfully`);
		        }
	        },
	        error: function(request, status, error) {
	            console.log("Error has occurred when loading your image: " + request.responseText);
	        },
	        complete: function(request, status) {
	        	//possible clear extra data here
	        }
	    }); 
	};

	//clear previews, form, and reset handle buttons
	function resetAll() {
		form[0].reset();
		uploadBtn.hide();
	    resetBtn.hide();
	    resetPreview(previewBlock);
	    blockModal.modal('hide');
	    files = [];
	};

	resetBtn.click(resetAll);

	//bind rotation event on mousedown&hold to left/right arrows
	function bindRotationEvent(image){
		var timeoutIdLeft = 0;
		var timeoutIdRight = 0;

		image.find('.glyphicon-arrow-left').bind('mousedown', function() {
		    timeoutIdLeft = setInterval(function(e) {
				image.find('img').rotate('left');
			}, 50);
		}).bind('mouseup mouseleave', function() {
		    clearTimeout(timeoutIdLeft);
		});  

		image.find('.glyphicon-arrow-right').bind('mousedown', function() {
		    timeoutIdRight = setInterval(function(e) {
				image.find('img').rotate('right');
			}, 50);
		}).bind('mouseup mouseleave', function() {
		    clearTimeout(timeoutIdRight);
		});         		  
	};

	// remove all previews
	function resetPreview(previewBlock) {
		previewBlock.find('.thumb.reviewed').each(function(index, value) {
			jQuery(this).remove();
		});
	};
});


/***
	simple jQuery extension for rotating images via css
	degree value will be saved to 'data-rotation' attribute of an image
*/
jQuery.fn.rotate = function(direction) {
	var target = jQuery(this);
	var degrees = parseFloat(target.attr('data-rotate'));
	if (direction === 'left') {
		degrees -= 2;
	} else {
		degrees += 2;
	};
    target.css({
    	'-webkit-transform' : 'rotate('+ degrees +'deg)',
        '-moz-transform' : 'rotate('+ degrees +'deg)',
        '-ms-transform' : 'rotate('+ degrees +'deg)',
        'transform' : 'rotate('+ degrees +'deg)'
    });
    target.attr('data-rotate', degrees);
};

