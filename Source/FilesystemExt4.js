
class FilesystemExt4
{
	constructor
	(
		superblock,
		blockGroupDescriptors,
		directoryRoot
	)
	{
		this.superblock = superblock;
		this.blockGroupDescriptors = blockGroupDescriptors;
		this.directoryRoot = directoryRoot;

		this.directoryCurrent = this.directoryRoot;
	}

	// static methods

	static fromBytes(filesystemAsBytes)
	{
		// Based on descriptions of the Ext family of filesystems
		// found at the links listed in the Documentation directory,
		// especially https://wiki.osdev.org/Ext2.

		var bs = new ByteStream(filesystemAsBytes);

		var superblockOffsetInBytes = 1024;
		var superblockSizeInBytes = 1024;

		var bytesBeforeSuperblock =
			bs.readBytes(superblockOffsetInBytes);

		var superblock =
			FilesystemExt4Superblock.readFromByteStream(bs);

		var blockGroupDescriptors = [];

		var blockCount = superblock.blockCount;
		var blocksPerBlockGroup = superblock.blocksPerBlockGroup;
		var blockGroupCount = blockCount / blocksPerBlockGroup;

		for (var i = 0; i < blockGroupCount; i++)
		{
			var blockGroupDescriptor =
				FilesystemExt4BlockGroupDescriptor.readFromByteStream(bs);

			blockGroupDescriptors.push(blockGroupDescriptor);
		}

		var directoryRoot = null; // todo

		var returnValue = new FilesystemExt4
		(
			superblock,
			blockGroupDescriptors,
			directoryRoot
		);

		return returnValue;	
	}

	// instance methods

	// dom

	domElementUpdate()
	{
		if (this.domElement == null)
		{
			this.domElement = document.createElement("div");
		}

		this.domElement.innerHTML = "";

		/*
		this.domElement.appendChild
		(
			this.directoryCurrent.domElementUpdate()
		);
		*/

		var thisAsJson = this.toStringJson();
		this.domElement.innerHTML = thisAsJson;

		return this.domElement;
	}

	// string

	toStringJson()
	{
		var filesystemAsJson = JSON.stringify(this, null, 4);
		filesystemAsJson =
			filesystemAsJson.split("\n").join("<br />");
		filesystemAsJson =
			filesystemAsJson.split("    ").join("&nbsp;&nbsp;&nbsp;&nbsp;");
		return filesystemAsJson;
	}
}

class FilesystemExt4BlockGroupDescriptor
{
	constructor
	(
		blockAddressOfBlockUsageBitmap,
		blockAddressOfInodeUsageBitmap,
		startingBlockAddressOfInodeTable,
		numberOfUnallocatedBlocksInGroup,
		numberOfUnallocatedInodesInGroup,
		numberOfDirectoriesInGroup,
		unusedBytes
	)
	{
		this.blockAddressOfBlockUsageBitmap = blockAddressOfBlockUsageBitmap;
		this.blockAddressOfInodeUsageBitmap = blockAddressOfInodeUsageBitmap;
		this.startingBlockAddressOfInodeTable = startingBlockAddressOfInodeTable;
		this.numberOfUnallocatedBlocksInGroup = numberOfUnallocatedBlocksInGroup;
		this.numberOfUnallocatedInodesInGroup = numberOfUnallocatedInodesInGroup;
		this.numberOfDirectoriesInGroup = numberOfDirectoriesInGroup;
		this.unusedBytes = unusedBytes;
	}

