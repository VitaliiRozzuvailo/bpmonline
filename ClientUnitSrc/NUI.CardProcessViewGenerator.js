define('CardProcessViewGenerator', ['ext-base', 'terrasoft', 'BusinessRuleModule', 'CardProcessViewGeneratorResources',
	'ActionUtilitiesModule', 'ConfigurationEnums', 'GridUtilities'],
	function(Ext, Terrasoft, BusinessRuleModule, resources, actionUtilities, ConfigurationEnums, GridUtilities) {
	var createAdvancedButton = false;
	var itemCollapsed = false;
	var entitySchema;
	var idGenerator, containerIdGenerator;

	function getFullViewModelSchema(sourceViewModelSchema) {
		return Terrasoft.utils.common.deepClone(sourceViewModelSchema);
	}
	function getVisible(item, type) {
		var displayValue = Terrasoft.getTypedStringValue(item, type);
		return (displayValue !== '' && displayValue !== null);
	}
	function isEditCheckBox(action, dataValueType) {
		return dataValueType === Terrasoft.DataValueType.BOOLEAN && isEdit(action);
	}
	function isEditImage(action, dataValueType) {
		return dataValueType === Terrasoft.DataValueType.IMAGE && isEdit(action);
	}
	function isHtmlControl(schemaItem) {
		return schemaItem.customConfig &&
			(schemaItem.customConfig.className === 'Terrasoft.controls.HtmlEdit' ||
				schemaItem.customConfig.className === 'Terrasoft.controls.HtmlControl');
	}
	function isEdit(action) {
		return action === ConfigurationEnums.CardState.EditStructure ||
			action === ConfigurationEnums.CardState.Edit ||
			action === ConfigurationEnums.CardState.Add ||
			action === ConfigurationEnums.CardState.Copy;
	}
	function isElementNotVisible(action, schemaItem) {
		var edit = action !== ConfigurationEnums.CardState.View;
		return (edit && schemaItem.visible === false) ||
			(!edit && schemaItem.viewVisible === false);
	}

	function converterTypeForBinding(type) {
		return (type === Terrasoft.DataValueType.ENUM ? Terrasoft.DataValueType.LOOKUP : type);
	}

	function generateLabelBindings(action, schemaItem, schemaItemBindings) {
		var bindings = {};
		if (action === ConfigurationEnums.CardState.View) {
			if (schemaItem.type === Terrasoft.ViewModelSchemaItem.ATTRIBUTE) {
				var converter = getVisible;
				if (action === "view" && schemaItem.columnType === Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN) {
					converter = function(item) {
						return getVisible(item, converterTypeForBinding(schemaItem.dataValueType));
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
	}

	function getLabelCaption(schemaItem) {
		switch (schemaItem.type) {
			case Terrasoft.ViewModelSchemaItem.ATTRIBUTE:
				var entitySchemaColumn = entitySchema.getColumnByName(schemaItem.name);
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
	}

	function getValueLabelConfig(schemaItem, bindings, labelType, action) {
		var labelConfig = getLabelConfig(schemaItem, bindings, labelType, action);
		var labelId = schemaItem.name + 'ValueControlLabel';
		var columnPath = schemaItem.columnPath;
		var converter = Terrasoft.getTypedStringValue;
		if (action === "view" && schemaItem.columnType === Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN) {
			converter = function(item) {
				return Terrasoft.getTypedStringValue(item, converterTypeForBinding(schemaItem.dataValueType));
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

		if (entitySchema && entitySchema.name && Terrasoft[entitySchema.name]) {
			var columns = Terrasoft[entitySchema.name].columns;
			if (columns && columnPath) {
				var column = columns[columnPath];
				if (column && column.isLookup && column.referenceSchemaName) {
					var schemaName = column.referenceSchemaName;
					var moduleStructure = Terrasoft.configuration.ModuleStructure[schemaName];
					if (moduleStructure) {
						var labelClass = labelConfig.classes.labelClass || [];
						labelClass.push('label-link');
						labelConfig.classes.labelClass = labelClass;
						labelConfig.click = {bindTo: 'onLabelLink' + columnPath + 'Click'};
					}
				}
			}
		}
		return labelConfig;
	}

	function getLabelConfig(schemaItem, bindings, labelType, action) {
		var schemaItemBindings = bindings[schemaItem.name];
		var labelBindings = generateLabelBindings(action, schemaItem, schemaItemBindings);

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
		var entitySchemaColumn = entitySchema.getColumnByName(schemaItem.name);
		if (action !== ConfigurationEnums.CardState.View && entitySchemaColumn &&
			entitySchemaColumn.isRequired || schemaItem.isRequired) {
			labelClass.push("required-caption");
		}
		caption = getLabelCaption(schemaItem);
		var labelId = schemaItem.name + 'ControlLabel';
		var labelConfig = {
			id: labelId,
			className: 'Terrasoft.Label',
			caption: caption || '',
			markerValue: schemaItem.name,
			visible: true,
			classes: {labelClass: labelClass}
		};
		Ext.apply(labelConfig, labelBindings);
		if (schemaItem.captionLabelCustomConfig) {
			Ext.apply(labelConfig, schemaItem.captionLabelCustomConfig);
		}
		if (schemaItem.labelCustomConfig &&
			(action === ConfigurationEnums.CardState.View || schemaItem.labelCustomConfigModes &&
				schemaItem.labelCustomConfigModes.indexOf(action) !== -1)) {
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
	}

	function getControlConfig(schemaItem, bindings, action) {
		var controlConfig;
		if (!isHtmlControl(schemaItem) && action === ConfigurationEnums.CardState.View) {
			return getValueLabelConfig(schemaItem, bindings, 'right', ConfigurationEnums.CardState.View);
		}
		var additionalConfig = {
			classes: {wrapClass: 'controlBaseedit'}
		};
		if (schemaItem.type === Terrasoft.ViewModelSchemaItem.METHOD) {
			if (Ext.isEmpty(schemaItem.customItem)) {
				additionalConfig.readonly = true;
			}
		} else {
			var entitySchemaColumn = entitySchema.getColumnByName(schemaItem.name);
			if (!Ext.isEmpty(entitySchemaColumn)) {
				if (entitySchemaColumn.isRequired === true &&
					entitySchemaColumn.dataValueType !== Terrasoft.DataValueType.DATE_TIME) {
					additionalConfig.isRequired = true;
				}
				if (entitySchemaColumn.readonly === true) {
					additionalConfig.readonly = true;
				}
				var precision = entitySchemaColumn.precision;
				if (!Ext.isEmpty(precision) &&
					(entitySchemaColumn.dataValueType === Terrasoft.DataValueType.FLOAT ||
						entitySchemaColumn.dataValueType === Terrasoft.DataValueType.MONEY)) {
					additionalConfig.decimalPrecision = precision;
				}
			}
			else if (!Ext.isEmpty(schemaItem.columnPath) && schemaItem.columnPath.indexOf('.') !== -1) {
				if (Ext.isEmpty(schemaItem.customConfig)) {
					schemaItem.customConfig = {};
				}
				schemaItem.customConfig.enabled = false;
			}
			if (schemaItem.advancedVisible === true && action === ConfigurationEnums.CardState.Add) {
				additionalConfig.visible = {
					bindTo: 'advancedVisible'
				};
				createAdvancedButton = true;
			} else {
				itemCollapsed = false;
			}
		}
		controlConfig = Terrasoft.getControlConfigByDataValueType(schemaItem.dataValueType);
		Ext.apply(controlConfig, additionalConfig, {markerValue: schemaItem.name});
		applyBindingsConfig(controlConfig, schemaItem, bindings);
		var customConfig = Terrasoft.utils.common.deepClone(schemaItem.customConfig);
		if (action === ConfigurationEnums.CardState.View) {
			customConfig.enabled = false;
			if (customConfig.className === 'Terrasoft.controls.HtmlEdit' && schemaItem.customItem) {
				customConfig = {
					id: customConfig.id,
					className: 'Terrasoft.controls.HtmlControl'
				};
			}
		}
		//customConfig = customConfig && Terrasoft.utils.common.deepClone(schemaItem.customConfig);
		if (!Ext.isEmpty(customConfig)) {
			Ext.apply(controlConfig, customConfig);
		}

		if (schemaItem.usePlaceholder &&
			action !== ConfigurationEnums.CardState.View &&
			schemaItem.dataValueType !== Terrasoft.DataValueType.DATE_TIME) {
			controlConfig.placeholder = schemaItem.placeholder || schemaItem.placeholderCaption || '';
		}

		return controlConfig;
	}

	function getImgConfig(schemaItem) {
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
			readonly: true
		};
	}

	function getCustomLabelConfig(sourceEntitySchema, schemaItem, bindings, isValue, labelType, action) {
		init();
		entitySchema = sourceEntitySchema;
		if (isValue) {
			return getValueLabelConfig(schemaItem, bindings, labelType, action);
		}
		return getLabelConfig(schemaItem, bindings, labelType, action);
	}

	function getCustomControlConfig(sourceEntitySchema, schemaItem, bindings, action) {
		init();
		entitySchema = sourceEntitySchema;
		return getControlConfig(schemaItem, bindings, action);
	}

	function generateCustomView(container, columnsObject, bindings, action, sourceEntitySchema, info, useInfoButtons) {
		init();
		entitySchema = sourceEntitySchema;
		useInfoButtons = Ext.isEmpty(useInfoButtons) ? true : useInfoButtons;
		generateView({
			container: container,
			columnsObject: columnsObject,
			bindings: bindings,
			action: action,
			info: info,
			useInfoButtons: useInfoButtons
		});
	}

	function getItemsContainerConfig(schemaItem, action) {
		var containerConfig = getContainerConfig(schemaItem.name, [schemaItem.wrapContainerClass]);
		Ext.apply(containerConfig, {
			visible: (action === ConfigurationEnums.CardState.View) ?
			{ bindTo: schemaItem.name + 'GetVisible' }
				: (action === ConfigurationEnums.CardState.Add && schemaItem.advancedVisible) ?
			{ bindTo: 'advancedVisible' } : true,
			items: []
		});
		return containerConfig;
	}

	function generateAdvancedButton(containerConfig, createAdvancedButton, isGroup, itemCollapsed) {
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
	}

	function generateCheckBoxContainer(labelConfig, controlConfig, name) {
		controlConfig.id = idGenerator.generate();
		labelConfig.inputId = controlConfig.id + '-el';
		var container = getContainerConfig(name + 'container', ['check-box-container']);//custom-view-container
		container.visible = labelConfig.visible;
		labelConfig.labelClass = 't-label custom-label-container check-box-label-container';
		controlConfig.classes = {wrapClass: ['custom-control-container']};
		container.items.push(controlConfig, labelConfig);
		return container;
	}

	function editStructureDefBindings(prop, item) {
		switch (prop) {
			case 'imageLoaded':
			case 'plainTextMode':
			case 'images':
			case 'value':
			case 'checked':
			case 'click':
				return null;
			case 'enabled':
				return false;
			case 'visible':
				return true;
			default:
				return item[prop];
		}
	}

	function updateItemsForEditStructure(items) {
		Terrasoft.each(items, function(item) {
			if (item.className === 'Terrasoft.ControlGroup') {
				item.collapsed = false;
			}
			if (item.className === 'Terrasoft.controls.HtmlEdit') {
				item.className = 'Terrasoft.TextEdit';
				if (item.margin) {
					delete item.margin;
				}
			}
			item.enabled = false;
			for (var prop in item) {
				if (prop === 'items') {
					updateItemsForEditStructure(item.items);
					continue;
				}
				if (item[prop] && item[prop].hasOwnProperty('bindTo')) {
					var value = editStructureDefBindings(prop, item);
					if (value === null) {
						delete item[prop];
					} else {
						item[prop] = value;
					}
				}
			}
		});
	}
	function generateAttributeControls(schemaItem, config) {
		var returnItems = [];
		var labelConfig = (isEdit(config.action)) ?
			getLabelConfig(schemaItem, config.bindings, null, config.action) :
			getLabelConfig(schemaItem, config.bindings, 'left', ConfigurationEnums.CardState.View);
		var controlConfig = getControlConfig(schemaItem, config.bindings, config.action);

		if (controlConfig.visible) {
			labelConfig.visible = controlConfig.visible;
		}
		if (isEditCheckBox(config.action, schemaItem.dataValueType)) {
			controlConfig = generateCheckBoxContainer(labelConfig, controlConfig, schemaItem.name);
		} else {
			if (schemaItem.captionVisible !== false) {
				returnItems.push(labelConfig);
			}
		}
		if (config.useInfoButtons && !Ext.isEmpty(schemaItem.info)) {
			var infoButton = getInfoButton(schemaItem, isEdit(config.action) ? false : ['control-info-button-view']);
			if (controlConfig.visible) {
				infoButton.visible = controlConfig.visible;
			}
			var containerClasses = ['control-info-container'];
			if (isEditCheckBox(config.action, schemaItem.dataValueType)) {
				containerClasses = ['control-info-container-checkbox'];
			}
			if (isEdit(config.action)) {
				var containerConfig = getContainerConfig(schemaItem.name + '_InfoControlContainer', containerClasses);
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
	}


	function generateRadioItemGroupConfig(schemaItem, radioConfig, config, action) {
		var itemId = schemaItem.name + '_item_' + Terrasoft.generateGUID();
		var radioConfigItems = radioConfig.items;
		var radioButtonItemsContainer;
		Terrasoft.each(radioConfigItems, function(item) {
			var usePlaceholder = schemaItem.usePlaceholder;
			item.usePlaceholder = (!Ext.isEmpty(usePlaceholder)) ? usePlaceholder : true;
		}, this);
		if (Ext.isArray(radioConfigItems) && radioConfigItems.length > 0) {
			var wrapClass = ['radio-itemgroup-container'];
			if (action === ConfigurationEnums.CardState.View) {
				wrapClass.push('radio-itemgroup-container-view');
			}
			radioButtonItemsContainer = getContainerConfig(itemId + '_container', wrapClass);
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
			generateView(itemConfig);
		}
		return radioButtonItemsContainer;
	}

	function generateRadioItemConfig(schemaItem, radioConfig, config, action) {
		var bindings = {};
		var itemId = schemaItem.name + '_item_' + Terrasoft.generateGUID();
		schemaItem.group = schemaItem.group || schemaItem.name;
		var radioButtonContainer = getContainerConfig(itemId, ['radio-item-container']);
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
			enabled: (!Ext.isEmpty(bindEnabled)) ? bindEnabled : true
		}, {
			className: 'Terrasoft.Label',
			caption: radioConfig.caption
		}];
		return radioButtonContainer;
	}

	function generateView(config) {
		var container = config.container;
		var bindings = config.bindings;
		var action = config.action;
		var info = config.info;
		var profile = config.profile;

		var createContainerAdvancedButton = false;
		var items = container.items;
		Terrasoft.each(config.columnsObject, function(schemaItem) {

			if (schemaItem.advancedVisible && action === ConfigurationEnums.CardState.Add) {
				createContainerAdvancedButton = true;
			}
			if (isElementNotVisible(action, schemaItem)) {
				return;
			}
			var itemItems = items;
			if (action === ConfigurationEnums.CardState.EditStructure) {
				var fieldContainer = null;
				var containerId = schemaItem.EditStructureContainerId;//|| Terrasoft.generateGUID();
				var focusConfig = {
					tag: {
						itemName: schemaItem.name,
						containerId: containerId
					},
					afterrender: {
						bindTo: 'containerRendered'
					},
					afterrerender: {
						bindTo: 'containerRendered'
					}
				};
				switch (schemaItem.type) {
					case Terrasoft.ViewModelSchemaItem.GROUP:
						fieldContainer = getTabbedContainerConfig(containerId,
							['ts-controlgroup-wrap', 'designer-item-container']);
						Ext.apply(fieldContainer, focusConfig);
						itemItems = fieldContainer.items;
						items.push(fieldContainer);
						var itemscontainer = getEditStructureGroupConfig(schemaItem, info, itemItems,
							'fieldGroupContainer-');
						var itemConfig = Terrasoft.deepClone(config);
						Ext.apply(itemConfig, {
							container: itemscontainer,
							columnsObject: schemaItem.items
						});
						generateView(itemConfig);
						return;
					case Terrasoft.ViewModelSchemaItem.DETAIL:
						fieldContainer = getTabbedContainerConfig(containerId,
							['ts-controlDetail-wrap', 'designer-item-container']);
						Ext.apply(fieldContainer, focusConfig);
						itemItems = fieldContainer.items;
						items.push(fieldContainer);
						getEditStructureDetailConfig(schemaItem, info, itemItems,
							'fieldDetailContainer-');
						return;
					default:
						fieldContainer = getTabbedContainerConfig(containerId, ['designer-item-container']);
						Ext.apply(fieldContainer, focusConfig);
						itemItems = fieldContainer.items;
						items.push(fieldContainer);
						if (schemaItem.info) {
							delete schemaItem.info;
						}
						break;
				}
			}
			if (isEditImage(action, schemaItem.dataValueType)) {
				var imageConfig = getImgConfig(schemaItem);
				imageConfig.readonly = true;
				if (action === ConfigurationEnums.CardState.Add) {
					imageConfig.beforefileselected = {bindTo: schemaItem.beforefileselected};
					imageConfig.uploadButtonEnabled = !(Ext.isIE8 || Ext.isIE9);
				}
				imageConfig.styles = {
					wrapStyles: {
						marginTop: '30px'
					}
				};
				itemItems.push(imageConfig);
			}
			switch (schemaItem.type) {
				case Terrasoft.ViewModelSchemaItem.ATTRIBUTE:
				case Terrasoft.ViewModelSchemaItem.METHOD:
					var controls = generateAttributeControls(schemaItem, config);
					Terrasoft.each(controls, function(control) {
						itemItems.push(control);
					});
					break;
				case ConfigurationEnums.CustomViewModelSchemaItem.RADIO_GROUP:
					schemaItem.id = schemaItem.name;
					var itemRadioContainerConfig = getItemsContainerConfig(schemaItem, action);
					itemRadioContainerConfig.visible = (!Ext.isEmpty(schemaItem.visible) ? schemaItem.visible : true);
					var wrapClass = ['radio-group-container'];
					if (!Ext.isEmpty(schemaItem.wrapContainerClass)) {
						wrapClass.push(schemaItem.wrapContainerClass);
					}
					if (action === ConfigurationEnums.CardState.View) {
						wrapClass.push('radio-group-container-view');
					}
					itemRadioContainerConfig.classes = {
						wrapClassName: wrapClass
					};
					Terrasoft.each(schemaItem.items, function(radioItem) {
						var radioItemContainer = generateRadioItemConfig(schemaItem, radioItem, config, action);
						var radioItemGroupConfig = generateRadioItemGroupConfig(schemaItem, radioItem, config, action);
						itemRadioContainerConfig.items.push(radioItemContainer);
						if (!Ext.isEmpty(radioItemGroupConfig)) {
							itemRadioContainerConfig.items.push(radioItemGroupConfig);
						}
					}, this);

					itemItems.push(itemRadioContainerConfig);
					break;
				case ConfigurationEnums.CustomViewModelSchemaItem.ITEMS_GROUP:
					var itemContainerConfig = getItemsContainerConfig(schemaItem, action);
					var labelConfig = {
						caption: schemaItem.caption || '',
						className: 'Terrasoft.Label',
						classes: {
							labelClass: (action === ConfigurationEnums.CardState.View) ?
								'left-label-left-panel' : 'class-caption-' + schemaItem.name
						},
						id: 'caption-' + schemaItem.name,
						selectors: {
							wrapEl: '#caption-' + schemaItem.name
						}
					};

					var customConfig = Terrasoft.deepClone(schemaItem.customConfig || {});
					Ext.apply(itemContainerConfig, customConfig);
					var bindEnabled = !bindings[schemaItem.name] ? true : bindings[schemaItem.name].enabled;
					var schemaItemsContainer = schemaItem.items;
					var showLabel = schemaItem.showLabel;
					if (showLabel) {
						Terrasoft.each(schemaItemsContainer, function(item) {
							if (item.viewVisible === false && action === ConfigurationEnums.CardState.View) {
								return;
							}
							var itemLabelConfig = (isEdit(action)) ?
								getLabelConfig(item, bindings, null, action) :
								getLabelConfig(item, bindings, 'left', ConfigurationEnums.CardState.View);
							Ext.apply(item, itemLabelConfig);
							itemContainerConfig.items.push(itemLabelConfig);
						}, this);
					} else {
						itemContainerConfig.items.push(labelConfig);
					}
					Terrasoft.each(schemaItemsContainer, function(item) {
						if (item.viewVisible === false && action === ConfigurationEnums.CardState.View) {
							return;
						}
						if (bindings[item.name] && bindings[item.name].enabled) {
							bindEnabled = bindings[item.name].enabled;
						}
						if (item.customConfig && item.customConfig.hasOwnProperty('enabled')) {
							bindEnabled = item.customConfig.enabled;
						}
						var lConfigContainer = {
							customConfig: {
								classes: {
									wrapClass: item.wrapClass ? item.wrapClass : ''
								},
								id: item.name,
								selectors: {
									wrapEl: '#' + item.name
								},
								enabled: ((!Ext.isEmpty(bindEnabled)) ? bindEnabled : true)
							}
						};
						Ext.apply(item, lConfigContainer);
						var controlConfig = getControlConfig(item, bindings, action);
						Ext.apply(item, controlConfig);
						itemContainerConfig.items.push(controlConfig);
					}, this);
					itemItems.push(itemContainerConfig);
					break;
				case Terrasoft.ViewModelSchemaItem.GROUP:
					createAdvancedButton = false;
					createContainerAdvancedButton = false;
					itemCollapsed = true;
					var containerConfig = getGroupContainerConfig(schemaItem, action, profile);
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
					generateView(itemsConfig);
					generateAdvancedButton(containerConfig, createAdvancedButton, true, itemCollapsed);
					itemItems.push(containerConfig);
					break;
				case Terrasoft.ViewModelSchemaItem.DETAIL:
					var detailContainer = getDetailConfig(schemaItem, info, profile);
					itemItems.push(detailContainer);
					break;
				default:
					break;
			}
		}, this);
		if (action === ConfigurationEnums.CardState.EditStructure) {
			updateItemsForEditStructure(items);
		}
		generateAdvancedButton(container, createContainerAdvancedButton);
	}

	function getEditStructureGroupConfig(schemaItem, info, itemItems, prefix) {
		var labelConfig = {
			caption: schemaItem.caption || '',
			className: 'Terrasoft.Label',
			classes: {
				labelClass: ['ts-controlgroup-wrap']
			},
			id: 'group-caption-' + schemaItem.name,
			selectors: {
				wrapEl: '#group-caption-' + schemaItem.name
			},
			tag: schemaItem.name
		};
		var itemsConfig = getContainerConfig(prefix + schemaItem.name, ['ts-controlgroup-container',
			'ts-controlgroup-container-shown',
			'control-group-container']);

		itemItems.push(labelConfig);
		itemItems.push(itemsConfig);
		return itemsConfig;
	}

	function getEditStructureDetailConfig(schemaItem, info, itemItems, prefix) {
		var labelConfig = {
			caption: schemaItem.caption || '',
			className: 'Terrasoft.Label',
			classes: {
				labelClass: ['ts-controlgroup-wrap']
			},
			id: 'group-caption-' + schemaItem.name,
			selectors: {
				wrapEl: '#group-caption-' + schemaItem.name
			},
			tag: schemaItem.name
		};
		itemItems.push(labelConfig);
	}


	function setContainerId(info, schemaItem) {
		Terrasoft.each(info.groups, function(group) {
			if (group.id === schemaItem.id) {
				group.containerId = schemaItem.containerId;
			}
		}, this);
	}

	function getDetailConfig(schemaItem, info, profile) {
		schemaItem.containerId = 'datail-' + schemaItem.name;
		setContainerId(info, schemaItem);
		if (schemaItem.inContainer) {
			return getContainerConfig(schemaItem.containerId);
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
				classes: { wrapContainerClass: wrapContainerClasses },
				collapsedchanged: { bindTo: 'onDetailCollapsedChanged' },
				items: [],
				visible: schemaItem.visible,
				collapsed: {
					bindTo: 'detail_collapsed_' + schemaItem.name
				}
			};
			return controlGroup;
		}
	}

	function getGroupContainerConfig(schemaItem, action, profile) {
		var wrapContainerClasses = ['control-group-container'];
		if (schemaItem.wrapContainerClass) {
			wrapContainerClasses.push(schemaItem.wrapContainerClass);
		}
		var container = {
			id: schemaItem.id,
			className: 'Terrasoft.ControlGroup',
			caption: schemaItem.caption,
			markerValue: schemaItem.caption,
			visible: (action === ConfigurationEnums.CardState.View) ? { bindTo: schemaItem.name + 'GetVisible' }
				: (schemaItem.visible ? schemaItem.visible : true),
			classes: { wrapContainerClass: wrapContainerClasses },
			collapsedchanged: { bindTo: 'onDetailCollapsedChanged' },
			tag: schemaItem.name,
			items: []
		};
		if (profile && profile[schemaItem.name]) {
			container.collapsed = profile[schemaItem.name].collapsed;
		} else if (typeof schemaItem.collapsed === 'boolean') {
			container.collapsed = schemaItem.collapsed;
		}
		var customConfig = Terrasoft.deepClone(schemaItem.customConfig || {});
		Ext.apply(container, customConfig);
		return container;
	}

	function isLookupTypeSchemaItem(schemaItem) {
		var isLookup = false;
		var schemaItemType = schemaItem.type;
		switch (schemaItemType) {
			case Terrasoft.ViewModelSchemaItem.METHOD:
				var dataValueType = schemaItem.dataValueType;
				isLookup = (dataValueType === Terrasoft.DataValueType.LOOKUP ||
					dataValueType === Terrasoft.DataValueType.ENUM);
				break;
			case Terrasoft.ViewModelSchemaItem.ATTRIBUTE:
				var entitySchemaColumn = entitySchema.getColumnByName(schemaItem.columnPath);
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
	}

	function updateDateTimeBindingConfig(bindingConfig, schemaItem, binding) {
		var customEnabled = !schemaItem.customConfig ? true : schemaItem.customConfig.enabled;
		var bindEnabled = !binding ? customEnabled : binding.enabled || true;
		var bindReadOnly = !binding ? false : binding.readonly || false;
		var bindRequired = !binding ? false : binding.isRequired || false;
		var containerConfig = getContainerConfig(schemaItem.name, ['datetimeeditcontainer-class', 'controlBaseedit']);
		containerConfig.items = [
			{
				className: 'Terrasoft.DateEdit',
				classes: {
					wrapClass: ['dimension-class', 'datetime-datecontrol']
				},
				id: 'date-edit-' + schemaItem.name,
				selectors: {
					wrapEl: '#date-edit-' + schemaItem.name
				},
				value: {
					bindTo: schemaItem.name
				},
				enabled: bindEnabled,
				readonly: bindReadOnly,
				isRequired: bindRequired
			},
			{
				className: 'Terrasoft.TimeEdit',
				id: 'time-edit-' + schemaItem.name,
				selectors: {
					wrapEl: '#time-edit-' + schemaItem.name
				},
				classes: {
					wrapClass: ['dimension-class', 'datetime-timecontrol']
				},
				value: {
					bindTo: schemaItem.name
				},
				enabled: bindEnabled,
				readonly: bindReadOnly
			}
		];
		return containerConfig;
	}

	function applyBindingsConfig(controlConfig, schemaItem, bindings) {
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
		if (isLookupTypeSchemaItem(schemaItem)) {
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
			defaultBindingConfig = updateDateTimeBindingConfig(defaultBindingConfig, schemaItem, binding);
		}
		Ext.apply(controlConfig, defaultBindingConfig);
	}

	function getContainerConfig(id, wrapClass) {
		var container = {
			className: 'Terrasoft.Container',
			items: [],
			id: id,
			selectors: {
				wrapEl: '#' + id
			}
		};
		if (!Ext.isEmpty(wrapClass)) {
			container.classes = {
				wrapClassName: wrapClass
			};
		}
		return container;
	}

	function getTabbedContainerConfig(id, wrapClass) {
		var containerConfig = getContainerConfig(id, wrapClass);
		containerConfig.tpl = [
			'<div id="{id}" style="{wrapStyles}" class="{wrapClassName}" tabindex="{tabIndex}">',
			'{%this.renderItems(out, values)%}',
			'</div>'
		];
		return containerConfig;
	}

	function createLeftArrowButtonConfig() {
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
	}

	function createRightArrowButtonConfig() {
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
	}

	function init() {
		idGenerator = new Ext.data.SequentialIdGenerator({
			prefix: 'card-module-control_',
			seed: 0
		});
		containerIdGenerator = new Ext.data.SequentialIdGenerator({
			prefix: 'field-container-',
			seed: 0
		});
	}
	function getHeaderConfig(schema) {
		var headerConfig = getContainerConfig('header', ['header']);
		var name = {
			className: 'Terrasoft.Container',
			id: 'header-name-container',
			classes: {wrapClassName: ['header-name-container']},
			selectors: {wrapEl: '#header-name-container'},
			items: [{
				className: 'Terrasoft.Label',
				id: 'header-name',
				caption: {bindTo: 'getHeader'}
			}]
		};
		var commandLine = {
			className: 'Terrasoft.Container',
			id: 'card-command-line-container',
			classes: {wrapClassName: ['card-command-line']},
			selectors: {wrapEl: '#card-command-line-container'},
			items: []
		};
		var help = {
			className: 'Terrasoft.Container',
			id: 'card-context-help-container',
			classes: {wrapClassName: ['card-context-help']},
			selectors: {wrapEl: '#card-context-help-container'},
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

		if (schema.headConfig) {
			if (schema.headConfig.useCommandLine === false) {
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
	}
	function getEditButtonConfig(action) {
		var firstButtonConfig;
		if (isEdit(action)) {
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
	}

	function getMoveToConfig(info, action, buttonsConfig) {
		var buttonConfig = { className: 'Terrasoft.Button' };
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
					var visible = group.visible ? group.visible : true;
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
	}

	function getTopUtilsConfig(action, info, fullViewModelSchema, reports, viewModelSchema) {
		var utilsConfig = getContainerConfig('utils');
		var buttonsConfig = [];
		var buttonConfig = { className: 'Terrasoft.Button' };

		if (!fullViewModelSchema.isReadOnly) {
			var firstButtonConfig = getEditButtonConfig(action);
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
		buttonsConfig.push(Ext.apply({}, delayExecutionButton));
		var secondButton = Ext.apply({}, {
			className: 'Terrasoft.Button',
			style: Terrasoft.controls.ButtonEnums.style.DEFAULT,
			caption: resources.localizableStrings.CancelButtonCaption,
			click: {
				bindTo: 'cancel'
			}
		}, buttonConfig);
		buttonsConfig.push(secondButton);

		var thirdButton = {
			className: 'Terrasoft.Button',
			caption: resources.localizableStrings.ActionButtonCaption,
			menu: {items: []}
		};
		buttonsConfig.push(Ext.apply({}, thirdButton));

		getMoveToConfig(info, action, buttonsConfig);

		actionUtilities.addActionsButton(buttonsConfig, fullViewModelSchema.actions);
		reports = actionUtilities.getReports(reports);
		actionUtilities.addActionsButton(buttonsConfig, reports);
		var customActions = [
			{
				caption: '',
				className: 'Terrasoft.MenuSeparator',
				visible: { bindTo: 'getSchemaAdministratedByRecords' }
			},
			{
				caption: resources.localizableStrings.RightsButtonCaption,
				click: { bindTo: 'editRights' },
				visible: { bindTo: 'getSchemaAdministratedByRecords' }
			}
		];
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
				click: { bindTo: 'openPageDesigner' }
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
			thirdButton.visible = {bindTo: 'getActionsButtonVisible'};
			viewModelSchema.visibilityBindings = visibilityBindings;
		}
		buttonsConfig.push({
			className: 'Terrasoft.Button',
			visible: false,
			style: Terrasoft.controls.ButtonEnums.style.DEFAULT,
			caption: resources.localizableStrings.GotoButtonCaption,
			menu: {items: []}
		});

		var utilsSetting = fullViewModelSchema.schema.utilsConfig;
		var leftUtilsClass = utilsSetting && utilsSetting.leftUtilsClass ? utilsSetting.leftUtilsClass : 'utils-left';
		var utilsLeftConfig = getContainerConfig(leftUtilsClass);
		utilsLeftConfig.items = fullViewModelSchema.schema.customLeftUtils && utilsSetting.useLeftUtils ?
			fullViewModelSchema.schema.customLeftUtils : buttonsConfig;
		if (fullViewModelSchema.methods.modifyLeftUtilsConfig) {
			utilsLeftConfig = fullViewModelSchema.methods.modifyLeftUtilsConfig(utilsLeftConfig);
		}
		var rightUtilsClass = utilsSetting && utilsSetting.rightUtilsClass ?
			utilsSetting.rightUtilsClass : 'utils-right';
		var utilsRightConfig = getContainerConfig(rightUtilsClass);
		utilsRightConfig.items = fullViewModelSchema.schema.customRightUtils && utilsSetting &&
			utilsSetting.useRightUtils ?
			fullViewModelSchema.schema.customRightUtils :
			[{
				className: 'Terrasoft.Button',
				style: Terrasoft.controls.ButtonEnums.style.DEFAULT,
				visible: false,
				caption: resources.localizableStrings.ViewButtonCaption,
				menu: {
					items: [
						{
							caption: "SingleMenuItem"
						}
					]
				}
			},
				createLeftArrowButtonConfig(),
				createRightArrowButtonConfig()
			];
		utilsConfig.items.push(utilsLeftConfig);
		utilsConfig.items.push(utilsRightConfig);
		if (fullViewModelSchema.entityInfo && fullViewModelSchema.entityInfo.pageConfig &&
			fullViewModelSchema.entityInfo.pageConfig.topUtils === false) {
			utilsConfig.visible = false;
		}
		var entityInfo = fullViewModelSchema.entityInfo;
		if (entityInfo) {
			if (entityInfo.hideUtils) {
				utilsConfig.visible = false;
			}
		}
		return utilsConfig;
	}

	function getBottomUtilsConfig(action, info, fullViewModelSchema, reports, viewModelSchema) {
		var utilsConfig = getContainerConfig('bottomUtils');
		if (fullViewModelSchema.schema.bottomUtilsConfig) {
			utilsConfig.items = fullViewModelSchema.schema.bottomUtilsConfig;
		}
		return utilsConfig;
	}
	function getInfoButton(schemaItem, wrapperClass) {
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
	}
	function pushConfigToContainer(mainContainer, columnsObject, basePanelConfig, itemsContainer) {
		var config = Terrasoft.deepClone(basePanelConfig);
		if (!columnsObject) {
			return;
		}
		var containerConfig = itemsContainer;
		if (!itemsContainer.hasOwnProperty('className')) {
			containerConfig = getContainerConfig(itemsContainer.id, itemsContainer.wrapClass);
			if (itemsContainer.hasOwnProperty('items')) {
				containerConfig.items = itemsContainer.items;
			}
		}
		var itemConfig = {
			container: containerConfig,
			columnsObject: columnsObject
		};
		Ext.apply(config, itemConfig);
		generateView(config);
		mainContainer.items.push(containerConfig);
	}
	return {
		generateView: generateCustomView,
		generateLabelConfig: getCustomLabelConfig,
		generateControlConfig: getCustomControlConfig,
		generate: function(viewModelSchema, action, info, profile, reports) {
			init();
			var fullViewModelSchema = getFullViewModelSchema(viewModelSchema);
			entitySchema = fullViewModelSchema.entitySchema;
			var viewConfig = getContainerConfig('autoGeneratedContainer');
			var headerConfig = getHeaderConfig(fullViewModelSchema);
			var topUtilsConfig = getTopUtilsConfig(action, info, fullViewModelSchema, reports, viewModelSchema);

			viewConfig.items = [
				headerConfig,
				getContainerConfig('process-reminder'),
				topUtilsConfig,
				getContainerConfig('delay-execution'),
				getContainerConfig('usertask-recommendation')
			];
			if (action === ConfigurationEnums.CardState.View && fullViewModelSchema.getItemViewHeader) {
				var viewItemConfig = fullViewModelSchema.getItemViewHeader();
				var viewHeaderConfig = getContainerConfig('item-information-container');
				viewHeaderConfig.items = [getContainerConfig('item-image'), getContainerConfig('item-info')];
				//viewHeaderConfig.items[0].items = [getImgConfig()];
				var headerColumns = viewItemConfig.columns;
				Terrasoft.each(headerColumns, function(column) {
					if (column.dataValueType === Terrasoft.DataValueType.IMAGE) {
						viewHeaderConfig.items[0].items.push(getImgConfig(column));
					} else {
						viewHeaderConfig.items[1].items.push(
							getControlConfig(column, fullViewModelSchema.bindings, action));
					}
				});
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
			pushConfigToContainer(viewConfig, fullViewModelSchema.schema.customPanel, basePanelConfig, {
				id: 'autoGeneratedCustomContainer',
				wrapClass: fullViewModelSchema.schema.customPanelWrapClass
			});
			pushConfigToContainer(viewConfig, fullViewModelSchema.schema.leftPanel, basePanelConfig, {
				id: 'autoGeneratedLeftContainer',
				wrapClass: fullViewModelSchema.schema.leftPanelWrapClass
			});
			pushConfigToContainer(viewConfig, fullViewModelSchema.schema.rightPanel, basePanelConfig, {
				id: 'autoGeneratedRightContainer',
				wrapClass: fullViewModelSchema.schema.rightPanelWrapClass,
				items: [getContainerConfig('processExecutionContextContainer')]
			});
			var bottomUtilsConfig = getBottomUtilsConfig(action, info, fullViewModelSchema, reports, viewModelSchema);
			pushConfigToContainer(viewConfig, fullViewModelSchema.schema.bottomUtilsConfig,
				basePanelConfig, bottomUtilsConfig);
			pushConfigToContainer(viewConfig, fullViewModelSchema.schema.customBottomPanel, basePanelConfig, {
				id: 'autoGeneratedCustomBottomContainer',
				wrapClass: fullViewModelSchema.schema.customBottomPanelWrapClass
			});

			return viewConfig;
		}
	};
});