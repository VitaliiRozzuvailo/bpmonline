define('PreconfiguredPageModule', ['ext-base', 'terrasoft', 'sandbox', 'PreconfiguredPageModuleResources',
	'PreconfiguredPageViewGenerator', 'PreconfiguredPageViewModelGenerator', 'LookupUtilities', 'ConfigurationEnums',
	'ProcessHelper', 'BaseProcessViewModelClass'],
	function(Ext, Terrasoft, sandbox, resources,
			viewGenerator, viewModelGenerator, LookupUtilities, ConfigurationEnums,
			ProcessHelper, BaseProcessViewModelClass) {
		var viewConfig;
		var viewModel;
		var view;
		var viewRenderTo;
		var currentHistoryState;
		var instance;
		function reRender(renderTo) {
			var config = Terrasoft.deepClone(viewConfig);
			if (!Ext.isEmpty(view)) {
				view.destroy();
				view = null;
			}
			viewModel.set('isParametersInited', true);
			view = Ext.create(config.className || 'Terrasoft.Container', config);
			view.bind(viewModel);
			view.render(renderTo);
			resumeScroll.call(viewModel);
		}

		function decodePageSchema(pageSchema) {
			if (!pageSchema) {
				return;
			}
			Terrasoft.each(pageSchema.utils, decodeButtonConfig, this);
			Terrasoft.each(pageSchema.schema, function(schemaContainer) {
				Terrasoft.each(schemaContainer, decodeItemConfig, this);
			}, this);
			Terrasoft.each(pageSchema.values, function(value, index) {
				pageSchema.values[index] = decodeValue.call(this, value);
			}, this);
			if (Ext.isEmpty(pageSchema.methods.funcConfigs)) {
				return;
			}
			var funcConfigs = pageSchema.methods.funcConfigs;
			for (var i = 0; i < funcConfigs.length; i++) {
				var funcConfig = funcConfigs[i];
				var argNames = Ext.decode(funcConfig.argNames);
				var func = new Function(argNames, funcConfig.body);
				pageSchema.methods[funcConfig.name] = func;
			}
			delete pageSchema.methods.funcConfigs;
		}

		function decodeButtonConfig(button) {
			if (button) {
				button.enabled = Terrasoft.decode(button.enabled);
				button.validate = Terrasoft.decode(button.validate);
			}
		}

		function decodeItemConfig(item) {
			if (item.type === Terrasoft.ViewModelSchemaItem.GROUP && Ext.isArray(item.items)) {
				item.visible = Terrasoft.decode(item.enabled);
				item.collapsed = Terrasoft.decode(item.collapsed);
				Terrasoft.each(item.items, decodeItemConfig, this);
				return;
			}
			item.isRequired = Terrasoft.decode(item.isRequired);
		}

		function decodeValue(value) {
			if (value) {
				if (value.value === Terrasoft.GUID_EMPTY) {
					return null;
				}
				if (ProcessHelper.getIsDateTimeDataValueType(value.dataValueType)) {
					value = Terrasoft.parseDate(value.value);
				}
			}
			return value;
		}


		function render(renderTo) {
			instance = this;
			viewRenderTo = renderTo;
			if (viewModel) {
				reRender(renderTo);
				return;
			}
			var processData = ProcessHelper.getProcessElementData(sandbox);
			var processData1 = {
				schema: {
					leftContainer: [{
						name: 'test1',
						columnPath: 'test1',
						caption: 'test1',
						referenceSchemaName: 'Contact',
						enabled: false,
						type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
						dataValueType: Terrasoft.DataValueType.ENUM
					}, {
						name: 'test2',
						columnPath: 'test2',
						caption: 'test2',
						isRequired: true,
						value: 'test',
						type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
						dataValueType: Terrasoft.DataValueType.TEXT
					}, {
						name: 'test3',
						columnPath: 'test3',
						caption: 'test3',
						//isRequired: true,
						referenceSchemaName: 'Account',
						type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
						dataValueType: Terrasoft.DataValueType.LOOKUP
					}, {
						name: 'test4',
						columnPath: 'test4',
						caption: 'test4',
						type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
						dataValueType: Terrasoft.DataValueType.FLOAT
					}]

				},
				utils: [{
					name: 'test5',
					caption: 'test5',
					validate: true,
					style: Terrasoft.controls.ButtonEnums.style.GREEN
				}, {
					name: 'test6',
					caption: 'test6',
					validate: true,
					style: Terrasoft.controls.ButtonEnums.style.BLUE
				}, {
					name: 'test7',
					caption: 'test7',
					validate: false,
					style: Terrasoft.controls.ButtonEnums.style.DEFAULT
				}],
				methods: {
					test5: function() {
						this.showInformationDialog('test5');
						return false;
					},
					test6: function() {
						this.showInformationDialog('test6');
					},
					test7: function() {
						this.showInformationDialog('test7');
					},
					finalizeStructure: function(processData, callBack) {
						processData.pageSchema.values.header = 'lololo';
						callBack(processData);
					}
				},
				values: {
					header: 'Test',
					test4: '1234',
					test1: {
						value: null,
						displayValue: 'someContact'
					}
				}
			};
			processData = Terrasoft.deepClone(processData);
			var pageSchema = processData.pageSchema;
			decodePageSchema(pageSchema);
			if (processData && pageSchema.methods && pageSchema.methods.finalizeStructure) {
				pageSchema.methods.finalizeStructure(processData, function(processData) {
					generate(processData, renderTo);
				});
			} else {
				generate(processData, renderTo);
			}
		}
		function generate(processData, renderTo) {
			var viewModelConfig = viewModelGenerator.generate(processData.pageSchema);
			var generatedViewConfig = viewGenerator.generate(processData.pageSchema);
			Ext.define(viewModelConfig.name, viewModelConfig);
			viewModel = Ext.create(viewModelConfig.name, {
				values: viewModelConfig.values
			});
			viewModel.processData = processData;
			viewModel.sandbox = sandbox;
			viewModel.getModuleRenderTo = function() {
				return renderTo;
			};
			viewModel.getSandbox = function() {
				return sandbox;
			};
			viewModel.openLookup = function(config, handler) {
				LookupUtilities.Open(sandbox, config, handler, viewModel, renderTo);
			};
			viewConfig = Terrasoft.deepClone(generatedViewConfig);
			view = Ext.create(generatedViewConfig.className || 'Terrasoft.Container', generatedViewConfig);
			view.bind(viewModel);
			view.render(renderTo);
			loadCommandLine();
		}
		function init() {
			currentHistoryState = sandbox.publish('GetHistoryState');
			var currentHash = currentHistoryState.hash;
			var currentState = currentHistoryState.state || {};
			if (currentState.moduleId === sandbox.id) {
				return;
			}
			var newState = Terrasoft.deepClone(currentState);
			newState.moduleId = sandbox.id;
			sandbox.publish('ReplaceHistoryState', {
				stateObj: newState,
				pageTitle: null,
				hash: currentHash.historyState,
				silent: true
			});
		}
		function resumeScroll() {
			var scrollTo = this.scrollTo;
			if (scrollTo && scrollTo > 0) {
				Ext.getBody().dom.scrollTop = scrollTo;
				Ext.getDoc().dom.documentElement.scrollTop = scrollTo;
				scrollTo = 0;
			}
		}
		function loadCommandLine() {
			if (instance.isDestroyed) {
				return;
			}
			var commandLineContainer = Ext.get('card-command-line-container');
			sandbox.loadModule('CommandLineModule', {
				renderTo: commandLineContainer
			});
		}
		function destroy(config) {
			if (config.keepAlive) {
				return;
			}
		}

		return {
			init: init,
			render: render,
			destroy: destroy
		};
	}
);