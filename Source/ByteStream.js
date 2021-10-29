
class ByteStream
{
	constructor(bytes)
	{
		this.bytes = bytes;
		this.byteIndexCurrent = 0;
	}

	hasMoreBytes()
	{
		return (this.byteIndexCurrent < this.bytes.length);
	}

	readByte()
	{
		var returnValue = this.bytes[this.byteIndexCurrent];
		this.byteIndexCurrent++;
		return returnValue;
	}

	readBytes(numberOfBytesToRead)
	{
		var returnValues = [];

		for (var i = 0; i < numberOfBytesToRead; i++)
		{
			var byte = this.readByte();
			returnValues.push(byte);
		}

		return returnValues;
	}

	readIntegerLE(numberOfBytesToRead)
	{
		// little-endian

		var returnValue = 0;

		for (var i = 0; i < numberOfBytesToRead; i++)
		{
			var byte = this.readByte();
			returnValue |= (byte << (i * 8));
		}

		return returnValue;
	}

	readString(lengthOfString)
	{
		var returnValue = "";

		var bytes = this.readBytes(lengthOfString);

		for (var i = 0; i < bytes.length; i++)
		{
			var byte = bytes[i];
			returnValue += String.fromCharCode(byte);	
		}

		return returnValue;
	}
}
