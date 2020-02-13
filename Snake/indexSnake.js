let net;
const webcamElement = document.getElementById('webcam');
const classifier = knnClassifier.create();

var classCount = 0;
async function app() {
  classCount++;
  console.log('Loading mobilenet..');

  // Load the model.
  net = await mobilenet.load();
  console.log('Sucessfully loaded model');

  await setupWebcam();

  // Reads an image from the webcam and associates it with a specific class
  // index.
  const addExample = classId => {
    // Get the intermediate activation of MobileNet 'conv_preds' and pass that
    // to the KNN classifier.
    const activation = net.infer(webcamElement, 'conv_preds');

    // Pass the intermediate activation to the classifier.
    classifier.addExample(activation, classId);
  };

  // When clicking a button, add an example for that class.
  document.getElementById('class-a').addEventListener('click', () => addExample(0));
  document.getElementById('class-b').addEventListener('click', () => addExample(1));
  document.getElementById('class-c').addEventListener('click', () => addExample(2));
  
  document.getElementById('class-d').addEventListener('click', () => addExample(3));

  while (true) {
    if (classifier.getNumClasses() > 0) {
      // Get the activation from mobilenet from the webcam.
      const activation = net.infer(webcamElement, 'conv_preds');
      // Get the most likely class and confidences from the classifier module.
      const result = await classifier.predictClass(activation);

      const classes = ['Right', 'Up', 'Left', 'Down'];
	  var RightP = result.confidences[0]*100;
	  var UpP = result.confidences[1]*100;
	  var LeftP = result.confidences[2]*100;
	  var DownP = result.confidences[3]*100;
	  if (result.classIndex === 0 && snake.dx === 0){
		snake.dx = grid;
		snake.dy = 0;
	  }
	  else if (result.classIndex === 1 && snake.dy === 0){
		snake.dy = -grid;
		snake.dx = 0;
	  }
	  else if (result.classIndex === 2 && snake.dx === 0){
    snake.dx = -grid;
    snake.dy = 0;
	  }
	  else if (result.classIndex === 3 && snake.dy === 0){
		snake.dy = grid;
		snake.dx = 0;
	  }
	  
	  
      document.getElementById('console').innerHTML = `
	  <table border="0" width="1000px" cellpadding = "0" cellspacing="0">
	  <tr>
		<td width="40%">Right</td> 
		<td width="60%">
		  <table border = "0" width = "100%" cellpadding = "1" cellspacing="1">
			<tr>
			  <td align="left" bgcolor="blue" width=${RightP}%> </td>
			  <td align="left">${RightP}</td>
			</tr>
		  </table>
		</td>
	  </tr>
	  <tr>
		<td width="40%">Up</td> 
		<td width="60%">
		  <table border = "0" width = "100%" cellpadding = "1" cellspacing="1">
			<tr>
			  <td align="left" bgcolor="blue" width=${UpP}%> </td>
			  <td align="left">${UpP}</td>
			</tr>
		  </table>
		</td>
	  </tr>
	  <tr>
		<td width="40%">Left</td> 
		<td width="60%">
		  <table border = "0" width = "100%" cellpadding = "1" cellspacing="1">
			<tr>
			  <td align="left" bgcolor="blue" width=${LeftP}%> </td>
			  <td align="left">${LeftP}</td>
			</tr>
		  </table>
		</td>
	  </tr>
	  <tr>
		<td width="40%">Down</td> 
		<td width="60%">
		  <table border = "0" width = "100%" cellpadding = "1" cellspacing="1">
			<tr>
			  <td align="left" bgcolor="blue" width=${DownP}%> </td>
			  <td align="left">${DownP}</td>
			</tr>
		  </table>
		</td>
	  </tr>
	</table>
	  \n\n
        It is a ${classes[result.classIndex]}
      `;
    }

    await tf.nextFrame();
  }
}

async function setupWebcam() {
  return new Promise((resolve, reject) => {
    const navigatorAny = navigator;
    navigator.getUserMedia = navigator.getUserMedia ||
        navigatorAny.webkitGetUserMedia || navigatorAny.mozGetUserMedia ||
        navigatorAny.msGetUserMedia;
        
    if (navigator.getUserMedia) {
      navigator.getUserMedia({video: true},
        stream => {
          webcamElement.srcObject = stream;
          webcamElement.addEventListener('loadeddata',  () => resolve(), false);
        },
        error => reject());
    } else {
      reject();
    }
  });
}

app();
