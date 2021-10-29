
class Globals
{
	static Instance = new Globals();

	initialize(filesystem)
	{
		this.filesystem = filesystem;

		var d = document;
		var divMain = d.getElementById("divMain");
		divMain.innerHTML = "";
		divMain.appendChild
		(
			this.filesystem.domElementUpdate()
		);
	}
}