	static readFromByteStream(byteStream)
	{
		var bs = byteStream;

		var descriptorOffset = bs.byteIndexCurrent;

		var blockAddressOfBlockUsageBitmap = bs.readIntegerLE(4);
		var blockAddressOfInodeUsageBitmap = bs.readIntegerLE(4);
		var startingBlockAddressOfInodeTable = bs.readIntegerLE(4);
		var numberOfUnallocatedBlocksInGroup = bs.readIntegerLE(2);
		var numberOfUnallocatedInodesInGroup = bs.readIntegerLE(2);
		var numberOfDirectoriesInGroup = bs.readIntegerLE(2);

		var bytesReadForDescriptor =
			bs.byteIndexCurrent - descriptorOffset;

		var descriptorSizeInBytes = 32;
		var numberOfUnusedBytes =
			descriptorSizeInBytes - bytesReadForDescriptor;
		var unusedBytes = bs.readBytes();

		var blockGroupDescriptor = new FilesystemExt4BlockGroupDescriptor
		(
			blockAddressOfBlockUsageBitmap,
			blockAddressOfInodeUsageBitmap,
			startingBlockAddressOfInodeTable,
			numberOfUnallocatedBlocksInGroup,
			numberOfUnallocatedInodesInGroup,
			numberOfDirectoriesInGroup,
			unusedBytes
		);

		return blockGroupDescriptor;
	}
}

class FilesystemExt4Inode
{
	constructor
	(
		typeCode,
		permissionsAsBitString,
		userId,
		sizeInBytes,
		lastAccessedAtTime,
		createdAtTime,
		lastModifiedAtTime,
		deletedAtTime,
		groupId,
		directoryEntryCount,
		diskSectorsUsedForPayloadCount,
		flags,
		operatingSystemSpecificValue1,
		directBlockPointers,
		singlyIndirectBlockPointer,
		doublyIndirectBlockPointer,
		triplyIndirectBlockPointer,
		generationNumber,
		fileAccessControlList,
		directoryAccessControlList,
		blockAddressOfFragment,
		fragmentNumber,
		fragmentSize,
		reserved1,
		high16BitsOfUserId,
		high16BitsOfGroupId,
		reserved2
	)
	{
		this.typeCode = typeCode;
		this.permissionsAsBitString = permissionsAsBitString;
		this.userId = userId;
		this.sizeInBytes = sizeInBytes;
		this.lastAccessedAtTime = lastAccessedAtTime;
		this.createdAtTime = createdAtTime;
		this.lastModifiedAtTime = lastModifiedAtTime;
		this.deletedAtTime = deletedAtTime;
		this.groupId = groupId;
		this.directoryEntryCount = directoryEntryCount; // "hard links"
		this.diskSectorsUsedForPayloadCount = diskSectorsUsedForPayloadCount;
		this.flags = flags;
		this.operatingSystemSpecificValue1 = operatingSystemSpecificValue1;
		this.directBlockPointers = directBlockPointers;
		this.singlyIndirectBlockPointer = singlyIndirectBlockPointer; // Points to block that is list of block pointers.
		this.doublyIndirectBlockPointer = doublyIndirectBlockPointer; // Points to block that is list of block pointers to Singly Indirect Blocks.
		this.triplyIndirectBlockPointer = triplyIndirectBlockPointer; // Etc.
		this.generationNumber = generationNumber; // For NFS.
		this.fileAccessControlList = fileAccessControlList;
		this.directoryAccessControlList = directoryAccessControlList;
		this.blockAddressOfFragment = blockAddressOfFragment;
		this.operatingSystemSpecificValue2 = operatingSystemSpecificValue2;
	}

