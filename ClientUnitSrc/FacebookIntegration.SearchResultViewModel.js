define([], function() {
	Ext.define("Terrasoft.configuration.social.SearchResult", {
		extend: "Terrasoft.BaseViewModel",
		alternateClassName: "Terrasoft.SearchResult",

		externalLinkBaseUrl: "https://www.facebook.com/",

		getNameLink: function() {
			var id = this.get("Id");
			var name = this.get("Name");
			return {
				title: name,
				url: this.externalLinkBaseUrl + id,
				target: "_blank"
			};
		},

		getWebLink: function() {
			var web = this.get("Web");
			if (!Terrasoft.isUrl(web)) {
				return;
			}
			return {
				title: name,
				url: web,
				target: "_blank"
			};
		},

		columns: {
			"Id": {
				dataValueType: Terrasoft.DataValueType.TEXT
			},
			"Name": {
				dataValueType: Terrasoft.DataValueType.TEXT
			},
			"Photo": {
				dataValueType: Terrasoft.DataValueType.CUSTOM_OBJECT
			},
			"Cover": {
				dataValueType: Terrasoft.DataValueType.CUSTOM_OBJECT
			},
			"Category": {
				dataValueType: Terrasoft.DataValueType.TEXT
			},
			"Web": {
				dataValueType: Terrasoft.DataValueType.TEXT
			},
			"Phone": {
				dataValueType: Terrasoft.DataValueType.TEXT
			},
			"Country": {
				dataValueType: Terrasoft.DataValueType.TEXT
			},
			"City": {
				dataValueType: Terrasoft.DataValueType.TEXT
			}
		}
	});
});
