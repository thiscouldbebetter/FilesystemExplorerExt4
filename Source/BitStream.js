
class BitStream
{
	constructor(bytes, seekToEnd)
	{
		this.bytes = bytes;
		this.byteOffset = 0;
		this.bitOffsetWithinByte = 0;

		if (seekToEnd == true)
		{
			this.byteOffset = this.bytes.length;
		}

		this.bitOffsetWithinByteReversed =
			BitStream.BitsPerByte 
			- this.bitOffsetWithinByte
			- 1;
	}

	// constants

	static BitsPerByte = 8;

	// instance methods

	bitOffsetAdvance(numberOfBitsToAdvance)
	{
		var bitsPerByte = BitStream.BitsPerByte;

		var numberOfBytesToAdvance = Math.floor
		(
			numberOfBitsToAdvance / bitsPerByte
		);

		this.byteOffset += numberOfBytesToAdvance;

		this.bitOffsetWithinByte +=
			numberOfBitsToAdvance 
			- (numberOfBytesToAdvance * bitsPerByte);

		if (this.bitOffsetWithinByte >= bitsPerByte)
		{
			this.byteOffset++;
			this.bitOffsetWithinByte -= bitsPerByte;
		}

		this.bitOffsetWithinByteReversed =
			BitStream.BitsPerByte 
			- this.bitOffsetWithinByte
			- 1;
	}

	byteOffsetAdvanceIfNecessary()
	{
		if (this.byteOffset >= this.bytes.length)
		{
			this.bytes.push(0);	
		}
	}

	readBit()
	{
		var byteCurrent = this.bytes[this.byteOffset];
		var bitValue = (byteCurrent >> this.bitOffsetWithinByteReversed) & 1;
		this.bitOffsetAdvance(1);
		return bitValue;
	}

	readByte()
	{
		return this.readBitsAsInteger(BitStream.BitsPerByte);
	}

	readBytes(numberOfBytesToRead)
	{
		var returnValues = [];

		for (var i = 0; i < numberOfBytesToRead; i++)
		{
			returnValues.push(this.readByte());
		}

		return returnValues;
	}

	readFAT12Entry()
	{
		// hack

		var returnValue;

		if (this.bitOffsetWithinByte == 0)
		{
			returnValue = 
				this.bytes[this.byteOffset]
				| ((this.bytes[this.byteOffset + 1] & 0xF) << 8);
		
		}
		else
		{
			returnValue = 
				((this.bytes[this.byteOffset + 1] & 0xF) << 8)
				| (this.bytes[this.byteOffset]);
		}

		this.readInteger(12);

		return returnValue;
	}

	readInteger(numberOfBitsInInteger)
	{
		var returnValue = 0;

		for (var i = 0; i < numberOfBitsInInteger; i++)
		{
			var iReversed = numberOfBitsInInteger - i - 1;
			var bitValue = this.readBit();
			var bitValueInPlace = (bitValue << iReversed);
			returnValue += bitValueInPlace;
		}

		return returnValue;	
	}

	writeBit(bitToWrite)
	{
		this.byteOffsetAdvanceIfNecessary();
		var byteCurrent = this.bytes[this.byteOffset];
		var bitValueInPlace = (bitToWrite << this.bitOffsetWithinByteReversed);
		this.bytes[this.byteOffset] += bitValueInPlace;
		this.bitOffsetAdvance(1);
	}

	writeBits(bitsToWrite)
	{
		for (var i = 0; i < bitsToWrite.length; i++)
		{
			this.writebit(bitsToWrite[i]);
		}
	}

	writeIntegerUsingBitWidth(integerToWrite, numberOfBitsInInteger)
	{
		for (var i = 0; i < numberOfBitsInInteger; i++)
		{
			var iReversed = numberOfBitsInInteger - i - 1;

			//var bitValue = (integerToWrite >>> iReversed) & 1;

			// hack 
			// Can't simply shift right by iReversed
			// for bit widths greater than 32,
			// because (n >>> 32 == n)!

			var temp = integerToWrite;

			for (var j = 0; j < iReversed; j++)
			{
				temp = temp >>> 1;
			}

			var bitValue = temp & 1;

			this.writeBit(bitValue);
		}
	}
}