	static readFromByteStream(byteStream)
	{
		var bs = byteStream;

		var typeAndPermissionsAsInteger = bs.readIntegerLE(2);
		var typeCode = typeAndPermissionsAsInteger >> 12;
		// 1 - FIFO
		// 2 - character device
		// 4 - directory
		// 6 - block device
		// 8 - regular file
		// 10 - symbolic link
		// 12 - Unix socket

		var permissionsAsInteger = typeAndPermissionsAsInteger & 0xFFF;
		var permissionsAsBitString = permissionsAsInteger.toString(2);
		// Permissions bits are:
		// execute, read, write for each of other, group, user
		// Then "sticky bit", set group ID, set user ID.

		var userId = bs.readIntegerLE(2);
		var sizeInBytesLower32Bits = bs.readIntegerLE(4);

		var lastAccessedAtSecondsSinceUnixEpoch = bs.readIntegerLE(4);
		var lastAccessedAtTime =
			new Date(lastAccessedAtSecondsSinceUnixEpoch * 1000);

		var createdAtSecondsSinceUnixEpoch = bs.readIntegerLE(4);
		var createdAtTime =
			new Date(createdAtSecondsSinceUnixEpoch * 1000);

		var lastModifiedAtSecondsSinceUnixEpoch = bs.readIntegerLE(4);
		var lastModifiedAtTime =
			new Date(lastModifiedAtSecondsSinceUnixEpoch * 1000);

		var deletedAtSecondsSinceUnixEpoch = bs.readIntegerLE(4);
		var deletedAtTime =
			new Date(deletedAtSecondsSinceUnixEpoch * 1000);

		var groupId = bs.readIntegerLE(2);
		var directoryEntryCount = bs.readIntegerLE(2);
		var diskSectorsUsedForPayloadCount = bs.readIntegerLE(4);

		var flags = bs.readIntegerLE(4);
		// 1 - secure deletion (not used)
		// 2 - keep a copy of data when deleted (not used)
		// 4 - file compression (not used)
		// 8 - synchronous updates: New data written to disk immediately.
		// 16 - immutable file
		// 32 - append only
		// 64 - file not included in "dump" command
		// 128 - last accessed time should not be updated
		// (some reserved bits)
		// 0x10000 - hash indexed directory
		// 0x20000 - AFS directory
		// 0x40000 - journal file data

		var operatingSystemSpecificValue1 = bs.readIntegerLE(4);
		// Only used in HURD.

		var directBlockPointers = [];
		var directBlockPointerCount = 12;
		for (var i = 0; i < directBlockPointerCount; i++)
		{
			var directBlockPointer = bs.readIntegerLE(2);
			directBlockPointers.push(directBlockPointer);
		}

		var singlyIndirectBlockPointer = bs.readIntegerLE(4);
		var doublyIndirectBlockPointer = bs.readIntegerLE(4);
		var triplyIndirectBlockPointer = bs.readIntegerLE(4);
		var generationNumber = bs.readIntegerLE(4);
		var fileAccessControlList = bs.readIntegerLE(4);
		var directoryAccessControlList = bs.readIntegerLE(4);
		var blockAddressOfFragment = bs.readIntegerLE(4);

		// Assuming Linux for these OS-specific values.
		var fragmentNumber = bs.readByte();
		var fragmentSize = bs.readByte();
		var reserved1 = bs.readByte();
		var high16BitsOfUserId = bs.readIntegerLE(2);
		var high16BitsOfGroupId = bs.readIntegerLE(2);
		var reserved2 = bs.readByte();
	}
}

