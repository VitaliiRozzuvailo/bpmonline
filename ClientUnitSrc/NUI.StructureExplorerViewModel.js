define("StructureExplorerViewModel", ["ext-base", "terrasoft", "ModalBox", "StructureExplorerUtilities"],
function(Ext, Terrasoft, modalbox, StructureExplorerUtilities) {
	var viewModel;
	function requiredValidator(value) {
		var invalidMessage = "";
		var result = {
			invalidMessage: invalidMessage
		};
		if (value) {
			return result;
		}
		result.invalidMessage = Terrasoft.Resources.BaseViewModel.columnRequiredValidationMessage;
		return result;
	}

	function generateMainViewModel() {
		viewModel = Ext.create("Terrasoft.BaseViewModel", {
				columns: {
					EntitySchemaColumn: {
						columnType: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
						isRequired: true
					}
				},
				values: {
					caption: "empty",
					ExpandVisible: true,
					RemoveVisible: false,
					ComboBoxListEnabled: true,
					EntitySchemaColumnList: new Terrasoft.Collection(),
					EntitySchemaColumn: null,
					entitySchema: null
				},
				methods: {
					onCancelClick: function() {
						Terrasoft.StructureExplorerUtilities.closeModalBox();
					},
					getItems: function(filter, list) {
						list.sortByFn(function(a, b) {
							return a.order - b.order === 0 ?
							a.displayValue.localeCompare(b.displayValue) :
							a.order - b.order;
						});
						list.loadAll({});
					},
					onKeyDown: function(event) {
						if (event) {
							var key = event.getKey();
							if (key === event.ENTER && this.get("EntitySchemaColumn")) {
								this.select();
							}
						}
					},
					close: function() {}
				}
			}
		);
		return viewModel;
	}
	function generateItemViewModel(referenceSchemaName) {
		var viewModel = Ext.create("Terrasoft.BaseViewModel", {
				columns: {
					EntitySchemaColumn: {
						columnType: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
						isRequired: true
					}
				},
				values: {
					EntitySchemaColumnList: new Terrasoft.Collection(),
					EntitySchemaColumn: null,
					ExpandVisible: true,
					ExpandEnable: false,
					RemoveVisible: false,
					CloseVisible: true,
					ComboBoxListEnabled: true,
					entitySchema: null
				},
				methods: {
					getItems:  function(filter, list) {
						list.sortByFn(function(a, b) { return a.displayValue.localeCompare(b.displayValue); });
						list.loadAll({});
					}
				},
				validationConfig: {
					EntitySchemaColumn: [requiredValidator]
				}
			}
		);
		return viewModel;
	}
	return {
		generate: generateMainViewModel,
		generateItem: generateItemViewModel
	};
});