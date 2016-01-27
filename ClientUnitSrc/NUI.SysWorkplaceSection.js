define('SysWorkplaceSection', ['ext-base', 'terrasoft', 'sandbox', 'SysWorkplace', 'SysWorkplaceSectionStructure',
	'SysWorkplaceSectionResources', 'LocalizableHelper', 'ServiceHelper', 'css!SysWorkplaceHelper'],
	function(Ext, Terrasoft, sandbox, entitySchema, structure, resources, LocalizableHelper, ServiceHelper) {
		structure.userCode = function() {
			this.entitySchema = entitySchema;
			this.getEditPages = function() {
				return undefined;
			};
			this.methods.esqConfig = {
				sort: {
					columns: [
						{
							name: 'Position',
							orderPosition: 0,
							orderDirection: Terrasoft.OrderDirection.ASC
						}
					]
				}
			};
			this.name = 'SysWorkplaceSectionViewModel';
			this.columnsConfig = [
				[
					{
						cols: 24,
						key: [
							{
								name: {
									bindTo: 'Name'
								},
								type: 'title'
							}
						]
					}
				]
			];
			this.loadedColumns = [
				{
					columnPath: 'Position'
				},
				{
					columnPath: 'Name'
				}
			];
			this.methods.initViewModel = function() {
				this.set('addToStaticFolderVisible', false);
			};
			this.methods.getViews = function(baseGetViews) {
				var views = baseGetViews.call(this);
				for (var i = 0; i < views.length; i++) {
					if (views[i].name === 'mainView') {
						views[i].caption = resources.localizableStrings.HeaderCaption;
						break;
					}
				}
				return views.splice(0, 1);
			};
			this.methods.modifyGridConfig = function(gridConfig) {
				var activeRowActions = gridConfig.activeRowActions;
				var newActiveRowActions = [
					{
						className: 'Terrasoft.Button',
						style: Terrasoft.controls.ButtonEnums.style.BLUE,
						imageConfig: LocalizableHelper.localizableImages.Up,
						tag: 'up'
					},
					{
						className: 'Terrasoft.Button',
						style: Terrasoft.controls.ButtonEnums.style.BLUE,
						imageConfig: LocalizableHelper.localizableImages.Down,
						tag: 'down'
					}
				];
				Terrasoft.each(activeRowActions, function(action) {
					if (action.tag === 'delete' || action.tag === 'edit') {
						newActiveRowActions.push(action);
					}
				});
				gridConfig.activeRowActions = newActiveRowActions;
				gridConfig.id = "workplaceGrid";
			};
			var setPosition = function(recordId, position, callback, scope) {
				var data = {
					tableName: entitySchema.name,
					primaryColumnValue: recordId,
					position: position,
					grouppingColumnNames: ""
				};
				ServiceHelper.callService("RightsService", "SetCustomRecordPosition", callback, data, scope);
			};
			this.methods.onActiveRowAction = function(tag, id, parentOnActiveRowAction) {
				if (tag === 'delete' || tag === 'edit') {
					parentOnActiveRowAction.call(this, tag, id);
				}
				var recordId = this.get('activeRow');
				var gridData = this.get('gridData');
				var activeRow = gridData.get(recordId);
				var position = activeRow.get('Position');
				if (tag === 'up') {
					if (position > 0) {
						position--;
					}
				}
				if (tag === 'down') {
					position++;
				}
				setPosition(recordId, position, function() {
					gridData.clear();
					this.load();
					sandbox.publish('RefreshWorkplace');
				}, this);
			};
			this.methods.modifyLinksItems = function(responseItems) {
				responseItems.each(function(item) {
					item['get' + entitySchema.primaryDisplayColumnName + 'LinkPrimary'] = function() {
						return null;
					};
				});
			};
			this.methods.onDeleted = function(records) {
				if (!records) {
					var activeRow = this.get('activeRow');
					var selectedRows = this.get('selectedRows');
					records = activeRow ? [activeRow] : selectedRows;
				}
				if (records && records.length) {
					var gridData = this.get('gridData');
					records.forEach(function(record) {
						gridData.removeByKey(record);
					});
					this.set('gridEmpty', !gridData.getCount());
				}
				sandbox.publish('RefreshWorkplace');
			};
			this.sectionConfig = {
				hideSettings: true,
				hideActions: true
			};
		};
		return structure;
	});