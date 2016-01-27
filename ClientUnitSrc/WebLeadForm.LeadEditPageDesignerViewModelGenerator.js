define('LeadEditPageDesignerViewModelGenerator', ['ext-base', 'terrasoft', 'GeneratedWebForm',
	'LeadEditPageDesignerViewModelGeneratorResources', 'GeneratedWebFormUtilities',
	'LeadEditPageDesignerViewGenerator', 'LeadEditPageDesignerHelper'],
	function(Ext, Terrasoft, GeneratedWebForm, resources, GeneratedWebFormUtilities, viewGenerator,
			LeadEditPageDesignerHelper) {
		var actionsRowPrefix =  '-ActiveItemAction-';
		var hiddenCss = 'hidden-actions';
		var actionsRowTpl = new Ext.Template('<div id="{id}" class="edit-item-actions"></div>');
		function getFullViewModelSchema(sourceViewModelSchema) {
			return Terrasoft.utils.common.deepClone(sourceViewModelSchema);
		}

		function generate(viewModelSchema, info) {
			var fullViewModelSchema = getFullViewModelSchema(viewModelSchema);
			fullViewModelSchema.entitySchemaInfo = info;
			var config = {
				extend: fullViewModelSchema.extend,
				className: 'Terrasoft.' + fullViewModelSchema.name,
				entitySchema: fullViewModelSchema.entitySchema,
				name: fullViewModelSchema.name,
				columns: {},
				primaryColumnName: '',
				primaryDisplayColumnName: '',
				values: {
					advancedVisible: false,
					delayExecutionButtonVisible: false,
					isEdit: true,
					isVisibleEditButton: true,
					clickedElement: null
				}
			};
			fullViewModelSchema.methods.getColumnAddItemEnabledPropertyName = function(columnName) {
				return "addItemEnabled" + columnName;
			};
			fullViewModelSchema.methods.onSaved = function() {
				this.publish('BackHistoryState');
			};
			fullViewModelSchema.methods.save = function() {
				var schemaLeadColumns = this.get('Columns');
				if (schemaLeadColumns.getItems().length === 0) {
					this.showInformationDialog(resources.localizableStrings.NeedConfigureFormFieldsMessage);
					return;
				}
				var recordId = this.get('recordId');
				var select = Ext.create('Terrasoft.EntitySchemaQuery', {
					rootSchema: GeneratedWebForm
				});
				select.rowCount = 1;
				select.addColumn('Id');
				select.addColumn('FormFields');
				select.filters.add('filterId', Terrasoft.createColumnFilterWithParameter(
					Terrasoft.ComparisonType.EQUAL, 'Id', recordId));
				select.getEntityCollection(function(result) {
					if (result.success) {
						var savingColumnsData = this.getSavingColumnsData();
						var LeadColumns = Ext.JSON.encode(savingColumnsData);
						if (result.collection.getCount() > 0) {
							var item = result.collection.getByIndex(0);
							item.columns.FormFields.type = Terrasoft.ViewModelColumnType.ENTITY_COLUMN;
							item.set('FormFields', LeadColumns, Terrasoft.DataValueType.TEXT);
							item.saveEntity(function() {
								this.publish("IncomingPtp", (savingColumnsData.length > 0),
									["ViewModule_CardModule_GeneratedWebForm"]);
								this.publish("CardModuleResponse", (savingColumnsData.length > 0),
									["ViewModule_SectionModule_GeneratedWebForm"]);
								this.onSaved();
							}, this);
						} else {
							this.publish("IncomingPtp", LeadColumns,
								["ViewModule_CardModule_GeneratedWebForm"]);
						}
					}
				}, this);
			};
			fullViewModelSchema.methods.edit = function() {
				var recordId = this.get('recordId');
				GeneratedWebFormUtilities.openLeadEditPageDesigner(this, recordId, 'edit');
			};
			fullViewModelSchema.methods.onDetailCollapsedChanged = function() {};
			fullViewModelSchema.methods.loadVocabulary = function() {};
			fullViewModelSchema.methods.getHeader = function() {
				//return resources.localizableStrings.FormDesignerHeaderCaption;
				this.sandbox.publish("InitDataViews", {
					caption: resources.localizableStrings.FormDesignerHeaderCaption,
					dataViews: false
				});
				return '';
			};
			fullViewModelSchema.methods.highlightContainer = function(tag) {
				var labelControl = Ext.get(tag.containerId);
				if (!Ext.isEmpty(labelControl)) {
					labelControl.addCls('designerSelected');
					labelControl.focus();
				}
			};
			fullViewModelSchema.methods.unhighlightContainer = function(tag) {
				var labelControl = Ext.get(tag.containerId);
				if (!Ext.isEmpty(labelControl)) {
					labelControl.removeCls('designerSelected');
				}
			};
			fullViewModelSchema.methods.containerRendered = function(a, tag) {
				if (!a.scope || !tag) {
					return;
				}
				Ext.get(tag.containerId).on({
					'focus': {
						fn: function() {
							this.labelClick(tag);
						},
						scope: this
					}
				});
			};
			fullViewModelSchema.methods.labelClick = function(tag) {
				this.setCurrentElement(tag);
			};
			fullViewModelSchema.methods.getCurrentElement = function() {
				return this.get('clickedElement');
			};
			fullViewModelSchema.methods.setCurrentElement = function(value) {
				var previousElement = this.getCurrentElement();
				if (!Ext.isEmpty(previousElement)) {
					this.removeItemActions(previousElement);
					this.unhighlightContainer(previousElement);
				}
				if (!Ext.isEmpty(value)) {
					this.addItemActions(value);
					this.highlightContainer(value);
				}
				this.set('clickedElement', value);
			};
			fullViewModelSchema.methods.moveColumn = function(offset) {
				if (offset === 0) {
					return;
				}
				var currentElement = this.getCurrentElement();
				if (Ext.isEmpty(currentElement)) {
					return;
				}
				var schemaLeadColumns = this.get('Columns');
				var column = schemaLeadColumns.get(currentElement.itemName);
				var index = schemaLeadColumns.indexOf(column);
				var prevColumn = null;
				if (((offset < 0) && (index > 0)) ||
					((offset > 0) && (index < schemaLeadColumns.getCount() - 1))) {
					prevColumn = schemaLeadColumns.getByIndex(index + offset);
				}
				if (!prevColumn) {
					return;
				}
				schemaLeadColumns.remove(prevColumn);
				schemaLeadColumns.insert(index, prevColumn.columnPath, prevColumn);
				LeadEditPageDesignerHelper.moveWebFormLeadColumn(viewModelSchema, index, index + offset);
				var element = Ext.getCmp(currentElement.containerId);
				var config = this.GetConfigFromExt(element);
				var extCmpPrevContainer = Ext.getCmp(this.getContainerId());
				extCmpPrevContainer.remove(element);
				element.destroy();
				var elementCopy = Ext.create(config.className, config);
				elementCopy.bind(this);
				if (extCmpPrevContainer.items.keys[0] === "header-name-container") {
					offset++;
				}
				extCmpPrevContainer.items.insert(index + offset, elementCopy);
				extCmpPrevContainer.reRender();
				this.highlightContainer(currentElement);
			};
			fullViewModelSchema.methods.upField = function() {
				this.moveColumn(-1);
			};
			fullViewModelSchema.methods.downField = function() {
				this.moveColumn(1);
			};
			fullViewModelSchema.methods.removeItemActions = function(tag) {
				var itemActions = this.get('activeItemActions');
				if (!itemActions.length) {
					return;
				}
				var actionsRow = Ext.get(tag.containerId + actionsRowPrefix);
				if (actionsRow) {
					actionsRow.addCls(hiddenCss);
				}
			};
			fullViewModelSchema.methods.addItemActions = function(tag) {
				var itemActions = this.get('activeItemActions');
				if (!itemActions.length) {
					return;
				}
				var actionsRow = Ext.get(tag.containerId + actionsRowPrefix);
				if (!actionsRow) {
					var renderTo = this.createActionsRow(tag);
					if (renderTo) {
						this.renderRowActions(renderTo, tag);
					}
				} else {
					actionsRow.removeCls(hiddenCss);
				}
			};
			fullViewModelSchema.methods.createActionsRow = function(tag) {
				var selector = tag.containerId + actionsRowPrefix;
				var item = Ext.get(tag.containerId);
				if (item) {
					var renderTo = actionsRowTpl.append(item, {
						id: selector
					}, true);
					return renderTo;
				}
			};
			fullViewModelSchema.methods.renderRowActions = function(renderTo, tag) {
				var itemActions = Ext.clone(this.get('activeItemActions'));
				var self = this;
				var actionHandler = function() {
					self.onActionItemClick(this.tag, tag);
				};
				for (var i = 0, c = itemActions.length; i < c; i += 1) {
					var action = itemActions[i];
					action.renderTo = renderTo;
					action.handler = actionHandler;
					var actionItem = Ext.create(action.className, action);
					if (this.collection) {
						actionItem.bind(self);
					}
				}
			};
			fullViewModelSchema.methods.onActionItemClick = function(event) {
				switch (event) {
					case 'upField':
						this.upField();
						break;
					case 'downField':
						this.downField();
						break;
					case 'edit':
						this.editColumn();
						break;
					case 'hide':
						this.hideColumn();
						break;
				}
			};
			fullViewModelSchema.methods.getNewColumnConfig = function(name, columnPath, dataType,
																		caption, isRequired, Id) {
				return {
					type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
					EditStructureContainerId: (!!Id) ? Id : Terrasoft.generateGUID(),
					EditStructureContainerIdNew: (!!Id) ? false : true,
					advancedVisible: true,
					caption: (!!caption) ? caption : name,
					name: name,
					columnPath: columnPath,
					dataValueType: dataType,
					isRequired: (!!isRequired) ? isRequired : false,
					visible: true
				};
			};
			fullViewModelSchema.methods.hideColumn = function() {
				var currentElement = this.getCurrentElement();
				if (Ext.isEmpty(currentElement)) {
					return;
				}
				var schemaLeadColumns = this.get('Columns');
				schemaLeadColumns.removeByKey(currentElement.itemName);
				Ext.getCmp(currentElement.containerId).destroy();
				this.setCurrentElement(null);
				this.set(this.getColumnAddItemEnabledPropertyName(currentElement.itemName), true);
			};
			fullViewModelSchema.methods.getContainerId = function() {
				return 'autoGeneratedLeftContainer';
			};
			fullViewModelSchema.methods.GetConfigFromExt = function(extElement) {
				if (!extElement.hasOwnProperty('initialConfig')) {
					return {};
				}
				var config = extElement.initialConfig;
				if (extElement.hasOwnProperty('bindings')) {
					for (var binding in extElement.bindings) {
						config[binding] = {
							bindTo: extElement.bindings[binding].modelItem
						};
					}
				}
				var itemsConfigs = [];
				var scope = this;
				if (extElement.hasOwnProperty('items')) {
					Terrasoft.each(extElement.items.items, function(item) {
						itemsConfigs[itemsConfigs.length] = scope.GetConfigFromExt(item);
					});
				}
				if (itemsConfigs.length) {
					config.items = itemsConfigs;
				}
				return config;
			};
			fullViewModelSchema.methods.getCurrentColumnInfo = function() {
				var currentElement = this.getCurrentElement();
				if (Ext.isEmpty(currentElement)) {
					return null;
				}
				return this.getElementByName(currentElement.itemName);
			};
			fullViewModelSchema.methods.addColumn = function(columnName) {
				var column = this.entitySchema.columns[columnName];
				var columnConfig = this.getNewColumnConfig(columnName, columnName,
					Terrasoft.DataValueType.TEXT, column.caption);
				this.addLeadColumn(Terrasoft.deepClone(columnConfig));
				this.set(this.getColumnAddItemEnabledPropertyName(columnName), false);
				this.addNewColumn(columnName, columnConfig, columnConfig.EditStructureContainerId);
			};
			fullViewModelSchema.methods.editColumn = function() {
				var item = Terrasoft.deepClone(this.getCurrentColumnInfo());
				var config = {
					config: item,
					entitySchema: this.entitySchema,
					changeColumns: []
				};
				var handler = function(args) {
					this.editLeadColumn(this.getNewColumnConfig(args.itemConfig.name,
						args.itemConfig.columnPath, args.itemConfig.dataValueType, args.itemConfig.caption,
						args.itemConfig.isRequired, args.itemConfig.EditStructureContainerId));
					var Id = this.getCurrentElement().containerId;
					this.setCurrentElement({
						itemName: args.itemConfig.name,
						containerId: Id
					});
				};
				this.OpenColumnPage(config, handler);
			};
			fullViewModelSchema.methods.getIsInEditMode = function() {
				return (fullViewModelSchema.action !== 'view');
			};
			fullViewModelSchema.methods.getIsNotInEditMode = function() {
				return (fullViewModelSchema.action === 'view');
			};
			fullViewModelSchema.methods.getRecommendationIsVisible = function() {
				var schemaLeadColumns = this.get('Columns');
				return (fullViewModelSchema.action !== 'view') || (schemaLeadColumns.getItems().length === 0);
			};
			fullViewModelSchema.methods.getRecommendationCaption = function() {
				var schemaLeadColumns = this.get('Columns');
				if (schemaLeadColumns.getItems().length === 0) {
					return resources.localizableStrings.NeedConfigureFormFieldsMessage;
				} else {
					return resources.localizableStrings.SettingsHintMessage;
				}
			};
			fullViewModelSchema.methods.highlightFirst = function() {
				var schemaLeadColumns = this.get('Columns');
				if (schemaLeadColumns.getCount() > 0) {
					var firstElement = schemaLeadColumns.getByIndex(0);
					if (firstElement && this.getIsInEditMode()) {
						this.setCurrentElement({
							itemName: firstElement.name,
							containerId: firstElement.EditStructureContainerId
						});
					}
				}
			};
			Ext.apply(config, fullViewModelSchema.methods);
			config.entitySchemaInfo =  fullViewModelSchema.entitySchemaInfo;
			return config;
		}
		return {
			generate: generate
		};
	});