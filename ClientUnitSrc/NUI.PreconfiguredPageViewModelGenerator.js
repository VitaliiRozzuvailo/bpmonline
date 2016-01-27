define("PreconfiguredPageViewModelGenerator", ["ext-base", "terrasoft", "PreconfiguredPageViewModelGeneratorResources",
	"ViewUtilities"],
	function(Ext, Terrasoft, resources, ViewUtilities) {
		function generateViewModel(schemaConfig) {
			var config = Terrasoft.deepClone(schemaConfig);
			var viewModelConfig = {
				extend: "Terrasoft.BaseProcessViewModel",
				entitySchema: Ext.create("Terrasoft.BaseEntitySchema", {
					columns: {}
				}),
				className: "Terrasoft.PreconfiguredPageModule",
				name: "PreconfiguredPageModule",
				validationConfig: {},
				columns: {},
				primaryColumnName: "",
				primaryDisplayColumnName: "",
				values: {}
			};
			var methods = {};
			methods.Cancel = function() {
				var sandbox = this.getSandbox();
				sandbox.publish("BackHistoryState");
			};
			methods.getModelColumnByName = function(columnName) {
				var modelColumn = this.getColumnByName(columnName);
				var column = this.findEntityColumn(columnName);
				if (!column) {
					column = modelColumn;
				}
				if (!column) {
					throw new Terrasoft.ItemNotFoundException();
				}
				return column;
			};
			methods.loadVocabulary = function(args, tag) {
				var column = this.getModelColumnByName(tag);
				if (!column.isLookup) {
					return;
				}
				var entitySchemaName = column.referenceSchemaName;
				var config = {
					entitySchemaName: entitySchemaName,
					multiSelect: false,
					columnName: tag,
					columnValue: this.get(tag),
					searchValue: args.searchValue
				};
				var handler = function(args) {
					var columnName = args.columnName;
					var collection = args.selectedRows.collection;
					if (collection.length > 0) {
						this.set(columnName, collection.items[0]);
					}
				};
				this.scrollTo = document.body.scrollTop || document.documentElement.scrollTop;
				this.openLookup(config, handler);
			};
			methods.doUtilsActionForceProcess = function() {
				if (!this.validate()) {
					return false;
				}
				var result = this.doUtilsAction.apply(this, arguments);
				if (Ext.isEmpty(result) || result) {
					this.acceptProcessElement(arguments[3]);
				}
			};
			methods.doUtilsActionCancelProcess = function() {
				var result = this.doUtilsAction.apply(this, arguments);
				if (Ext.isEmpty(result) || result) {
					this.cancelProcessElement(arguments[3]);
				}
			};
			methods.doUtilsAction = function() {
				var tag = arguments[3];
				var method = this[tag];
				if (method) {
					return method.apply(this, arguments);
				}
				return true;
			};
			for (var containerName in config.schema) {
				var itemsConfig = config.schema[containerName];
				for (var i = 0; i < itemsConfig.length; i++) {
					assignControlViewModel(viewModelConfig, itemsConfig[i]);
				}
			}
			Ext.apply(viewModelConfig, methods);
			Ext.apply(viewModelConfig.values, config.values);
			Ext.apply(viewModelConfig, config.methods);
			return viewModelConfig;
		}

		function assignControlViewModel(viewModelConfig, item) {
			if (item.items && item.items.length !== 0) {
				var items = item.items;
				for (var i = 0; i < items.length; i++) {
					assignControlViewModel(viewModelConfig, items[i]);
				}
			}
			var itemConfig = ViewUtilities.getControlViewModelApplyConfig(item);
			Ext.apply(viewModelConfig.values, itemConfig.values);
			updateSchemaColumns(viewModelConfig, itemConfig.columns);
			Ext.apply(viewModelConfig, itemConfig.methods);
		}

		function updateSchemaColumns(viewModelConfig, columns) {
			var schemaColumns = {};
			if (viewModelConfig.entitySchema) {
				Ext.apply(schemaColumns, viewModelConfig.entitySchema.columns);
			}
			Ext.apply(schemaColumns, viewModelConfig.columns);
			for (var columnName in columns) {
				if (!schemaColumns[columnName]) {
					viewModelConfig.columns[columnName] = columns[columnName];
				}
			}
		}

		return {
			generate: generateViewModel
		};
	});