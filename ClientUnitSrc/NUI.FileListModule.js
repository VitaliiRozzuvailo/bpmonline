define('FileListModule', ['ext-base', 'terrasoft', 'sandbox', 'FileListModuleResources',
	'FileListViewGenerator', 'FileListViewModelGenerator'],
	function(Ext, Terrasoft, sandbox, resources, viewGenerator, viewModelGenerator) {
		function createConstructor(context) {
			var Ext = context.Ext;
			var sandbox = context.sandbox;
			var Terrasoft = context.Terrasoft;
			var viewConfig;
			var viewModel;
			var view;
			var config = {
				entityName: 'KnowledgeBaseFile',
				baseSchemaName: 'KnowledgeBase'
			};
			function reRender(renderTo) {
				if (!Ext.isEmpty(view)) {
					view.destroy();
					view = null;
				}
				var generatedViewConfig = viewGenerator.generate(config.recordId, this.get('gridData'));
				viewConfig = Terrasoft.deepClone(generatedViewConfig);
				view = Ext.create(config.className || 'Terrasoft.Container', viewConfig);
				view.bind(this);
				view.render(renderTo);
			}
			function render(renderTo, scope, sandboxExternal) {
				if (viewModel) {
					reRender.call(viewModel, renderTo);
					return;
				}
				var sandbox = sandboxExternal;
				getEntitySchema(config.entityName, function(entitySchema) {
					var viewModelConfig = viewModelGenerator.generate(entitySchema);
					//Ext.define(viewModelConfig.name, viewModelConfig);
					Ext.apply(viewModelConfig.values, {
						recordId: config.recordId
					});
					viewModel = Ext.create('Terrasoft.BaseViewModel', viewModelConfig);
					viewModel.baseSchemaName = config.baseSchemaName;
					viewModel.reRender = function() {
						reRender.call(this, renderTo);
					};
					viewModel.load(function() {
						reRender.call(this, renderTo);
					});
					viewModel.publishOnDeletedMessage = function(elementsId) {
						sandbox.publish('FileDeleted', {
							deletedItems: elementsId
						}, [config.recordId]);
					};
					sandbox.subscribe('DestroyFilesModule', function() {
						instance.isDestroyed = true;
						if (viewModel) {
							viewModel.destroy();
							viewModel = null;
						}
						if (view) {
							view.destroy();
							view = null;
						}
					}, [sandbox.id]);
					sandbox.subscribe('RefreshFiles', function(args) {
						if (instance.isDestroyed) {
							return;
						}
						viewModel.loadByIds(args.addedIds, function() {
							reRender.call(this, renderTo);
						});
					}, [sandbox.id]);
					subscribeForEvents(viewModel);
				});
			}
			function getEntitySchema(referenceSchemaName, callback, scope) {
				scope = scope || this;
				sandbox.requireModuleDescriptors(['force!' + referenceSchemaName], function() {
					require([referenceSchemaName], function(entitySchema) {
						callback.call(scope, entitySchema);
					});
				});
			}
			function subscribeForEvents(viewModel) {

			}
			function init() {
				//#todo get info
				instance.isDestroyed = false;
				var itemConfig = sandbox.publish('GetRecordInfo', null, [sandbox.id]);
				Ext.apply(config, itemConfig);
			}

			var instance = Ext.define('FileListModule', {
				init: init,
				render: function(renderTo) {
					render(renderTo, this, sandbox);
				}
			});
			return instance;
		}
		return createConstructor;
	}
);