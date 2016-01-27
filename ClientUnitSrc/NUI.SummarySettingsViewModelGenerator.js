define("SummarySettingsViewModelGenerator", ["ext-base", "terrasoft", "Contact",
	"SummarySettingsViewModelGeneratorResources"], function(Ext, Terrasoft, Contact, resources) {

	function generateRow(columnPath, pathCaption, columnCaption) {
		var viewModel = {
			values: {
				columnPath: columnPath,
				path: pathCaption,
				columnCaption: columnCaption,
				dataValueType: null,
				funcSelectedCaption: null,
				funcSelectedValue: null,
				funcSumCaption: null,
				funcSumVisible: false,
				funcAvgCaption: null,
				funcAvgVisible: false,
				funcMaxCaption: null,
				funcMaxVisible: false,
				funcMinCaption: null,
				funcMinVisible: false,
				displayCaptionContainerVisible: true,
				editCaptionContainerVisible: false,
				columnEditCaption: columnCaption
			},
			methods: {
				captionLabelClick: function() {
					this.set("displayCaptionContainerVisible", false);
					this.set("editCaptionContainerVisible", true);
					var el = Ext.get("caption-edit-" + this.key + "-el");
					el.focus();
				},
				confirmChangeCaption: function() {
					this.set("displayCaptionContainerVisible", true);
					this.set("editCaptionContainerVisible", false);
					this.set("columnCaption", this.get("columnEditCaption"));
				},
				discardChangeCaption: function() {
					this.set("displayCaptionContainerVisible", true);
					this.set("editCaptionContainerVisible", false);
					this.set("columnEditCaption", this.get("columnCaption"));
				},
				keyPressed: function(e) {
					var key = e.getKey();
					switch (key) {
						case e.ESC:
							this.discardChangeCaption();
							break;
						case e.ENTER:
							this.confirmChangeCaption();
							break;
					}
				}

			}
		};
		return viewModel;
	}

	function generate() {
		var viewModel = {
			values: {
				isChecked : false,
				schemaCaption: null
			},
			methods: {
			}
		};
		return viewModel;
	}

	return {
		generate : generate,
		generateRow : generateRow
	};
});