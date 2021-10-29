Creating an Ext4 Filesystem Image File
======================================

Follow the steps below to create a disk image file formatted for the ext4 filesystem. (Note that steps 2-4 are adapted from a similar tutorial currently posted at the URL "https://forum.xda-developers.com/t/guide-how-to-create-ext4-images".)

1. Open a Linux command prompt in the newly created directory (perhaps, if using Microsoft Windows, by installing and starting the Windows Subsystem for Linux, or "WSL").

2. Create a new empty file of adequate size (2048 blocks of 4 kiB each, or 8 MiB) by running the following command:

> dd if=/dev/zero of=ext4.img bs=4k count=2048

3. Format the newly created ext4.img file as an ext4 filesystem by running the following command:

> mkfs.ext4 ext4.img

4. Disable the “file system check” on the newly formatted image file by running the following command:

>  tune2fs -c0 -i0 ext4.img

5. Create a new directory for the image file to be mounted to by running the following command:

> mkdir ext4

6. Mount the image file to the newly created directory by running the following command. (Note that the command uses “sudo” to run as the superuser. Also, during the writing of these instructions it was necessary to use chown and chgroup to change the owner of the directory before mounting so that writes would work):

> sudo mount ext4.img ext4/

7. Switch to the newly mounted directory by running the following command:

>  cd ext4

8. Create some test files and subdirectories in the ext4 directory by running the following command:

> echo "This is Test1.txt!" > Test1.txt
> echo "This is Test2.txt!" > Test2.txt
> echo "This is Test3.txt!" > Test2.txt
> mkdir TestDirectory1
> mkdir TestDirectory2
> cd TestDirectory1
> echo "This is Test1_1.txt!" > Test1_1.txt
> echo "This is Test1_2.txt!" > Test1_2.txt
> mkdir TestDirectory1_1
> cd TestDirectory1_1
> echo "This is Test1_1_1.txt!" > Test1_1_1.txt
> echo "This is Test1_1_2.txt!" > Test1_1_2.txt

9. Unmount the image file by running “cd ..” a couple times to return to the directory containing the ext4/ directory and then run the following command:

> sudo umount ext4

10. If running through WSL, the newly populated image file can be copied from the guest Linux VM to the host Windows machine by running the following command from within the desired directory on the VM and then copying the file through the Windows file explorer as usual:

> explorer.exe .