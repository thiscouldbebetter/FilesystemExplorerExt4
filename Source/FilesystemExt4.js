
class FilesystemExt4
{
	constructor
	(
		superblock,
		directoryRoot
	)
	{
		this.superblock = superblock;
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

		var directoryRoot = null; // todo

		var returnValue = new FilesystemExt4
		(
			superblock,
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
		return JSON.stringify(this, null, 4).split("\n").join("<br />");
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
		log2BlockSizeMinus10,
		log2FragmentSizeMinus10,
		blocksPerBlockGroup,
		fragmentsPerBlockGroup,
		inodesPerBlockGroup,
		lastMountedAtSecondsSinceUnixEpoch,
		lastWrittenAtSecondsSinceUnixEpoch,
		mountsSinceLastConsistencyCheck,
		mountsAllowedBeforeNextConsistencyCheck,
		ext4SignatureAsHexadecimalEF53,
		filesystemStateCode,
		errorHandlingMethodCode,
		versionNubmerMinor,
		consistencyLastCheckedAtSecondsSinceUnixEpoch,
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
		filesystemId,
		volumeName,
		pathVolumeLastMountedTo,
		compressionAlgorithmsUsed,
		blockCountToPreallocateForFiles,
		blockCountToPreallocateForDirectories,
		unused,
		journalId,
		journalInode,
		journalDevice,
		headOfOrphanInodeList
	)
	{
		this.inodeCount = inodeCount;
		this.blockCount = blockCount;
		this.blocksReservedForSuperuserCount = blocksReservedForSuperuserCount;
		this.blocksUnallocatedCount = blocksUnallocatedCount;
		this.inodesUnallocatedCount = inodesUnallocatedCount;
		this.blockNumberOfBlockContainingSuperblock = blockNumberOfBlockContainingSuperblock;
		this.log2BlockSizeMinus10 = log2BlockSizeMinus10;
		this.log2FragmentSizeMinus10 = log2FragmentSizeMinus10;
		this.blocksPerBlockGroup = blocksPerBlockGroup;
		this.fragmentsPerBlockGroup = fragmentsPerBlockGroup;
		this.inodesPerBlockGroup = inodesPerBlockGroup;
		this.lastMountedAtSecondsSinceUnixEpoch = lastMountedAtSecondsSinceUnixEpoch;
		this.lastWrittenAtSecondsSinceUnixEpoch = lastWrittenAtSecondsSinceUnixEpoch;
		this.mountsSinceLastConsistencyCheck = mountsSinceLastConsistencyCheck;
		this.mountsAllowedBeforeNextConsistencyCheck = mountsAllowedBeforeNextConsistencyCheck;
		this.ext4SignatureAsHexadecimalEF53 = ext4SignatureAsHexadecimalEF53;
		this.filesystemStateCode = filesystemStateCode;
		this.errorHandlingMethodCode = errorHandlingMethodCode;
		this.versionNubmerMinor = versionNubmerMinor;
		this.consistencyLastCheckedAtSecondsSinceUnixEpoch = consistencyLastCheckedAtSecondsSinceUnixEpoch;
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
		this.filesystemId = filesystemId;
		this.volumeName = volumeName;
		this.pathVolumeLastMountedTo = pathVolumeLastMountedTo;
		this.compressionAlgorithmsUsed = compressionAlgorithmsUsed;
		this.blockCountToPreallocateForFiles = blockCountToPreallocateForFiles;
		this.blockCountToPreallocateForDirectories = blockCountToPreallocateForDirectories;
		this.unused = unused;
		this.journalId = journalId;
		this.journalInode = journalInode;
		this.journalDevice = journalDevice;
		this.headOfOrphanInodeList = headOfOrphanInodeList;
	}

	static readFromByteStream(byteStream)
	{
		var bs = byteStream;

		var inodeCount = bs.readIntegerLE(4);
		var blockCount = bs.readIntegerLE(4);
		var blocksReservedForSuperuserCount = bs.readIntegerLE(4);
		var blocksUnallocatedCount = bs.readIntegerLE(4);
		var inodesUnallocatedCount = bs.readIntegerLE(4);
		var blockNumberOfBlockContainingSuperblock = bs.readIntegerLE(4);
		var log2BlockSizeMinus10 = bs.readIntegerLE(4);
		var log2FragmentSizeMinus10 = bs.readIntegerLE(4);
		var blocksPerBlockGroup = bs.readIntegerLE(4);
		var fragmentsPerBlockGroup = bs.readIntegerLE(4);
		var inodesPerBlockGroup = bs.readIntegerLE(4);

		// The Unix Epoch is the start of January 1, 1970, UTC.
		var lastMountedAtSecondsSinceUnixEpoch = bs.readIntegerLE(4);
		var lastWrittenAtSecondsSinceUnixEpoch = bs.readIntegerLE(4);

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
		var secondsBetweenForcedConsistencyChecks = bs.readIntegerLE(4);

		// Operating system IDs:
		// 0 = Linux, 1 - GNU HURD.
		// 2 - MASIX.
		// 3 - FreeBSD.
		// 4 - BSD 4.4-Lite derivatives.
		var operatingSystemId = bs.readIntegerLE(4);

		var versionNumberMajor = bs.readIntegerLE(2);

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

			var filesystemId = bs.readString(16); // Output by "blkid".
			var volumeName = bs.readString(16);
			var pathVolumeLastMountedTo = bs.readString(64);
			var compressionAlgorithmsUsed = bs.readBytes(4);
			var blockCountToPreallocateForFiles = bs.readByte();
			var blockCountToPreallocateForDirectories = bs.readByte();

			var unused = bs.readIntegerLE(2);

			var journalId = bs.readString(16); // Same style as filesystemId.
			var journalInode = bs.readIntegerLE(4);
			var journalDevice = bs.readIntegerLE(4);
			var headOfOrphanInodeList = bs.readIntegerLE(4);

			// The rest of the superblock's 1024 bytes are unused.
		}

		var superblock = new FilesystemExt4Superblock
		(
			inodeCount,
			blockCount,
			blocksReservedForSuperuserCount,
			blocksUnallocatedCount,
			inodesUnallocatedCount,
			blockNumberOfBlockContainingSuperblock,
			log2BlockSizeMinus10,
			log2FragmentSizeMinus10,
			blocksPerBlockGroup,
			fragmentsPerBlockGroup,
			inodesPerBlockGroup,
			lastMountedAtSecondsSinceUnixEpoch,
			lastWrittenAtSecondsSinceUnixEpoch,
			mountsSinceLastConsistencyCheck,
			mountsAllowedBeforeNextConsistencyCheck,
			ext4SignatureAsHexadecimalEF53,
			filesystemStateCode,
			errorHandlingMethodCode,
			versionNubmerMinor,
			consistencyLastCheckedAtSecondsSinceUnixEpoch,
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
			filesystemId,
			volumeName,
			pathVolumeLastMountedTo,
			compressionAlgorithmsUsed,
			blockCountToPreallocateForFiles,
			blockCountToPreallocateForDirectories,
			unused,
			journalId,
			journalInode,
			journalDevice,
			headOfOrphanInodeList
		);

		return superblock;
	}
}