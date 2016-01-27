define('FileListViewModelGenerator', ['ext-base', 'terrasoft', 'FileListViewModelGeneratorResources', 'FileHelper',
	'GridUtilities'],
	function(Ext, Terrasoft, resources, FileHelper, GridUtilities) {
		var methods = {
			deleteClick: function(a, b, c, tag) {
				if (tag) {
					this.deleteItem(tag);
				}
			},
			deleteItem: function(itemId) {
				this.showConfirmationDialog(resources.localizableStrings.OnDeleteWarning,
					function(returnCode) {
						if (returnCode === Terrasoft.MessageBoxButtons.YES.returnCode) {
							this.onDeleteAccept(itemId);
						}
					}, ['yes', 'no']);
			},
			onDeleteAccept: function(itemId) {
				this.set('activeRow', itemId);
				GridUtilities.deleteSelectedRecords(this);
			},
			onDeleted: function(records) {
				if (records && records.length) {
					var gridData = this.get('gridData');
					records.forEach(function(record) {
						gridData.removeByKey(record);
					});
					this.set('gridEmpty', !gridData.getCount());
					this.reRender();
					this.publishOnDeletedMessage(records);

				}
			},
			load: function(callback) {
				//if (instance.isDestroyed) { return; }
				this.set('loadingData', true);
				var recordId = this.get('recordId');
				if (Ext.isEmpty(recordId)) {
					return;
				}
				var select = Ext.create('Terrasoft.EntitySchemaQuery', {
					rootSchema: this.entitySchema
				});
				select.addColumn('Id');
				select.addColumn('Name');
				var column = select.addColumn('CreatedOn');
				column.orderDirection = Terrasoft.OrderDirection.DESC;
				select.addColumn('Size');
				select.filters.addItem(Terrasoft.createColumnFilterWithParameter(
					Terrasoft.ComparisonType.EQUAL,
					this.baseSchemaName, recordId));
				select.getEntityCollection(function() {
					this.onDataLoaded.apply(this, arguments);
					callback.apply(this, arguments);
				}, this);
			},
			loadByIds: function(ids, callback) {
				//if (instance.isDestroyed) { return; }
				this.set('loadingData', true);
				var recordId = this.get('recordId');
				if (Ext.isEmpty(recordId)) {
					return;
				}
				var select = Ext.create('Terrasoft.EntitySchemaQuery', {
					rootSchema: this.entitySchema
				});
				select.addColumn('Id');
				select.addColumn('Name');
				var column = select.addColumn('CreatedOn');
				column.orderDirection = Terrasoft.OrderDirection.DESC;
				select.addColumn('Size');
				select.filters.addItem(Terrasoft.createColumnInFilterWithParameters("Id", ids));
				select.getEntityCollection(function() {
					this.onDataLoaded.apply(this, arguments);
					callback.apply(this, arguments);
				}, this);
			},
			onDataLoaded: function(response) {
				//if (instance.isDestroyed) { return; }
				this.set('loadingData', false);
				if (response && response.success) {
					var gridData = this.get('gridData');
					response.collection.each(function(item) {
						this.initItemViewModel.call(item);
					}, this);

					this.set('gridEmpty', gridData.getCount() === 0 && response.collection.getCount() === 0);
					gridData.loadAll(response.collection);
				}
			},
			initItemViewModel: function() {
				this.columns.typeImage = {
					dataValueType: Terrasoft.DataValueType.CUSTOM_OBJECT
				};
				this.columns.Size = {
					dataValueType: Terrasoft.DataValueType.TEXT
				};
				this.set('canRemove', true);//todo use delete rigths Check,
				var name = this.get('Name');
				this.set('typeImage', FileHelper.getFileIconByFileName(name));
				this.set('Size', FileHelper.sizeConverter(this.get('Size')));
				this.getLink = function() {
					var id = this.get('Id');
					var name = this.get('Name');
					var target = '_self';
					return {
						url: '../rest/FileService/GetFile/' + this.entitySchema.uId + '/' + id,
						title: name,
						target: target
					};
				};
			}
		};



		function generateViewModel(entitySchema) {
			var values = {
				gridData: new Terrasoft.Collection(),
				activeRow: null,
				gridEmpty: true,
				canEdit: true,
				loadingData: true,
				itemsPerPage: 5,
				multiSelect: false
			};
			var config = {
				entitySchema: entitySchema,
				//extend: 'Terrasoft.BaseViewModel',
				//className: 'Terrasoft.FileListModule',
				name: 'FileListModule',
				columns: {},
				primaryColumnName: '',
				primaryDisplayColumnName: '',
				values: values,
				methods: methods
			};
			//Ext.apply(config, methods);
			return config;
		}
		return {
			generate: generateViewModel
		};
	});