class FilesystemExt4Superblock
{
	constructor
	(
		inodeCount,
		blockCount,
		blocksReservedForSuperuserCount,
		blocksUnallocatedCount,
		inodesUnallocatedCount,
		blockNumberOfBlockContainingSuperblock,
		bytesPerBlock,
		log2FragmentSizeMinus10,
		blocksPerBlockGroup,
		fragmentsPerBlockGroup,
		inodesPerBlockGroup,
		lastMountedTime,
		lastWrittenTime,
		mountsSinceLastConsistencyCheck,
		mountsAllowedBeforeNextConsistencyCheck,
		ext4SignatureAsHexadecimalEF53,
		filesystemStateCode,
		errorHandlingMethodCode,
		versionNubmerMinor,
		consistencyLastCheckedTime,
		secondsBetweenForcedConsistencyChecks,
		operatingSystemId,
		versionNumberMajor,
		userForWhomReservedBlocksAreReservedId,
		groupForWhomReservedBlocksAreReservedId,
		firstNonReservedInode,
		bytesPerInode,
		blockGroupSuperblockIsPartOf,
		featureFlagsNotRequiredToReadOrWriteAsBitString,
		featureFlagsRequiredToReadOrWriteAsBitString,
		featureFlagsRequiredForReadOnlyAsBitString,
		filesystemIdAsHexadecimal,
		volumeName,
		pathVolumeLastMountedTo,
		compressionAlgorithmsUsed,
		blockCountToPreallocateForFiles,
		blockCountToPreallocateForDirectories,
		unused,
		journalIdAsHexadecimal,
		journalInode,
		journalDevice,
		headOfOrphanInodeList,
		bytesRemainingAsHexadecimal
	)
	{
		this.inodeCount = inodeCount;
		this.blockCount = blockCount;
		this.blocksReservedForSuperuserCount = blocksReservedForSuperuserCount;
		this.blocksUnallocatedCount = blocksUnallocatedCount;
		this.inodesUnallocatedCount = inodesUnallocatedCount;
		this.blockNumberOfBlockContainingSuperblock = blockNumberOfBlockContainingSuperblock;
		this.bytesPerBlock = bytesPerBlock;
		this.log2FragmentSizeMinus10 = log2FragmentSizeMinus10;
		this.blocksPerBlockGroup = blocksPerBlockGroup;
		this.fragmentsPerBlockGroup = fragmentsPerBlockGroup;
		this.inodesPerBlockGroup = inodesPerBlockGroup;
		this.lastMountedTime = lastMountedTime;
		this.lastWrittenTime = lastWrittenTime;
		this.mountsSinceLastConsistencyCheck = mountsSinceLastConsistencyCheck;
		this.mountsAllowedBeforeNextConsistencyCheck = mountsAllowedBeforeNextConsistencyCheck;
		this.ext4SignatureAsHexadecimalEF53 = ext4SignatureAsHexadecimalEF53;
		this.filesystemStateCode = filesystemStateCode;
		this.errorHandlingMethodCode = errorHandlingMethodCode;
		this.versionNubmerMinor = versionNubmerMinor;
		this.consistencyLastCheckedTime = consistencyLastCheckedTime;
		this.secondsBetweenForcedConsistencyChecks = secondsBetweenForcedConsistencyChecks;
		this.operatingSystemId = operatingSystemId;
		this.versionNumberMajor = versionNumberMajor;
		this.userForWhomReservedBlocksAreReservedId = userForWhomReservedBlocksAreReservedId;
		this.groupForWhomReservedBlocksAreReservedId = groupForWhomReservedBlocksAreReservedId;
		this.firstNonReservedInode = firstNonReservedInode;
		this.bytesPerInode = bytesPerInode;
		this.blockGroupSuperblockIsPartOf = blockGroupSuperblockIsPartOf;
		this.featureFlagsNotRequiredToReadOrWriteAsBitString = featureFlagsNotRequiredToReadOrWriteAsBitString;
		this.featureFlagsRequiredToReadOrWriteAsBitString = featureFlagsRequiredToReadOrWriteAsBitString;
		this.featureFlagsRequiredForReadOnlyAsBitString = featureFlagsRequiredForReadOnlyAsBitString;
		this.filesystemIdAsHexadecimal = filesystemIdAsHexadecimal;
		this.volumeName = volumeName;
		this.pathVolumeLastMountedTo = pathVolumeLastMountedTo;
		this.compressionAlgorithmsUsed = compressionAlgorithmsUsed;
		this.blockCountToPreallocateForFiles = blockCountToPreallocateForFiles;
		this.blockCountToPreallocateForDirectories = blockCountToPreallocateForDirectories;
		this.unused = unused;
		this.journalIdAsHexadecimal = journalIdAsHexadecimal;
		this.journalInode = journalInode;
		this.journalDevice = journalDevice;
		this.headOfOrphanInodeList = headOfOrphanInodeList;
		this.bytesRemainingAsHexadecimal = bytesRemainingAsHexadecimal;
	}

