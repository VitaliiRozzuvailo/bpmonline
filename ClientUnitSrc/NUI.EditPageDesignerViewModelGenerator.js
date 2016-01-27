define('EditPageDesignerViewModelGenerator', ['ext-base', 'terrasoft', 'EditPageModification',
	'EditPageDesignerViewModelGeneratorResources', 'EditPageDesignerViewGenerator', 'ConfigurationEnums', 'ColumnHelper'],
	function(Ext, Terrasoft, EditPageModification,
			 resources, viewGenerator, ConfigurationEnums, ColumnHelper) {
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
			fullViewModelSchema.methods.showErrorMessage = function(error) {
				//.replace('#Error#', error)
				this.showInformationDialog(
					resources.localizableStrings.SaveErrorMessage, void(0), {}, this);
			};
			fullViewModelSchema.methods.showSuccessMessage = function() {
				this.showInformationDialog(
					resources.localizableStrings.SaveSuccessMessage, function() {
						window.location.reload();
					}, {}, this);

			};
			fullViewModelSchema.methods.insertModifications = function() {
				var query = Ext.create('Terrasoft.InsertQuery', {
					rootSchemaName: 'EditPageModification'
				});
				var columnValues = query.columnValues;
				columnValues.clear();
				var modificationList = Ext.JSON.encode(this.get('ModificationsList').getItems());
				columnValues.setParameterValue('EditPageName', this.name, Terrasoft.DataValueType.TEXT);
				columnValues.setParameterValue('SerializedData', modificationList, Terrasoft.DataValueType.TEXT);
				query.execute(this.onSave, this);
			};
			fullViewModelSchema.methods.onSave = function(result) {
				if (result.success) {
					this.UpdateSchema(function() {
						this.showSuccessMessage();
					}, this);
				} else {
					this.showErrorMessage(result.error);
				}
			};

			fullViewModelSchema.methods.BlockPopup = function() {
				this.showInformationDialog(
					resources.localizableStrings.CompilingMessage, void(0), {buttons: []}, this);
				//this.set('blockElementVisible', true);
			};
			fullViewModelSchema.methods.ShowBlockPopup = function() {
				this.showInformationDialog(
					resources.localizableStrings.CompilingMessage, void(0), {buttons: []}, this);
				//this.set('blockElementVisible', true);
			};
			fullViewModelSchema.methods.save = function(isValid) {
				this.ShowBlockPopup();
				var entitySchemaId = this.entitySchema.uId;
				var changedColumns = this.get('NewColumns').getItems();
				var saveFunction = function(responce) {
					if (!responce.success) {
						this.showErrorMessage(responce.error);
						return;
					}
					var select = Ext.create('Terrasoft.EntitySchemaQuery', {
						rootSchema: EditPageModification
					});
					select.rowCount = 1;
					select.addColumn('Id');
					select.addColumn('SerializedData');
					select.addColumn('EditPageName');
					select.filters.add('filterModifications', Terrasoft.createColumnFilterWithParameter(
						Terrasoft.ComparisonType.EQUAL, 'EditPageName', this.name));
					select.getEntityCollection(function(result) {
						if (result.success && result.collection.getCount()) {
							var item = result.collection.getByIndex(0);
							var modificationList = Ext.JSON.encode(this.get('ModificationsList').getItems());
							item.columns.SerializedData.type = Terrasoft.ViewModelColumnType.ENTITY_COLUMN;
							item.set('SerializedData', modificationList, Terrasoft.DataValueType.TEXT);
							item.saveEntity(this.onSave, this);
						} else {
							this.insertModifications();
						}
					}, this);
				};
				if (changedColumns.length > 0) {
					ColumnHelper.ApplyChange(entitySchemaId, changedColumns, saveFunction, this);
				} else {
					saveFunction.call(this, ({success: true}));
				}


			};
			fullViewModelSchema.methods.getVisible = function() {
				return true;
			};
			fullViewModelSchema.methods.onDetailCollapsedChanged = function() {};
			fullViewModelSchema.methods.loadVocabulary = function() {};
			fullViewModelSchema.methods.getHeader = function() {
				return this.entitySchema.caption;
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
			fullViewModelSchema.methods.moveField = function(offset) {
				this.putPositionModification(offset);
			};
			fullViewModelSchema.methods.upField = function() {
				this.moveField(-1);
			};
			fullViewModelSchema.methods.downField = function() {
				this.moveField(1);
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
			},
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
			fullViewModelSchema.methods.skipAction = function(action, element) {
				return element.type === Terrasoft.ViewModelSchemaItem.DETAIL && action.tag === 'edit';
			};
			fullViewModelSchema.methods.renderRowActions = function(renderTo, tag) {
				var itemActions = Ext.clone(this.get('activeItemActions'));
				var self = this;
				var result = this.findElementByNameModification(tag);
				if (Ext.isEmpty(result)) {
					return null;
				}
				var itemContainer = result.ContainerPath.pop();
				var element = itemContainer.items[result.index];
				for (var i = 0, c = itemActions.length; i < c; i += 1) {
					var action = itemActions[i];
					if (this.skipAction(action, element)) {
						continue;
					}
					action.renderTo = renderTo;
					action.handler = function() {
						self.onActionItemClick(this.tag, tag);
					};
					var actionItem = Ext.create(action.className, action);
					if (this.collection) {
						actionItem.bind(self);
					}

					//this.actionItems.push(actionItem); for destroyElements
				}
			};
			fullViewModelSchema.methods.onActionItemClick = function(event, tag) {
				switch (event) {
					case 'upField':
						this.upField();
						break;
					case 'downField':
						this.downField();
						break;
					case 'moveLeft':
						this.moveLeft();
						break;
					case 'moveRight':
						this.moveRight();
						break;
					case 'edit':
						this.editColumn();
						break;
					case 'hide':
						this.hideColumn();
						break;
				}
			};
			fullViewModelSchema.methods.getNewColumnConfig = function(columnPath, dataType) {
				return {
					type: Terrasoft.ViewModelSchemaItem.ATTRIBUTE,
					name: columnPath,
					columnPath: columnPath,
					dataValueType: dataType,
					visible: true
				};
			};
			fullViewModelSchema.methods.removeElementFromContainer = function(elementName, reRender) {
				var element = Ext.getCmp(elementName.containerId);
				var result = this.findElementByNameModification(elementName);
				var prevContainer = result.ContainerPath.pop();
				var prevContainerId = this.getContainerId(prevContainer);
				var extCmpPrevContainer = Ext.getCmp(prevContainerId);
				var config = this.GetConfigFromExt(element);
				extCmpPrevContainer.remove(element);
				element.destroy();
				if (reRender) {
					extCmpPrevContainer.reRender();
				}
				return {
					container: extCmpPrevContainer,
					config: prevContainer,
					index: result.visibleIndex
				};
			};
			fullViewModelSchema.methods.addElementToContainer = function(container, elementConfig, index) {
				var elementCopy = Ext.create(elementConfig.className, elementConfig);
				elementCopy.bind(this);
				container.items.insert(typeof index === 'undefined' ? 0 : index, elementCopy);
				container.reRender();

			};
			fullViewModelSchema.methods.moveToContainer = function(itemContainer, visibleIndex, index) {
				var currentElement = this.getCurrentElement();
				if (Ext.isEmpty(currentElement)) {
					return;
				}
				var element = Ext.getCmp(currentElement.containerId);
				var config = this.GetConfigFromExt(element);
				var extCmpContainer = this.removeElementFromContainer(currentElement, !Ext.isEmpty(itemContainer));
				if (!Ext.isEmpty(itemContainer)) {
					var containerId = this.getContainerId(itemContainer);
					extCmpContainer.container = Ext.getCmp(containerId);
				}
				this.addElementToContainer(extCmpContainer.container, config, visibleIndex);
				this.highlightContainer(currentElement);
				this.insertModification({
					type: 'move',
					name: currentElement.itemName,
					position: index,
					containerName: Ext.isEmpty(itemContainer) ? extCmpContainer.config.name : itemContainer.name
				}, {
					containerId: currentElement.containerId,
					contContainerId: itemContainer ? itemContainer.EditStructureContainerId : null
				});
			};
			fullViewModelSchema.methods.isInMainContainer = function(containerName) {
				var currentElement = this.getCurrentElement();
				if (Ext.isEmpty(currentElement)) {
					return false;
				}
				var result = this.findElementByNameModification(currentElement);
				if (Ext.isEmpty(result)) {
					return false;
				}
				var mainContainer = result.ContainerPath.shift();
				if (mainContainer.name === containerName) {
					return true;
				}
			};
			fullViewModelSchema.methods.moveRight = function() {
				var containerName = 'rightPanel';
				if (this.isInMainContainer(containerName)) {
					return;
				}
				this.moveToContainer({ name: containerName });
			};

			fullViewModelSchema.methods.moveLeft = function() {
				var containerName = 'leftPanel';
				if (this.isInMainContainer(containerName)) {
					return;
				}
				this.moveToContainer({ name: containerName });
			};
			fullViewModelSchema.methods.hideColumn = function() {
				var currentElement = this.getCurrentElement();
				if (Ext.isEmpty(currentElement)) {
					return;
				}
				var isDelete = false;
				var newColumns =  this.get('NewColumns');
				var elements = newColumns.filterByFn(function(item, key) {
					return (item.name === currentElement.itemName);
				});
				Terrasoft.each(elements.getItems(), function(el) {
					newColumns.removeByKey(el.uId);
					isDelete = true;
				});
				Ext.getCmp(currentElement.containerId).destroy();
				this.setCurrentElement(null);
				this.insertModification({
					type: isDelete ? 'delete' : 'hide',
					name: currentElement.itemName
				}, {
					containerId: currentElement.containerId
				});

			};
			fullViewModelSchema.methods.isContainer = function(element) {
				return element.type === Terrasoft.ViewModelSchemaItem.GROUP;
			};
			fullViewModelSchema.methods.isDetail = function(element) {
				return element.type === Terrasoft.ViewModelSchemaItem.DETAIL;
			};
			fullViewModelSchema.methods.isColumn = function(element) {
				return !Ext.isEmpty(element.columnPath);
			};

			fullViewModelSchema.methods.getContainerVisibleItemsCount = function(element) {
				var items = element.items;
				var visibleCount = 0;
				for (var i = 0; i < items.length; i++) {
					if (items[i].visible !== false) {
						visibleCount++;
					}
				}
				return visibleCount;
			};
			fullViewModelSchema.methods.getContainerId = function(item) {
				if (this.isContainer(item)) {
					return 'fieldGroupContainer-' + item.name;
				}
				if (this.isDetail(item)) {
					return 'fieldDetailContainer-' + item.name;
				}
				switch (item.name) {
					case 'leftPanel':
						return 'autoGeneratedLeftContainer';
					case 'rightPanel':
						return 'autoGeneratedRightContainer';
					case 'customPanel':
						return 'autoGeneratedCustomContainer';
				}

			};
			fullViewModelSchema.methods.putPositionModification = function(offset) {
				var currentElement = this.getCurrentElement();
				if (Ext.isEmpty(currentElement)) {
					return;
				}
				var result = this.findElementByNameModification(currentElement);
				if (Ext.isEmpty(result)) {
					return;
				}
				var useDifContainer = false;
				var itemContainer = result.ContainerPath.pop();
				var index = result.index;
				var visibleIndex = result.visibleIndex;
				var increment = offset > 0 ? -1 : 1;
				var containerItems = itemContainer.items;
				var element = null;
				while (offset !== 0 && (index - increment) < containerItems.length + 1 && (index - increment) >= -1) {
					index -= increment;
					if (index >= containerItems.length || index < 0 || visibleIndex - increment < 0) {
						useDifContainer = true;
						var previousContainerName = itemContainer.name;
						itemContainer = result.ContainerPath.pop();
						if (!itemContainer) {
							break;
						}
						element = itemContainer;
						containerItems = element.items;
						index = 0;
						visibleIndex = 0;
						for (var i = 0; i < containerItems.length; i++)
						{
							if (containerItems[i].name === previousContainerName) {
								index -= increment;
								visibleIndex++;
								break;
							}
							index++;
							if (containerItems[i].visible !== false) {
								visibleIndex++;
							}
						}
						element = containerItems[index];
						if (index === -1) {
							element = containerItems[0];
						}
						if (increment > 0) {
							index += increment;
						}
						if (!element || !itemContainer) {
							break;
						}
						var visibleElementsCount = this.getContainerVisibleItemsCount(itemContainer);
						if (element.visible !== false
							|| visibleIndex - increment === 0
							|| visibleIndex === visibleElementsCount) {
							if (increment > 0) {
								visibleIndex -= increment;
							}
							offset += increment;
						} else {
							if (increment < 0) {
								visibleIndex += increment;
							}
						}
						continue;
					} else {
						element = containerItems[index];
						while (element.visible === false && index < containerItems.length - 1 && index > 0) {
							element = containerItems[index -= increment];
						}
					}
					if (this.isContainer(element)) {
						useDifContainer = true;
						index = increment > 0 ? element.items.length : -1;
						visibleIndex = increment > 0 ? this.getContainerVisibleItemsCount(element) + 1 : -1;
						result.ContainerPath.unshift(itemContainer);
						itemContainer = element;
						containerItems = element.items;
						element = containerItems[index - increment];
						if (!element) {
							element = { visible: true };
						}
						if (increment < 0) {
							index -= increment;
						}
					}
					var visibleElementsCount = this.getContainerVisibleItemsCount(itemContainer);

					if (element.visible !== false
						|| visibleIndex - increment === 0
						|| visibleIndex === visibleElementsCount) {
						visibleIndex -= increment;
						offset += increment;
					}
				}
				if (!itemContainer) {
					return;
				}
				if (useDifContainer) {
					this.moveToContainer(itemContainer, visibleIndex, index);

				} else {
					this.moveToContainer(null, visibleIndex, index);

				}
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
			fullViewModelSchema.methods.openEditGroupPopup = function(callback, groupValue, inNew) {
				var caption = inNew ? resources.localizableStrings.NewGroupInputBoxCaption :
					resources.localizableStrings.ExistingGroupInputBoxCaption;
				Terrasoft.utils.inputBox(
					caption,
					callback,
					['ok', 'cancel'],
					this,
					{
						name: {
							dataValueType: Terrasoft.DataValueType.TEXT,
							caption: resources.localizableStrings.GroupNameInputTitle,
							value: groupValue
						}
					},
					{
						defaultButton: 0,
						classes: {
							coverClass: ['cover-calss1', 'cover-calss2'],
							captionClass: ['caption-calss1', 'caption-calss2']
						}
					}
				);
			};
			fullViewModelSchema.methods.generateGroup = function(groupConfig, index, containerConfig) {
				var voidContainer = {
					items: []
				};
				viewGenerator.generateView(
					voidContainer,
					[groupConfig],
					{},
					ConfigurationEnums.CardState.EditStructure,
					this.entitySchema
				);
				var containerId = this.getContainerId({ name: this.getAddContainerName() });
				if (containerConfig) {
					containerId = this.getContainerId(containerConfig);
				}
				var container = Ext.getCmp(containerId);
				this.addElementToContainer(container, voidContainer.items[0], index);
			};
			fullViewModelSchema.methods.updateGroup = function(groupConfig) {
				var currentItemValue = {
					itemName: groupConfig.name,
					containerId: groupConfig.EditStructureContainerId
				};
				var extCmpContainer = this.removeElementFromContainer(currentItemValue, false);
				this.generateGroup(groupConfig, extCmpContainer.index, extCmpContainer.config);
				this.setCurrentElement(currentItemValue);
			};
			fullViewModelSchema.methods.getAddContainerName = function() {
				return 'leftPanel';
			};
			fullViewModelSchema.methods.addGroup = function() {
				var callback = function(returnCode, controlData) {
					if (returnCode === 'ok' && controlData.name.value) {
						var groupCaption = controlData.name.value;
						var groupName = Terrasoft.generateGUID();
						var columnConfig = {
							type: Terrasoft.ViewModelSchemaItem.GROUP,
							name: groupName,
							visible: true,
							caption: groupCaption,
							collapsed: false,
							items: []
						};
						var Id = Terrasoft.generateGUID();
						var idConfig = {
							EditStructureContainerId: Id
						};
						this.insertModification({
							type: 'add',
							value: Terrasoft.deepClone(columnConfig),
							containerName: this.getAddContainerName(),
							position: 0
						}, {
						}, idConfig);
						Ext.apply(columnConfig, idConfig);
						this.generateGroup(columnConfig);
						this.setCurrentElement({
							itemName: columnConfig.name,
							containerId: Id
						});
					}
				};
				this.openEditGroupPopup(callback, null, true);
			};
			fullViewModelSchema.methods.addNewColumn = function(tag) {
				var config = {
					type: tag,
					entitySchema: this.entitySchema,
					changeColumns: this.get('NewColumns').getItems()
				};
				var handler = function(args) {
					this.get('NewColumns').add(args.entityColumn.uId, args.entityColumn);
					var value = Terrasoft.deepClone(args.itemConfig);
					value.isDesigner = true;
					var Id = Terrasoft.generateGUID();
					this.insertModification({
						type: 'add',
						value: value,
						containerName: this.getAddContainerName(),
						position: 0
					}, {
						uId: args.entityColumn.uId
					}, {
						EditStructureContainerId: Id
					});

					this.setCurrentElement({
						itemName: args.itemConfig.name,
						containerId: Id
					});

				};
				this.OpenColumnPage(config, handler);
			};
			fullViewModelSchema.methods.getCurrentColumnInfo = function() {
				var currentElement = this.getCurrentElement();
				if (Ext.isEmpty(currentElement)) {
					return null;
				}
				var result = this.findElementByNameModification(currentElement);
				if (Ext.isEmpty(result)) {
					return null;
				}
				var itemContainer = result.ContainerPath.pop();
				return itemContainer.items[result.index];
			};
			fullViewModelSchema.methods.editColumn = function() {
				var item = Terrasoft.deepClone(this.getCurrentColumnInfo());
				if (this.isContainer(item)) {
					var callback = function(returnCode, controlData) {
						if (returnCode === 'ok' && controlData.name.value) {
							var columnConfig = Terrasoft.deepClone(item);
							columnConfig.caption = controlData.name.value;
							this.insertModification({
								type: 'modify',
								value: Terrasoft.deepClone(columnConfig),
								name: item.name
							});
							Ext.apply(columnConfig, {EditStructureContainerId: this.getCurrentElement().containerId});
							this.updateGroup(columnConfig);
						}
					};
					this.openEditGroupPopup(callback, item.caption, false);
					return;
				}
				if (this.isColumn(item)) {
					var config = {
						config: item,
						entitySchema: this.entitySchema,
						changeColumns: this.get('NewColumns').getItems()
					};
					var handler = function(args) {
						var prevName = args.itemConfig.name;
						var newColumns = this.get('NewColumns');
						if (newColumns.contains(args.entityColumn.uId)) {
							var columnConfig = newColumns.get(args.entityColumn.uId);
							prevName  = columnConfig.name;
							Ext.apply(columnConfig, args.entityColumn);
						} else {
							prevName  = args.entityColumn.name;
							newColumns.add(args.entityColumn.uId, args.entityColumn);
						}
						var Id = this.getCurrentElement().containerId;
						this.insertModification({
							type: 'modify',
							value: Terrasoft.deepClone(args.itemConfig),
							name: prevName
						}, {EditStructureContainerId: Id});
						this.setCurrentElement({
							itemName: args.itemConfig.name,
							containerId: Id
						});

					};
					this.OpenColumnPage(config, handler);
					return;
				}
			};
			fullViewModelSchema.methods.addColumn = function() {
				var config = {
					useBackwards: false,
					firstColumnsOnly: true,
					schemaName: this.entitySchema.name
				};
				var handler = function(args) {
					var columnConfig = this.getNewColumnConfig(args.leftExpressionColumnPath, args.dataValueType);
					var value = Terrasoft.deepClone(columnConfig);
					value.isDesigner = true;
					var findResult = this.findElementByNameModification({itemName: columnConfig.name});
					var Id = Terrasoft.generateGUID();
					if (Ext.isEmpty(findResult)) {
						this.insertModification({
							type: 'add',
							value: value,
							containerName: this.getAddContainerName(),
							position: 0
						}, {

						}, {
							EditStructureContainerId: Id
						});
					} else {
						var item = findResult.container[findResult.index];
						if (!item.visible) {
							this.insertModification({
								type: 'add',
								value: value
							});
						}
						Id = item .EditStructureContainerId
					}
					this.setCurrentElement({
						itemName: columnConfig.name,
						containerId: Id
					});

				};
				this.OpenStructureExplorer(config, handler);
			};
			Ext.apply(config, fullViewModelSchema.methods);
			config.entitySchemaInfo =  fullViewModelSchema.entitySchemaInfo;
			return config;
		}
		return {
			generate: generate
		};

	});


