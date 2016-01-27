define('CardViewGenerator', ['ext-base', 'terrasoft', 'BusinessRuleModule', 'CardViewGeneratorResources',
	'ActionUtilitiesModule', 'ConfigurationEnums', 'GridUtilities', 'NetworkUtilities', 'CardViewGeneratorResources'],
	function(Ext, Terrasoft, BusinessRuleModule, Resources, actionUtilities, ConfigurationEnums, GridUtilities,
		NetworkUtilities, resources) {

		Ext.define('Terrasoft.Configuration.CardViewGenerator', {
			alternateClassName: 'Terrasoft.CardViewGenerator',
			extend: 'Terrasoft.BaseObject',

			createAdvancedButton: false,
			itemCollapsed: false,
			entitySchema: null,
			idGenerator: null,
			containerIdGenerator: null,
			instancePrefix: '',

			getFullViewModelSchema: function(sourceViewModelSchema) {
				return Terrasoft.deepClone(sourceViewModelSchema);
			},

			getVisible: function(item, type) {
				var displayValue = Terrasoft.getTypedStringValue(item, type);
				return !Ext.isEmpty(displayValue);
			},

			isEditCheckBox: function(action, dataValueType) {
				return ((dataValueType === Terrasoft.DataValueType.BOOLEAN) && (this.isEdit(action)));
			},

			isEditImage: function(action, dataValueType) {
				return ((dataValueType === Terrasoft.DataValueType.IMAGE) && (this.isEdit(action)));
			},

			isHtmlControl: function(schemaItem) {
				return schemaItem.customConfig &&
					((schemaItem.customConfig.className === 'Terrasoft.controls.HtmlEdit') ||
						(schemaItem.customConfig.className === 'Terrasoft.controls.HtmlControl'));
			},

			isEdit: function(action) {
				return ((action === ConfigurationEnums.CardState.Edit) ||
					(action === ConfigurationEnums.CardState.Add) ||
					(action === ConfigurationEnums.CardState.Copy) ||
					(action === ConfigurationEnums.CardState.EditStructure));
			},

			isElementNotVisible: function(action, schemaItem) {
				var edit = (action !== ConfigurationEnums.CardState.View);
				return ((edit && (schemaItem.visible === false)) || (!edit && (schemaItem.viewVisible === false)));
			},

			converterTypeForBinding: function(type) {
				return (type === Terrasoft.DataValueType.ENUM) ? Terrasoft.DataValueType.LOOKUP : type;
			},

			generateLabelBindings: function(action, schemaItem, schemaItemBindings) {
				var bindings = {};
				if (action === ConfigurationEnums.CardState.View) {
					if (schemaItem.type === Terrasoft.ViewModelSchemaItem.ATTRIBUTE) {
						var converter = this.getVisible;
						if ((action === ConfigurationEnums.CardState.View) &&
							(schemaItem.columnType === Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN)) {
							var self = this;
							converter = function(item) {
								return self.getVisible(item, self.converterTypeForBinding(schemaItem.dataValueType));
							};
						}
						bindings.visible = {
							bindTo: schemaItem.name,
							bindConfig: {
								converter: converter
							}
						};
					}
				} else {
					if (schemaItemBindings && schemaItemBindings.hasOwnProperty('visible')) {
						bindings.visible = schemaItemBindings.visible;
					}
				}
				return bindings;
			},

			getLabelCaption: function(schemaItem) {
				switch (schemaItem.type) {
					case Terrasoft.ViewModelSchemaItem.ATTRIBUTE:
						var entitySchemaColumn = this.entitySchema.getColumnByName(schemaItem.name);
						if (!Ext.isEmpty(schemaItem.caption)) {
							return schemaItem.caption;
						}
						else if (!Ext.isEmpty(entitySchemaColumn)) {
							return entitySchemaColumn.caption;
						}
						break;
					case Terrasoft.ViewModelSchemaItem.METHOD:
						return schemaItem.caption;
				}
			},

			getValueLabelConfig: function(schemaItem, bindings, labelType, action) {
				var labelConfig = this.getLabelConfig(schemaItem, bindings, labelType, action);
				var labelId = schemaItem.name + 'ValueControlLabel' + this.instancePrefix;
				var columnPath = schemaItem.columnPath;
				var converter = function(value, type) {
					if ((action === ConfigurationEnums.CardState.View) && (type === Terrasoft.DataValueType.TEXT) &&
						NetworkUtilities.isUrl(value)) {
						var element = Ext.getCmp(labelId);
						element.labelClass += ' label-link label-ulr';
					}
					if (action === ConfigurationEnums.CardState.View && (type === Terrasoft.DataValueType.FLOAT ||
						type === Terrasoft.DataValueType.MONEY)) {
						var config = {};
						var entitySchemaColumn = this.entitySchema.getColumnByName(schemaItem.name);
						var precision = entitySchemaColumn.precision;
						if (!Ext.isEmpty(precision)) {
							config.decimalPrecision = precision;
							config.type = type;
							return Terrasoft.getFormattedNumberValue(value, config);
						}
					}
					return Terrasoft.getTypedStringValue(value, type);
				};
				if ((action === ConfigurationEnums.CardState.View) &&
					(schemaItem.columnType === Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN)) {
					var self = this;
					converter = function(item) {
						return Terrasoft.getTypedStringValue(item,
							self.converterTypeForBinding(schemaItem.dataValueType));
					};
				}

				Ext.apply(labelConfig, {
					id: labelId,
					caption: {
						bindTo: schemaItem.name,
						bindConfig: {
							converter: schemaItem.valueLabelConverter || converter
						}
					}
				});
				if (schemaItem.type === Terrasoft.ViewModelSchemaItem.ATTRIBUTE) {
					var index = labelConfig.classes.labelClass.indexOf("required-caption");
					if (index !== -1) {
						labelConfig.classes.labelClass.splice(index, 1);
					}
				}

				if (action === ConfigurationEnums.CardState.View &&
					schemaItem.dataValueType === Terrasoft.DataValueType.TEXT) {
					labelConfig.click = {bindTo: 'onUrlClick'};
					labelConfig.tag = columnPath;
				}

				if (this.entitySchema && this.entitySchema.name && Terrasoft[this.entitySchema.name]) {
					var columns = Terrasoft[this.entitySchema.name].columns;
					if (columns && columnPath) {
						var column = columns[columnPath];
						if (column && column.isLookup && column.referenceSchemaName) {
							var schemaName = column.referenceSchemaName;
							var moduleStructure = Terrasoft.configuration.ModuleStructure[schemaName];
							if (moduleStructure) {
								var labelClass = labelConfig.classes.labelClass || [];
								labelClass.push('label-link');
								labelConfig.classes.labelClass = labelClass;
								labelConfig.click = {bindTo: 'onLabelLinkClick'};
								labelConfig.tag = columnPath;
							}
						}
					}
				}
				return labelConfig;
			},

			getLabelConfig: function(schemaItem, bindings, labelType, action) {
				var schemaItemBindings = bindings[schemaItem.name];
				var labelBindings = this.generateLabelBindings(action, schemaItem, schemaItemBindings);
				var caption, width;
				var labelClass = [];
				if (schemaItem.labelClass) {
					labelClass.push(schemaItem.labelClass);
				} else if (labelType === 'right') {
					labelClass.push('right-label-left-panel');
					width = schemaItem.rightWidth;
				} else if (labelType === 'left') {
					labelClass.push('left-label-left-panel');
					width = schemaItem.leftWidth;
				} else {
					labelClass.push('controlCaption');
				}
				var entitySchemaColumn = this.entitySchema.getColumnByName(schemaItem.name);
				if ((action !== ConfigurationEnums.CardState.View) && entitySchemaColumn &&
					entitySchemaColumn.isRequired || schemaItem.isRequired) {
					labelClass.push("required-caption");
				}
				caption = this.getLabelCaption(schemaItem);
				var labelId = schemaItem.name + 'ControlLabel' + this.instancePrefix;
				var labelConfig = {
					id: labelId,
					className: 'Terrasoft.Label',
					caption: caption || '',
					markerValue: schemaItem.name,
					visible: true,
					classes: {
						labelClass: labelClass
					}
				};
				Ext.apply(labelConfig, labelBindings);
				if (schemaItem.captionLabelCustomConfig) {
					Ext.apply(labelConfig, schemaItem.captionLabelCustomConfig);
				}
				if (schemaItem.labelCustomConfig &&
					((action === ConfigurationEnums.CardState.View || schemaItem.labelCustomConfigModes) &&
						(schemaItem.labelCustomConfigModes.indexOf(action) !== -1))) {
					Terrasoft.each(schemaItem.labelCustomConfig.classes, function(item) {
						labelClass.push(item);
					}, this);
					if (schemaItem.labelCustomConfig.visible) {
						labelConfig.visible = schemaItem.labelCustomConfig.visible;
					}
				}
				if (width) {
					labelConfig.width = width;
				}
				if (schemaItem.usePlaceholder && action !== ConfigurationEnums.CardState.View) {
					labelConfig.visible = false;
					schemaItem.placeholderCaption = labelConfig.caption;
				}
				return labelConfig;
			},

			getControlConfig: function(schemaItem, bindings, action) {
				var controlConfig;
				if (!this.isHtmlControl(schemaItem) && (action === ConfigurationEnums.CardState.View)) {
					return this.getValueLabelConfig(schemaItem, bindings, 'right', ConfigurationEnums.CardState.View);
				}
				var additionalConfig = {
					classes: {
						wrapClass: 'controlBaseedit'
					}
				};
				if (schemaItem.type === Terrasoft.ViewModelSchemaItem.METHOD) {
					if (Ext.isEmpty(schemaItem.customItem)) {
						additionalConfig.readonly = true;
					}
				} else {
					var entitySchemaColumn = this.entitySchema.getColumnByName(schemaItem.name);
					if (!Ext.isEmpty(entitySchemaColumn)) {
						if (entitySchemaColumn.isRequired === true &&
							(entitySchemaColumn.dataValueType !== Terrasoft.DataValueType.DATE_TIME)) {
							additionalConfig.isRequired = true;
						}
						if (entitySchemaColumn.readonly === true) {
							additionalConfig.readonly = true;
						}
						var precision = entitySchemaColumn.precision;
						if (!Ext.isEmpty(precision) &&
							((entitySchemaColumn.dataValueType === Terrasoft.DataValueType.FLOAT) ||
								(entitySchemaColumn.dataValueType === Terrasoft.DataValueType.MONEY))) {
							additionalConfig.decimalPrecision = precision;
						}
					} else if (!Ext.isEmpty(schemaItem.columnPath) && (schemaItem.columnPath.indexOf('.') !== -1)) {
						if (Ext.isEmpty(schemaItem.customConfig)) {
							schemaItem.customConfig = {};
						}
						schemaItem.customConfig.enabled = false;
					}
					if ((schemaItem.advancedVisible === true) && (action === ConfigurationEnums.CardState.Add)) {
						additionalConfig.visible = {
							bindTo: 'advancedVisible'
						};
						this.createAdvancedButton = true;
					} else {
						this.itemCollapsed = false;
					}
				}
				controlConfig = Terrasoft.getControlConfigByDataValueType(schemaItem.dataValueType);
				Ext.apply(controlConfig, additionalConfig, {markerValue: schemaItem.name});
				this.applyBindingsConfig(controlConfig, schemaItem, bindings);
				var customConfig = Terrasoft.deepClone(schemaItem.customConfig);
				if (action === ConfigurationEnums.CardState.View) {
					customConfig.enabled = false;
					if ((customConfig.className === 'Terrasoft.controls.HtmlEdit') && schemaItem.customItem) {
						customConfig = {
							id: customConfig.id,
							className: 'Terrasoft.controls.HtmlControl'
						};
					}
				}
				if (!Ext.isEmpty(customConfig)) {
					Ext.apply(controlConfig, customConfig);
				}
				if (schemaItem.usePlaceholder &&
					(action !== ConfigurationEnums.CardState.View) &&
					(schemaItem.dataValueType !== Terrasoft.DataValueType.DATE_TIME)) {
					controlConfig.placeholder = schemaItem.placeholder || schemaItem.placeholderCaption || '';
				}
				return controlConfig;
			},

			getImgConfig: function(schemaItem) {
				return {
					className: 'Terrasoft.ImageEdit',
					imageSrc: {bindTo: schemaItem.getSrcMethod},
					defaultImageSrc: schemaItem.defaultImage,
					change: {bindTo: schemaItem.onPhotoChange},
					styles: {
						wrapStyles: {
							marginTop: '0px'
						}
					},
					readonly: true,
					visible: true
				};
			},

			getCustomLabelConfig: function(sourceEntitySchema, schemaItem, bindings, isValue, labelType, action) {
				this.init();
				this.entitySchema = sourceEntitySchema;
				if (isValue) {
					return this.getValueLabelConfig(schemaItem, bindings, labelType, action);
				}
				return this.getLabelConfig(schemaItem, bindings, labelType, action);
			},

			getCustomControlConfig: function(sourceEntitySchema, schemaItem, bindings, action) {
				this.init();
				this.entitySchema = sourceEntitySchema;
				return this.getControlConfig(schemaItem, bindings, action);
			},

			generateCustomView: function(container, columnsObject, bindings, action, sourceEntitySchema, info,
				useInfoButtons) {
				this.init();
				this.entitySchema = sourceEntitySchema;
				useInfoButtons = Ext.isEmpty(useInfoButtons) ? true : useInfoButtons;
				this.generateSchemaView({
					container: container,
					columnsObject: columnsObject,
					bindings: bindings,
					action: action,
					info: info,
					useInfoButtons: useInfoButtons
				});
			},

			getItemsContainerConfig: function(schemaItem, action) {
				var containerConfig = this.getContainerConfig(schemaItem.name, [schemaItem.wrapContainerClass]);
				containerConfig.items = [];
				var visibleValue = true;
				if (action === ConfigurationEnums.CardState.View) {
					visibleValue = {
						bindTo: schemaItem.name + 'GetVisible'
					};
				} else if ((action === ConfigurationEnums.CardState.Add) && schemaItem.advancedVisible) {
					visibleValue = {
						bindTo: 'advancedVisible'
					};
				}
				containerConfig.visible = visibleValue;
				return containerConfig;
			},

			generateAdvancedButton: function(containerConfig, createAdvancedButton, isGroup, itemCollapsed) {
				if (isGroup && createAdvancedButton) {
					containerConfig.collapsedchanged = {
						bindTo: 'showAllFields'
					};
					if (itemCollapsed) {
						containerConfig.collapsed = itemCollapsed;
					}
				} else if (createAdvancedButton) {
					var buttonConfig = GridUtilities.getLoadButtonConfig();
					buttonConfig.classes = {
						wrapperClass: 'show-all-btn-user-class'
					};
					buttonConfig.caption = resources.localizableStrings.ShowAllButtonCaption;
					buttonConfig.visible = {
						bindTo: 'advancedVisible',
						bindConfig: {
							converter: function(value) {
								return !value;
							}
						}
					};
					buttonConfig.click = {
						bindTo: 'showAllFields'
					};
					containerConfig.items.push(buttonConfig);
				}
			},

			generateCheckBoxContainer: function(labelConfig, controlConfig, name) {
				controlConfig.id = this.idGenerator.generate();
				labelConfig.inputId = controlConfig.id + '-el';
				var container = this.getContainerConfig(name + 'container', ['check-box-container']);
				container.visible = labelConfig.visible;
				labelConfig.labelClass = 't-label custom-label-container check-box-label-container';
				controlConfig.classes = {
					wrapClass: ['custom-control-container']
				};
				container.items.push(controlConfig, labelConfig);
				return container;
			},

			generateAttributeControls: function(schemaItem, config) {
				var returnItems = [];
				var labelType = null;
				var action = config.action;
				if (!this.isEdit(config.action)) {
					labelType = 'left';
					action = ConfigurationEnums.CardState.View;
				}
				var labelConfig = this.getLabelConfig(schemaItem, config.bindings, labelType, action);
				var controlConfig = this.getControlConfig(schemaItem, config.bindings, config.action);
				if (controlConfig.visible) {
					labelConfig.visible = controlConfig.visible;
				}
				if (this.isEditCheckBox(config.action, schemaItem.dataValueType)) {
					controlConfig = this.generateCheckBoxContainer(labelConfig, controlConfig, schemaItem.name);
				} else {
					if (schemaItem.captionVisible !== false) {
						returnItems.push(labelConfig);
					}
				}
				if (config.useInfoButtons && !Ext.isEmpty(schemaItem.info)) {
					var infoButtonWrapperClass = this.isEdit(config.action) ? false : ['control-info-button-view'];
					var infoButton = this.getInfoButton(schemaItem, infoButtonWrapperClass);
					if (controlConfig.visible) {
						infoButton.visible = controlConfig.visible;
					}
					var containerClasses = ['control-info-container'];
					if (this.isEditCheckBox(config.action, schemaItem.dataValueType)) {
						containerClasses = ['control-info-container-checkbox'];
					}
					if (this.isEdit(config.action)) {
						var containerConfig =
							this.getContainerConfig(schemaItem.name + '_InfoControlContainer', containerClasses);
						containerConfig.items = [controlConfig, infoButton];
						returnItems.push(containerConfig);
						return returnItems;
					} else {
						returnItems.push(controlConfig);
						returnItems.push(infoButton);
						return returnItems;
					}
				}
				returnItems.push(controlConfig);
				return returnItems;
			},

			generateRadioItemGroupConfig: function(schemaItem, radioConfig, config, action) {
				var itemId = schemaItem.name + '_item_' + Terrasoft.generateGUID();
				var radioConfigItems = radioConfig.items;
				var radioButtonItemsContainer;
				Terrasoft.each(radioConfigItems, function(item) {
					var usePlaceholder = schemaItem.usePlaceholder;
					item.usePlaceholder = (!Ext.isEmpty(usePlaceholder)) ? usePlaceholder : true;
				}, this);
				if (Ext.isArray(radioConfigItems) && (radioConfigItems.length > 0)) {
					var wrapClass = ['radio-itemgroup-container'];
					if (action === ConfigurationEnums.CardState.View) {
						wrapClass.push('radio-itemgroup-container-view');
					}
					radioButtonItemsContainer = this.getContainerConfig(itemId + '_container', wrapClass);
					if (!schemaItem.showControls) {
						radioButtonItemsContainer.visible = {
							bindTo: schemaItem.group,
							bindConfig: {
								converter: function(value) {
									return (radioConfig.tag === value);
								}
							}
						};
					}
					var itemConfig = Terrasoft.deepClone(config);
					Ext.apply(itemConfig, {
						container: radioButtonItemsContainer,
						columnsObject: radioConfigItems
					});
					this.generateSchemaView(itemConfig);
				}
				return radioButtonItemsContainer;
			},

			generateRadioItemConfig: function(schemaItem, radioConfig, config, action) {
				var itemId = schemaItem.name + '_item_' + Terrasoft.generateGUID();
				schemaItem.group = schemaItem.group || schemaItem.name;
				var radioButtonContainer = this.getContainerConfig(itemId, ['radio-item-container']);
				if (action === ConfigurationEnums.CardState.View) {
					radioButtonContainer.visible = false;
				} else {
					var bindVisible = radioConfig.visible;
					radioButtonContainer.visible = (!Ext.isEmpty(bindVisible) ? bindVisible : true);
				}
				var bindEnabled = radioConfig.enabled;
				radioButtonContainer.items = [{
					className: 'Terrasoft.RadioButton',
					tag: radioConfig.tag,
					checked: {
						bindTo: schemaItem.group || schemaItem.name
					},
					enabled: (!Ext.isEmpty(bindEnabled)) ? bindEnabled : true,
					markerValue: radioConfig.markerValue
				}, {
					className: 'Terrasoft.Label',
					caption: radioConfig.caption
				}];
				return radioButtonContainer;
			},

			generateItemsGroupView: function(schemaItem, config) {
				var action = config.action;
				var bindings = config.bindings;
				var itemContainerConfig = this.getItemsContainerConfig(schemaItem, action);
				var labelClass = [(action === ConfigurationEnums.CardState.View) ?
					'left-label-left-panel' : 'class-caption-' + schemaItem.name];
				var labelConfig = {
					caption: schemaItem.caption || '',
					className: 'Terrasoft.Label',
					classes: {
						labelClass: labelClass
					},
					id: 'caption-' + schemaItem.name + this.instancePrefix,
					selectors: {
						wrapEl: '#caption-' + schemaItem.name + this.instancePrefix
					}
				};
				var customConfig = Terrasoft.deepClone(schemaItem.customConfig || {});
				if (customConfig.labelClass || (customConfig.classes && customConfig.classes.labelClass)) {
					labelClass.push(customConfig.labelClass || customConfig.classes.labelClass);
				}
				Ext.apply(itemContainerConfig, customConfig);
				var schemaItemBindings = bindings[schemaItem.name] || {};
				var bindEnabled = (schemaItemBindings.enabled !== false);
				var schemaItemsContainer = schemaItem.items;
				var showLabel = schemaItem.showLabel;
				if (showLabel) {
					Terrasoft.each(schemaItemsContainer, function(item) {
						if ((item.viewVisible === false) && (action === ConfigurationEnums.CardState.View)) {
							return;
						}
						var itemLabelConfig = (this.isEdit(action)) ?
							this.getLabelConfig(item, bindings, null, action) :
							this.getLabelConfig(item, bindings, 'left', ConfigurationEnums.CardState.View);
						Ext.apply(item, itemLabelConfig);
						itemContainerConfig.items.push(itemLabelConfig);
					}, this);
				} else {
					itemContainerConfig.items.push(labelConfig);
				}
				Terrasoft.each(schemaItemsContainer, function(item) {
					if ((item.viewVisible === false) && (action === ConfigurationEnums.CardState.View)) {
						return;
					}
					var itemBindings = bindings[item.name] || {};
					if (itemBindings.enabled) {
						bindEnabled = itemBindings.enabled;
					}
					var itemCustomConfig = item.customConfig || {};
					if (itemCustomConfig.hasOwnProperty('enabled')) {
						bindEnabled = itemCustomConfig.enabled;
					}
					var lConfigContainer = {
						customConfig: {
							classes: {
								wrapClass: item.wrapClass || ''
							},
							id: item.name + this.instancePrefix,
							selectors: {
								wrapEl: '#' + item.name + this.instancePrefix
							},
							enabled: (bindEnabled !== false)
						}
					};
					Ext.apply(item, lConfigContainer);
					var controlConfig = this.getControlConfig(item, bindings, action);
					Ext.apply(item, controlConfig);
					itemContainerConfig.items.push(controlConfig);
				}, this);
				return itemContainerConfig;
			},

			generateImageSchemaItemView: function(schemaItem, action) {
				var imageConfig = this.getImgConfig(schemaItem);
				Ext.apply(imageConfig, {
					readonly: false,
					styles: {
						wrapStyles: {
							marginTop: '30px'
						}
					}
				});
				if (action === ConfigurationEnums.CardState.Add) {
					imageConfig.beforefileselected = {bindTo: schemaItem.beforefileselected};
				}
				return imageConfig;
			},

			generateRadioGroupSchemaItemView: function(schemaItem, config) {
				var action = config.action;
				schemaItem.id = schemaItem.name;
				var itemRadioContainerConfig = this.getItemsContainerConfig(schemaItem, action);
				itemRadioContainerConfig.visible = (schemaItem.visible !== false);
				var wrapClass = ['radio-group-container'];
				wrapClass.push(schemaItem.wrapContainerClass || '');
				if (action === ConfigurationEnums.CardState.View) {
					wrapClass.push('radio-group-container-view');
				}
				itemRadioContainerConfig.classes = {
					wrapClassName: wrapClass
				};
				Terrasoft.each(schemaItem.items, function(radioItem) {
					var radioItemContainer = this.generateRadioItemConfig(schemaItem, radioItem, config, action);
					var radioItemGroupConfig = this.generateRadioItemGroupConfig(schemaItem, radioItem, config, action);
					var customConfig = Terrasoft.deepClone(schemaItem.customConfig || {});
					Ext.apply(itemRadioContainerConfig, customConfig);
					itemRadioContainerConfig.items.push(radioItemContainer);
					if (!Ext.isEmpty(radioItemGroupConfig)) {
						itemRadioContainerConfig.items.push(radioItemGroupConfig);
					}
				}, this);
				return itemRadioContainerConfig;
			},

			generateGroupSchemaItemView: function(schemaItem, config, schema) {
				var action = config.action;
				var profile = config.profile;
				this.createAdvancedButton = false;
				this.itemCollapsed = true;
				var containerConfig = this.getGroupContainerConfig(schemaItem, action, profile, schema);
				if (schemaItem.leftWidth || schemaItem.rightWidth) {
					var schemaItems = schemaItem.items;
					var lConfig = {
						leftWidth: schemaItem.leftWidth,
						rightWidth: schemaItem.rightWidth
					};
					Terrasoft.each(schemaItems, function(item) {
						Ext.apply(item, lConfig);
					}, this);
				}
				var itemsConfig = Terrasoft.deepClone(config);
				Ext.apply(itemsConfig, {
					container: containerConfig,
					columnsObject: schemaItem.items
				});
				this.generateSchemaView(itemsConfig);
				this.generateAdvancedButton(containerConfig, this.createAdvancedButton, true, this.itemCollapsed);
				return containerConfig;
			},

			generateSchemaItemView: function(schemaItem, config, schema) {
				var action = config.action;
				var info = config.info;
				var schemaItemsConfigs = [];
				if (this.isEditImage(action, schemaItem.dataValueType)) {
					var imageConfig = this.generateImageSchemaItemView(schemaItem, action);
					schemaItemsConfigs.push(imageConfig);
				}
				switch (schemaItem.type) {
					case Terrasoft.ViewModelSchemaItem.ATTRIBUTE:
					case Terrasoft.ViewModelSchemaItem.METHOD:
						var controls = this.generateAttributeControls(schemaItem, config);
						Ext.Array.push(schemaItemsConfigs, controls);
						break;
					case ConfigurationEnums.CustomViewModelSchemaItem.RADIO_GROUP:
						var itemRadioContainerConfig = this.generateRadioGroupSchemaItemView(schemaItem, config);
						Ext.Array.push(schemaItemsConfigs, itemRadioContainerConfig);
						break;
					case ConfigurationEnums.CustomViewModelSchemaItem.ITEMS_GROUP:
						var itemContainerConfig = this.generateItemsGroupView(schemaItem, config);
						Ext.Array.push(schemaItemsConfigs, itemContainerConfig);
						break;
					case Terrasoft.ViewModelSchemaItem.GROUP:
						var groupSchemaItemConfig =  this.generateGroupSchemaItemView(schemaItem, config, schema);
						Ext.Array.push(schemaItemsConfigs, groupSchemaItemConfig);
						break;
					case Terrasoft.ViewModelSchemaItem.DETAIL:
						var detailContainer = this.getDetailConfig(schemaItem, info);
						Ext.Array.push(schemaItemsConfigs, detailContainer);
						break;
					case Terrasoft.ViewModelSchemaItem.MODULE:
						var moduleContainer = this.getModuleConfig(schemaItem);
						Ext.Array.push(schemaItemsConfigs, moduleContainer);
						break;
					case ConfigurationEnums.CustomViewModelSchemaItem.CUSTOM_ELEMENT:
						var customElementItemConfig = this.getCustomElementConfig(schemaItem);
						if (Ext.isEmpty(customElementItemConfig)) {
							break;
						}
						delete customElementItemConfig.type;
						schemaItemsConfigs.push(customElementItemConfig);
						break;
					default:
						break;
				}
				return schemaItemsConfigs;
			},

			generateSchemaView: function(config, schema) {
				var container = config.container;
				var action = config.action;
				var createContainerAdvancedButton = false;
				var containerItems = container.items;
				Terrasoft.each(config.columnsObject, function(schemaItem) {
					if (schemaItem.advancedVisible && action === ConfigurationEnums.CardState.Add) {
						createContainerAdvancedButton = true;
					}
					if (this.isElementNotVisible(action, schemaItem)) {
						return;
					}
					var schemaItemConfigs = this.generateSchemaItemView(schemaItem, config, schema);
					if (schemaItem.type === Terrasoft.ViewModelSchemaItem.GROUP) {
						createContainerAdvancedButton = false;
					}
					Ext.Array.push(containerItems, schemaItemConfigs);
				}, this);
				this.generateAdvancedButton(container, createContainerAdvancedButton);
			},

			setContainerId: function(info, schemaItem) {
				Terrasoft.each(info.groups, function(group) {
					if (group.id === schemaItem.id) {
						group.containerId = schemaItem.containerId;
					}
				}, this);
			},

			getDetailConfig: function(schemaItem, info) {
				schemaItem.containerId = 'datail-' + schemaItem.name + this.instancePrefix;
				this.setContainerId(info, schemaItem);
				if (schemaItem.inContainer) {
					return this.getContainerConfig(schemaItem.containerId);
				} else {
					var wrapContainerClasses = ['control-group-container'];
					if (schemaItem.wrapContainerClass) {
						wrapContainerClasses.push(schemaItem.wrapContainerClass);
					}
					var controlGroup = {
						id: schemaItem.containerId,
						caption: schemaItem.caption,
						className: 'Terrasoft.ControlGroup',
						tag: schemaItem.name,
						markerValue: schemaItem.caption,
						classes: {
							wrapContainerClass: wrapContainerClasses
						},
						collapsedchanged: {
							bindTo: 'onDetailCollapsedChanged'
						},
						items: [],
						visible: schemaItem.visible,
						collapsed: {
							bindTo: 'detail_collapsed_' + schemaItem.name
						}
					};
					if (typeof schemaItem.useProfile === 'boolean' && !schemaItem.useProfile) {
						controlGroup.collapsed = schemaItem.collapsed;
					}
					return controlGroup;
				}
			},

			getModuleConfig: function(schemaItem) {
				var moduleContainer = this.getContainerConfig('module-' + schemaItem.name);
				moduleContainer.visible = (schemaItem.visible !== false);
				Ext.apply(moduleContainer, schemaItem.customConfig || {});
				return moduleContainer;
			},

			getCustomElementConfig: function(schemaItem) {
				schemaItem = Terrasoft.deepClone(schemaItem);
				return schemaItem;
			},

			getGroupContainerConfig: function(schemaItem, action, profile, schema) {
				var wrapContainerClasses = ['control-group-container'];
				if (schemaItem.wrapContainerClass) {
					wrapContainerClasses.push(schemaItem.wrapContainerClass);
				}
				var containerVisible = (schemaItem.visible !== false);
				if (action === ConfigurationEnums.CardState.View) {
					containerVisible = {
						bindTo: schemaItem.name + 'GetVisible'
					};
				}
				var container = {
					id: schemaItem.id + this.instancePrefix,
					className: 'Terrasoft.ControlGroup',
					caption: schemaItem.caption,
					markerValue: schemaItem.caption,
					visible: containerVisible,
					classes: {
						wrapContainerClass: wrapContainerClasses
					},
					collapsedchanged: {
						bindTo: 'onDetailCollapsedChanged'
					},
					tag: schemaItem.name,
					items: []
				};
				if (profile && profile[schemaItem.name]) {
					container.collapsed = profile[schemaItem.name].collapsed;
				} else if (typeof schemaItem.collapsed === 'boolean') {
					container.collapsed = schemaItem.collapsed;
				}
				if (schema && schema.defaultControlGroupWidth) {
					container.width = schema.defaultControlGroupWidth;
				}
				var customConfig = Terrasoft.deepClone(schemaItem.customConfig || {});
				Ext.apply(container, customConfig);
				return container;
			},

			isLookupTypeSchemaItem: function(schemaItem) {
				var isLookup = false;
				var schemaItemType = schemaItem.type;
				switch (schemaItemType) {
					case Terrasoft.ViewModelSchemaItem.METHOD:
						var dataValueType = schemaItem.dataValueType;
						isLookup = ((dataValueType === Terrasoft.DataValueType.LOOKUP) ||
							(dataValueType === Terrasoft.DataValueType.ENUM));
						break;
					case Terrasoft.ViewModelSchemaItem.ATTRIBUTE:
						var entitySchemaColumn = this.entitySchema.getColumnByName(schemaItem.columnPath);
						if (!Ext.isEmpty(entitySchemaColumn)) {
							isLookup = entitySchemaColumn.isLookup;
						}
						else if (schemaItem.isLookup || schemaItem.isCollection) {
							isLookup = true;
						}
						break;
					default:
						isLookup = false;
				}
				return isLookup;
			},

			updateDateTimeBindingConfig: function(bindingConfig, schemaItem, binding) {
				var customEnabled = !schemaItem.customConfig ? true : schemaItem.customConfig.enabled;
				var bindingEnabled = !binding ? true : binding.enabled || true;
				var bindEnabled = customEnabled && bindingEnabled;
				var bindReadOnly = !binding ? false : binding.readonly || false;
				var bindRequired = !binding ? false : binding.isRequired || false;
				var containerConfig =
					this.getContainerConfig(schemaItem.name, ['datetimeeditcontainer-class', 'controlBaseedit']);
				containerConfig.items = [{
					className: 'Terrasoft.DateEdit',
					classes: {
						wrapClass: ['dimension-class', 'datetime-datecontrol']
					},
					id: 'date-edit-' + schemaItem.name + this.instancePrefix,
					selectors: {
						wrapEl: '#date-edit-' + schemaItem.name + this.instancePrefix
					},
					value: {
						bindTo: schemaItem.name
					},
					enabled: bindEnabled,
					readonly: bindReadOnly,
					isRequired: bindRequired
				}, {
					className: 'Terrasoft.TimeEdit',
					id: 'time-edit-' + schemaItem.name + this.instancePrefix,
					selectors: {
						wrapEl: '#time-edit-' + schemaItem.name + this.instancePrefix
					},
					classes: {
						wrapClass: ['dimension-class', 'datetime-timecontrol']
					},
					value: {
						bindTo: schemaItem.name
					},
					enabled: bindEnabled,
					readonly: bindReadOnly
				}];
				return containerConfig;
			},

			applyBindingsConfig: function(controlConfig, schemaItem, bindings) {
				var itemName = schemaItem.name;
				var binding = bindings[itemName];
				if (!Ext.isEmpty(binding)) {
					Ext.apply(controlConfig, binding);
				}
				var defaultBindingConfig = {};
				if (schemaItem.dataValueType === Terrasoft.DataValueType.BOOLEAN) {
					Ext.apply(controlConfig, {
						checked: {
							bindTo: itemName
						}
					});
					return;
				}
				if (schemaItem.customItem) {
					defaultBindingConfig = schemaItem.customItemConfig;
				} else {
					defaultBindingConfig.value = {
						bindTo: itemName
					};
				}
				if (this.isLookupTypeSchemaItem(schemaItem)) {
					var listName = schemaItem.list || itemName + 'List';
					defaultBindingConfig.list = {
						bindTo: listName
					};
					if (schemaItem.dataValueType === Terrasoft.DataValueType.LOOKUP) {
						defaultBindingConfig.loadVocabulary = {
							bindTo: 'loadVocabulary'
						};
						defaultBindingConfig.tag = itemName;
					}
				}
				if (schemaItem.dataValueType === Terrasoft.DataValueType.DATE_TIME) {
					delete controlConfig.isRequired;
					defaultBindingConfig = this.updateDateTimeBindingConfig(defaultBindingConfig, schemaItem, binding);
				}
				Ext.apply(controlConfig, defaultBindingConfig);
			},

			getContainerConfig: function(id, wrapClass, styles) {
				var container = {
					className: 'Terrasoft.Container',
					items: [],
					id: id + this.instancePrefix,
					selectors: {
						wrapEl: '#' + id + this.instancePrefix
					}
				};
				if (styles) {
					container.styles = {
						wrapStyles: styles
					};
				} else if (!Ext.isEmpty(wrapClass)) {
					container.classes = {
						wrapClassName: wrapClass
					};
				}
				return container;
			},

			createLeftArrowButtonConfig: function() {
				var leftArrowIconConfig = {
					source: Terrasoft.ImageSources.IMAGE_LIST_SCHEMA,
					params: {
						schemaUId: 'd3cf6e63-3322-49e5-8b11-049812be5090',
						itemUId: '8fe7c97d-0586-4c29-862d-a649e1dd7623'
					}
				};
				return {
					className: 'Terrasoft.Button',
					visible: false,
					style: Terrasoft.controls.ButtonEnums.style.DEFAULT,
					imageConfig: leftArrowIconConfig
				};
			},

			createRightArrowButtonConfig: function() {
				var rightArrowIconConfig = {
					source: Terrasoft.ImageSources.IMAGE_LIST_SCHEMA,
					params: {
						schemaUId: 'd3cf6e63-3322-49e5-8b11-049812be5090',
						itemUId: '7068bb49-6efa-41d1-8cbe-49e1b0ab2b30'
					}
				};
				return {
					className: 'Terrasoft.Button',
					visible: false,
					style: Terrasoft.controls.ButtonEnums.style.DEFAULT,
					imageConfig: rightArrowIconConfig
				};
			},

			init: function() {
				this.idGenerator = new Ext.data.SequentialIdGenerator({
					prefix: 'card-module-control_',
					seed: 0
				});
				this.containerIdGenerator = new Ext.data.SequentialIdGenerator({
					prefix: 'field-container-',
					seed: 0
				});
			},

			getHeaderConfig: function(schema) {
				var headerConfig = this.getContainerConfig('header', ['header']);
				var name = {
					className: 'Terrasoft.Container',
					id: 'header-name-container',
					classes: {
						wrapClassName: ['header-name-container']
					},
					selectors: {
						wrapEl: '#header-name-container'
					},
					items: [{
						className: 'Terrasoft.Label',
						id: 'header-name',
						caption: {
							bindTo: 'getHeader'
						}
					}]
				};
				var commandLine = {
					className: 'Terrasoft.Container',
					id: 'card-command-line-container',
					classes: {
						wrapClassName: ['card-command-line']
					},
					selectors: {
						wrapEl: '#card-command-line-container'
					},
					items: []
				};
				var help = {
					className: 'Terrasoft.Container',
					id: 'card-context-help-container',
					classes: {
						wrapClassName: ['card-context-help']
					},
					selectors: {
						wrapEl: '#card-context-help-container'
					},
					items: []
				};
				headerConfig.items = [name, commandLine, help];
				if (schema.entityInfo && schema.entityInfo.pageConfig) {
					var pageConfig = schema.entityInfo.pageConfig;
					if (pageConfig.header === false) {
						headerConfig.visible = false;
					}
					if (pageConfig.name === false) {
						name.visible = false;
					}
					if (pageConfig.commandLine === false) {
						commandLine.visible = false;
						name.classes.wrapClassName.push('wide-header-name-container');
					}
				}
				var entityInfo = schema.entityInfo;
				if (entityInfo) {
					if (entityInfo.hideHeader) {
						headerConfig.visible = false;
					}
				}
				return headerConfig;
			},

			getEditButtonConfig: function(action) {
				var firstButtonConfig;
				if (this.isEdit(action)) {
					firstButtonConfig = {
						className: 'Terrasoft.Button',
						caption: resources.localizableStrings.SaveButtonCaption,
						style: Terrasoft.controls.ButtonEnums.style.GREEN,
						click: {
							bindTo: 'save'
						},
						visible: {
							bindTo: 'isVisibleEditButton'
						}
					};
				} else {
					firstButtonConfig = {
						className: 'Terrasoft.Button',
						caption: resources.localizableStrings.ChangeButtonCaption,
						style: Terrasoft.controls.ButtonEnums.style.DEFAULT,
						click: {
							bindTo: ConfigurationEnums.CardState.Edit
						},
						visible: {
							bindTo: 'isVisibleEditButton'
						}
					};
				}
				return firstButtonConfig;
			},

			getMoveToConfig: function(info, action, buttonsConfig) {
				var buttonConfig = {
					className: 'Terrasoft.Button'
				};
				var moveToItemsCaptions = [];
				var moveToItemsMap = [];
				Terrasoft.each(info.groups, function(group) {
					moveToItemsCaptions.push(group.caption);
					moveToItemsMap[group.caption] = group;
				}, this);
				if (moveToItemsCaptions.length > 0) {
					moveToItemsCaptions.sort();
					var moveToItemsConfig = [];
					Terrasoft.each(moveToItemsCaptions, function(caption) {
						var group = moveToItemsMap[caption];
						if (group) {
							var visible = true;
							if (group.visible != null) {
								visible = group.visible;
							}
							if (action === ConfigurationEnums.CardState.View && !group.isDetail) {
								visible = {
									bindTo: group.name + 'GetVisible'
								};
							}
							moveToItemsConfig.push({
								caption: group.caption,
								tag: group.id,
								visible: visible,
								click: {
									bindTo: 'moveToAction'
								}
							});
						}
					}, this);
					var moveToButtonConfig = {
						caption: resources.localizableStrings.GotoButtonCaption,
						menu: {
							items: moveToItemsConfig
						}
					};
					buttonsConfig.push(Ext.apply({}, moveToButtonConfig, buttonConfig));
				}
			},

			getTopUtilsConfig: function(action, info, fullViewModelSchema, reports, viewModelSchema) {
				var utilsConfig = this.getContainerConfig('utils');
				var buttonsConfig = [];
				var buttonConfig = {
					className: 'Terrasoft.Button'
				};
				if (!fullViewModelSchema.isReadOnly) {
					var firstButtonConfig = this.getEditButtonConfig(action);
					buttonsConfig.push(Ext.apply({}, firstButtonConfig));
				}
				var delayExecutionButton = {
					className: 'Terrasoft.Button',
					caption: resources.localizableStrings.DoLaterButtonCaption,
					style: Terrasoft.controls.ButtonEnums.style.DEFAULT,
					visible: {
						bindTo: 'delayExecutionButtonVisible'
					},
					click: {
						bindTo: 'delayExecution'
					}
				};
				var cancelCaption = action === ConfigurationEnums.CardState.View ?
					resources.localizableStrings.BackButtonCaption :
					resources.localizableStrings.CancelButtonCaption;
				buttonsConfig.push(Ext.apply({}, delayExecutionButton));
				var secondButton = Ext.apply({}, {
					className: 'Terrasoft.Button',
					style: Terrasoft.controls.ButtonEnums.style.DEFAULT,
					caption: cancelCaption,
					click: {
						bindTo: 'cancel'
					}
				}, buttonConfig);
				buttonsConfig.push(secondButton);
				var thirdButton = {
					className: 'Terrasoft.Button',
					caption: resources.localizableStrings.ActionButtonCaption,
					menu: {
						items: []
					}
				};
				buttonsConfig.push(thirdButton);
				this.getMoveToConfig(info, action, buttonsConfig);
				actionUtilities.addActionsButton(buttonsConfig, fullViewModelSchema.actions);
				reports = actionUtilities.getReports(reports);
				actionUtilities.addActionsButton(buttonsConfig, reports);
				var customActions = [{
					caption: '',
					className: 'Terrasoft.MenuSeparator',
					visible: {
						bindTo: 'getSchemaAdministratedByRecords'
					}
				}, {
					caption: resources.localizableStrings.RightsButtonCaption,
					click: {
						bindTo: 'editRights'
					},
					visible: {
						bindTo: 'getSchemaAdministratedByRecords'
					}
				}];
				if (Terrasoft.SysSettings.cachedSettings.BuildType !== 'e45eb864-59cc-4325-8276-d85e1ba90c95') {
					customActions.push({
						caption: '',
						visible: {
							bindTo: 'canDesignPage'
						},
						className: 'Terrasoft.MenuSeparator'
					});
					customActions.push({
						caption: resources.localizableStrings.EditPageCaption,
						visible: {
							bindTo: 'canDesignPage'
						},
						click: {
							bindTo: 'openPageDesigner'
						}
					});
				}
				actionUtilities.addActionsButton(buttonsConfig, customActions);
				var visibilityBindings = [];
				thirdButton.menu.items.forEach(function(item) {
					if (item.visible && item.visible.bindTo) {
						visibilityBindings.push(item.visible.bindTo);
					}
				});
				if (visibilityBindings.length === thirdButton.menu.items.length) {
					thirdButton.visible = {
						bindTo: 'getActionsButtonVisible'
					};
					viewModelSchema.visibilityBindings = visibilityBindings;
				}
				buttonsConfig.push({
					className: 'Terrasoft.Button',
					visible: false,
					style: Terrasoft.controls.ButtonEnums.style.DEFAULT,
					caption: resources.localizableStrings.GotoButtonCaption,
					menu: {
						items: []
					}
				});
				var utilsSetting = fullViewModelSchema.schema.utilsConfig;
				var leftUtilsClass =
					utilsSetting && utilsSetting.leftUtilsClass ? utilsSetting.leftUtilsClass : 'utils-left';
				var utilsLeftConfig = this.getContainerConfig(leftUtilsClass);
				utilsLeftConfig.items = fullViewModelSchema.schema.customLeftUtils && utilsSetting.useLeftUtils ?
					fullViewModelSchema.schema.customLeftUtils : buttonsConfig;
				if (fullViewModelSchema.methods.modifyLeftUtilsConfig) {
					utilsLeftConfig = fullViewModelSchema.methods.modifyLeftUtilsConfig(utilsLeftConfig);
				}
				var rightUtilsClass = utilsSetting && utilsSetting.rightUtilsClass ?
					utilsSetting.rightUtilsClass : 'utils-right';
				var utilsRightConfig = this.getContainerConfig(rightUtilsClass);
				utilsRightConfig.items = fullViewModelSchema.schema.customRightUtils && utilsSetting &&
					utilsSetting.useRightUtils ?
					fullViewModelSchema.schema.customRightUtils: [
					{
						className: 'Terrasoft.Button',
						style: Terrasoft.controls.ButtonEnums.style.DEFAULT,
						visible: false,
						caption: resources.localizableStrings.ViewButtonCaption,
						menu: {
							items: [{
								caption: "SingleMenuItem"
							}]
						}
					},
					this.createLeftArrowButtonConfig(),
					this.createRightArrowButtonConfig()
				];
				utilsConfig.items.push(utilsLeftConfig);
				utilsConfig.items.push(utilsRightConfig);
				if (fullViewModelSchema.entityInfo && fullViewModelSchema.entityInfo.pageConfig &&
					(fullViewModelSchema.entityInfo.pageConfig.topUtils === false)) {
					utilsConfig.visible = false;
				}
				var entityInfo = fullViewModelSchema.entityInfo;
				if (entityInfo) {
					if (entityInfo.hideUtils) {
						utilsConfig.visible = false;
					}
				}
				return utilsConfig;
			},

			getBottomUtilsConfig: function(fullViewModelSchema) {
				var utilsConfig = this.getContainerConfig('bottomUtils');
				if (fullViewModelSchema.schema.bottomUtilsConfig) {
					utilsConfig.items = fullViewModelSchema.schema.bottomUtilsConfig;
				}
				return utilsConfig;
			},

			getInfoButton: function(schemaItem, wrapperClass) {
				var infoConfig = schemaItem.info || {};
				wrapperClass = wrapperClass || ['control-info-button'];
				var infoButtonConfig = {
					className: 'Terrasoft.Button',
					imageConfig: infoConfig.InfoImage || resources.localizableImages.InfoImage,
					style: Terrasoft.controls.ButtonEnums.style.TRANSPARENT,
					tabIndex: -1,
					tag: schemaItem.name,
					classes: {
						wrapperClass: wrapperClass
					},
					click: {
						bindTo: schemaItem.name + 'ShowInfo'
					}
				};
				if (infoConfig.visible) {
					infoButtonConfig.visible = infoConfig.visible;
				}
				if (infoConfig.click) {
					infoButtonConfig.click = infoConfig.click;
				}
				return infoButtonConfig;
			},

			pushConfigToContainer: function(mainContainer, columnsObject, basePanelConfig, itemsContainer, schema) {
				var config = Terrasoft.deepClone(basePanelConfig);
				if (!columnsObject) {
					return;
				}
				var containerConfig = itemsContainer;
				if (!itemsContainer.hasOwnProperty('className')) {
					containerConfig =
						this.getContainerConfig(itemsContainer.id, itemsContainer.wrapClass, itemsContainer.styles);
					if (itemsContainer.hasOwnProperty('items')) {
						containerConfig.items = itemsContainer.items;
					}
				}
				var itemConfig = {
					container: containerConfig,
					columnsObject: columnsObject
				};
				Ext.apply(config, itemConfig);
				this.generateSchemaView(config, schema);
				mainContainer.items.push(containerConfig);
			},

			generate: function(viewModelSchema, action, info, profile, reports) {
				this.init();
				this.instancePrefix = viewModelSchema.instancePrefix ? viewModelSchema.instancePrefix : '';
				var fullViewModelSchema = this.getFullViewModelSchema(viewModelSchema);
				this.entitySchema = fullViewModelSchema.entitySchema;
				var viewConfig = this.getContainerConfig('autoGeneratedContainer');
				var headerConfig = this.getHeaderConfig(fullViewModelSchema);
				var topUtilsConfig =
					this.getTopUtilsConfig(action, info, fullViewModelSchema, reports, viewModelSchema);
				viewConfig.items = [
					headerConfig,
					this.getContainerConfig('process-reminder'),
					topUtilsConfig,
					this.getContainerConfig('delay-execution'),
					this.getContainerConfig('usertask-recommendation')
				];
				if ((action === ConfigurationEnums.CardState.View) && fullViewModelSchema.getItemViewHeader) {
					var viewItemConfig = fullViewModelSchema.getItemViewHeader();
					var viewHeaderConfig = this.getContainerConfig('item-information-container');
					viewHeaderConfig.items = [
						this.getContainerConfig('item-image'),
						this.getContainerConfig('item-info')
					];
					var headerColumns = viewItemConfig.columns;
					Terrasoft.each(headerColumns, function(column) {
						if (column.dataValueType === Terrasoft.DataValueType.IMAGE) {
							viewHeaderConfig.items[0].items.push(this.getImgConfig(column));
						} else {
							viewHeaderConfig.items[1].items.push(
								this.getControlConfig(column, fullViewModelSchema.bindings, action));
						}
					}, this);
					viewConfig.items.push(viewHeaderConfig);
				}
				BusinessRuleModule.prepareViewRule(fullViewModelSchema, info.rules);
				var useInfoButtons =
					Ext.isEmpty(fullViewModelSchema.useInfoButtons) ? true : fullViewModelSchema.useInfoButtons;
				var basePanelConfig = {
					bindings: fullViewModelSchema.bindings,
					action: action,
					info: info,
					profile: profile,
					useInfoButtons: useInfoButtons
				};
				this.pushConfigToContainer(viewConfig, fullViewModelSchema.schema.customPanel, basePanelConfig, {
					id: 'autoGeneratedCustomContainer',
					wrapClass: fullViewModelSchema.schema.customPanelWrapClass
				});
				this.pushConfigToContainer(viewConfig, fullViewModelSchema.schema.leftPanel, basePanelConfig, {
					id: 'autoGeneratedLeftContainer',
					wrapClass: fullViewModelSchema.schema.leftPanelWrapClass,
					styles: fullViewModelSchema.leftPanelStyles
				}, fullViewModelSchema);
				this.pushConfigToContainer(viewConfig, fullViewModelSchema.schema.rightPanel, basePanelConfig, {
					id: 'autoGeneratedRightContainer',
					wrapClass: fullViewModelSchema.schema.rightPanelWrapClass,
					styles: fullViewModelSchema.rightPanelStyles,
					items: [
						this.getContainerConfig('processExecutionContextContainer')
					]
				}, fullViewModelSchema);
				var bottomUtilsConfig = this.getBottomUtilsConfig(fullViewModelSchema);
				this.pushConfigToContainer(viewConfig, fullViewModelSchema.schema.bottomUtilsConfig,
					basePanelConfig, bottomUtilsConfig);
				this.pushConfigToContainer(viewConfig, fullViewModelSchema.schema.customBottomPanel, basePanelConfig, {
					id: 'autoGeneratedCustomBottomContainer',
					wrapClass: fullViewModelSchema.schema.customBottomPanelWrapClass
				});
				return viewConfig;
			},

			generateView: function() {
				return this.generateCustomView.apply(this, arguments);
			},

			generateLabelConfig: function() {
				return this.getCustomLabelConfig.apply(this, arguments);
			},

			generateControlConfig: function() {
				return this.getCustomControlConfig.apply(this, arguments);
			}

		});

		var cardViewGenerator = Ext.create('Terrasoft.CardViewGenerator');
		return cardViewGenerator;
	});