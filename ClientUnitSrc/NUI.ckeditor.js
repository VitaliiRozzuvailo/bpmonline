define("ckeditor", ["ckeditor-base"], function() {
	var warningMessage = Ext.String.format(Terrasoft.Resources.ObsoleteMessages.ObsoleteModule,
		"ckeditor", "ckeditor-base");
	window.console.log(warningMessage);
});