	static readFromByteStream(byteStream)
	{
		var bs = byteStream;

		var superblockOffsetInBytes = bs.byteIndexCurrent;

		var inodeCount = bs.readIntegerLE(4);
		var blockCount = bs.readIntegerLE(4);
		var blocksReservedForSuperuserCount = bs.readIntegerLE(4);
		var blocksUnallocatedCount = bs.readIntegerLE(4);
		var inodesUnallocatedCount = bs.readIntegerLE(4);
		var blockNumberOfBlockContainingSuperblock = bs.readIntegerLE(4);

		var log2BlockSizeMinus10 = bs.readIntegerLE(4);
		var bytesPerBlock = Math.pow(2, log2BlockSizeMinus10 + 10);

		var log2FragmentSizeMinus10 = bs.readIntegerLE(4);
		var blocksPerBlockGroup = bs.readIntegerLE(4);
		var fragmentsPerBlockGroup = bs.readIntegerLE(4);
		var inodesPerBlockGroup = bs.readIntegerLE(4);

		// The Unix Epoch is the start of January 1, 1970, UTC.
		var lastMountedAtSecondsSinceUnixEpoch = bs.readIntegerLE(4);
		var lastMountedTime =
			new Date(lastMountedAtSecondsSinceUnixEpoch * 1000);

		var lastWrittenAtSecondsSinceUnixEpoch = bs.readIntegerLE(4);
		var lastWrittenTime =
			new Date(lastWrittenAtSecondsSinceUnixEpoch * 1000);

		// The consistency check is done by running the "fsck" command.
		var mountsSinceLastConsistencyCheck = bs.readIntegerLE(2);
		var mountsAllowedBeforeNextConsistencyCheck = bs.readIntegerLE(2);

		var ext4SignatureAsHexadecimalEF53 =
			bs.readIntegerLE(2).toString(16);

		// 1 = clean, 2 = errors.
		var filesystemStateCode = bs.readIntegerLE(2);

		// 1 = ignore
		// 2 = remount as read-only
		// 3 - kernel panic
		var errorHandlingMethodCode = bs.readIntegerLE(2);

		var versionNubmerMinor = bs.readIntegerLE(2);

		var consistencyLastCheckedAtSecondsSinceUnixEpoch = bs.readIntegerLE(4);
		var consistencyLastCheckedTime =
			new Date(consistencyLastCheckedAtSecondsSinceUnixEpoch * 1000);

		var secondsBetweenForcedConsistencyChecks = bs.readIntegerLE(4);

		// Operating system IDs:
		// 0 = Linux, 1 - GNU HURD.
		// 2 - MASIX.
		// 3 - FreeBSD.
		// 4 - BSD 4.4-Lite derivatives.
		var operatingSystemId = bs.readIntegerLE(4);

		var versionNumberMajor = bs.readIntegerLE(4);

		var userForWhomReservedBlocksAreReservedId = bs.readIntegerLE(2);
		var groupForWhomReservedBlocksAreReservedId = bs.readIntegerLE(2);

		if (versionNumberMajor < 1)
		{
			throw new Error("Versions earlier than 1 are not yet supported.");
		}
		else
		{
			var firstNonReservedInode = bs.readIntegerLE(4);
			var bytesPerInode = bs.readIntegerLE(2);
			var blockGroupSuperblockIsPartOf = bs.readIntegerLE(2);

			// Optional feature flags:
			// 1 << 0 - Preallocate blocks to directory when creating new one.
			// 1 << 1 - AFS server inodes exist.
			// 1 << 2 - Has a journal (Ext3).
			// 1 << 3 - Inodes have extended attributes.
			// 1 << 4 - Can resize for larger partitions.
			// 1 << 5 - Directories use hash index.
			var featureFlagsNotRequiredToReadOrWriteAsBitString =
				bs.readIntegerLE(4).toString(2);

			// 1 << 0 - Compression is used.
			// 1 << 1 - Directory entries contain a type field.
			// 1 << 2 - Filesystem needs to replay its journal.
			// 1 << 3 - Filesystem uses a journal device.
			var featureFlagsRequiredToReadOrWriteAsBitString =
				bs.readIntegerLE(4).toString(2);

			// 1 << 0 - Sparse superblocks and group descriptor tables.
			// 1 << 1 - Filesystem uses 64-bit file size.
			// 1 << 2 - Directory contents stored as binary tree.
			var featureFlagsRequiredForReadOnlyAsBitString =
				bs.readIntegerLE(4).toString(2);

			var filesystemIdAsBytes = bs.readBytes(16); // Output by "blkid".
			var filesystemIdAsHexadecimal = filesystemIdAsBytes.map
			(
				x => x.toString(16).padStart(2, "0")
			).join("");

			var volumeName = bs.readString(16);
			var pathVolumeLastMountedTo = bs.readString(64);
			var compressionAlgorithmsUsed = bs.readBytes(4);
			var blockCountToPreallocateForFiles = bs.readByte();
			var blockCountToPreallocateForDirectories = bs.readByte();

			var unused = bs.readIntegerLE(2);

			var journalIdAsBytes = bs.readBytes(16); // Same style as filesystemId.
			var journalIdAsHexadecimal = journalIdAsBytes.map
			(
				x => x.toString(16).padStart(2, "0")
			).join("");

			var journalInode = bs.readIntegerLE(4);
			var journalDevice = bs.readIntegerLE(4);
			var headOfOrphanInodeList = bs.readIntegerLE(4);

			// The rest of the superblock's 1024 bytes are unused.
		}

		var bytesReadForSuperblock =
			bs.byteIndexCurrent - superblockOffsetInBytes;
		var bytesRemainingCount =
			bytesPerBlock - bytesReadForSuperblock;
		var bytesRemaining = bs.readBytes(bytesRemainingCount);
		var bytesRemainingAsHexadecimal = bytesRemaining.map
		(
			x => x.toString(16).padStart(2, "0")
		).join(" ");

		var superblock = new FilesystemExt4Superblock
		(
			inodeCount,
			blockCount,
			blocksReservedForSuperuserCount,
			blocksUnallocatedCount,
			inodesUnallocatedCount,
			blockNumberOfBlockContainingSuperblock,
			bytesPerBlock,
			log2FragmentSizeMinus10,
			blocksPerBlockGroup,
			fragmentsPerBlockGroup,
			inodesPerBlockGroup,
			lastMountedTime,
			lastWrittenTime,
			mountsSinceLastConsistencyCheck,
			mountsAllowedBeforeNextConsistencyCheck,
			ext4SignatureAsHexadecimalEF53,
			filesystemStateCode,
			errorHandlingMethodCode,
			versionNubmerMinor,
			consistencyLastCheckedTime,
			secondsBetweenForcedConsistencyChecks,
			operatingSystemId,
			versionNumberMajor,
			userForWhomReservedBlocksAreReservedId,
			groupForWhomReservedBlocksAreReservedId,
			firstNonReservedInode,
			bytesPerInode,
			blockGroupSuperblockIsPartOf,
			featureFlagsNotRequiredToReadOrWriteAsBitString,
			featureFlagsRequiredToReadOrWriteAsBitString,
			featureFlagsRequiredForReadOnlyAsBitString,
			filesystemIdAsHexadecimal,
			volumeName,
			pathVolumeLastMountedTo,
			compressionAlgorithmsUsed,
			blockCountToPreallocateForFiles,
			blockCountToPreallocateForDirectories,
			unused,
			journalIdAsHexadecimal,
			journalInode,
			journalDevice,
			headOfOrphanInodeList,
			bytesRemainingAsHexadecimal
		);

		return superblock;
	}
}
