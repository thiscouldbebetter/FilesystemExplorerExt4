
class FileHelper
{
	static destroyClickedElement(event)
	{
		event.target.parentElement.removeChild(event.target);
	}

	static loadFileAsBinaryString(fileToLoad, callback)
	{
		var fileReader = new FileReader();

		fileReader.onloadend = (fileLoadedEvent) =>
		{
			if (fileLoadedEvent.target.readyState == FileReader.DONE)
			{
				var bytesFromFile = fileLoadedEvent.target.result;
			}

			callback(bytesFromFile);
		}
		fileReader.readAsBinaryString(fileToLoad);
	}

	static saveBytesToFile(bytesToSave, filenameToSaveTo)
	{
		var numberOfBytes = bytesToSave.length;
		var bytesAsArrayBuffer = new ArrayBuffer(numberOfBytes);
		var bytesAsUIntArray = new Uint8Array(bytesAsArrayBuffer);
		for (var i = 0; i < numberOfBytes; i++) 
		{
			bytesAsUIntArray[i] = bytesToSave[i];
		}

		var bytesAsBlob = new Blob
		(
			[ bytesAsArrayBuffer ], 
			{type:'application/type'}
		);

		var downloadLink = document.createElement("a");
		var url = (window.webkitURL != null ? window.webkitURL : window.URL);
		downloadLink.href = url.createObjectURL(bytesAsBlob);
		downloadLink.download = filenameToSaveTo;
		downloadLink.click();
	}

	static saveTextAsFile(textToWrite, fileNameToSaveAs)
	{
		var textFileAsBlob = new Blob([textToWrite], {type:'text/plain'});

		var downloadLink = document.createElement("a");
		downloadLink.download = fileNameToSaveAs;
		downloadLink.innerHTML = "Download File";
		if (window.webkitURL != null)
		{
			// Chrome allows the link to be clicked
			// without actually adding it to the DOM.
			downloadLink.href = window.webkitURL.createObjectURL(textFileAsBlob);
		}
		else
		{
			// Firefox requires the link to be added to the DOM
			// before it can be clicked.
			downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
			downloadLink.onclick = FileHelper.destroyClickedElement;
			downloadLink.style.display = "none";
			document.body.appendChild(downloadLink);
		}

		downloadLink.click();
	}
}
