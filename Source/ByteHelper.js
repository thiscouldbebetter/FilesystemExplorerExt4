
class ByteHelper
{
	static binaryStringToBytes(binaryString)
	{
		var returnValues = [];

		for (var i = 0; i < binaryString.length; i++)
		{
			var byteValue = binaryString.charCodeAt(i);
			returnValues.push(byteValue);
		}

		return returnValues;
	}
}
