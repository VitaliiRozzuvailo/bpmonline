define('ViewUtilities', ['ext-base', 'terrasoft', 'ViewUtilitiesResources', 'ConfigurationEnums'],
	function(Ext, Terrasoft, resources, ConfigurationEnums){
	var elementContainerSuffix = '-ValueConatiner';
	var elementListSuffix = 'List';

	var mainContainers = ['leftContainer', 'rightContainer'];
	var controlBindingProperties = ['visible', 'enabled', 'isRequired'];
	var labelBindingProperties = ['visible'];
	var containerBindingProperties = ['visible'];
	var buttonBindingProperties = ['visible', 'enabled', 'style'];
	var labelBindingClasses = {
		default: ['controlCaption '],
		isRequired: {
			true: ['required-caption']
		}
	};
		/*
	 item config structure:
	 {
	 name: '' - used for generating controlsIds, need to be unique
	 columnPath: '' - name property or column in viewModel
	 caption: '' - control caption
	 referenceSchemaName: ''
	 dataValueType: Terrasoft.DataValueType - used for select what control to generate
	 customContainerConfig: {} - config for update container config
	 customControlConfig: {} - config for update container config
	 customLabelConfig: {} - config for update container config
	 }
	 */
	/*
	main view config structure
	header: {
	headerCaption: '' - header caption property
	},
	utils: {
	leftButtons: [] - configsForLestButtons
	}
	mainContainers: []	- names of main containers
	*/

	function isLookup(itemConfig) {
		var dataValueType = itemConfig.dataValueType;
		return dataValueType === Terrasoft.DataValueType.LOOKUP ||
			dataValueType === Terrasoft.DataValueType.ENUM;
	}
	function isBoolean(itemConfig) {
		var dataValueType = itemConfig.dataValueType;
		return dataValueType === Terrasoft.DataValueType.BOOLEAN;
	}
    function getIsMemoEdit(itemConfig) {
        var dataValueType = itemConfig.dataValueType;
        var isMultiLine = itemConfig.isMultiLine;
        return dataValueType === Terrasoft.DataValueType.TEXT && isMultiLine;
    }
	function getLookupListName(columnName) {
		return columnName + elementListSuffix;
	}
	function getControlViewModelApplyConfig(config) {
        var columnPath = config.columnPath;
        var applyConfig = {
            values: {},
            methods: {},
            columns: {}
        };
        if (config.items) {
            var propertyName = getControlGroupName(config) + 'collapsed';
            applyConfig.values[propertyName] = Ext.isEmpty(config.collapsed) ? false : config.collapsed;
            return applyConfig;
        }
        if (!Ext.isEmpty(config.value)) {
            applyConfig.values[columnPath] = config.value;
        }
        applyConfig.columns = getViewModelColumns(config);
        if (isLookup(config)) {
            applyConfig.values[getLookupListName(columnPath)] = new Terrasoft.Collection();
        }
        return applyConfig;
	}
	function getButton(config) {
		var buttonConfig = {
			className: 'Terrasoft.Button',
			caption: config.caption || '',
			tag: config.name,
			style: Terrasoft.controls.ButtonEnums.style.DEFAULT
		};
		if (!Ext.isEmpty(config.methodName)) {
			buttonConfig.click = {
				bindTo: config.methodName
			};
		}
		pushBindingProperties(buttonConfig, config, buttonBindingProperties);
		Ext.apply(buttonConfig, config.customButtonConfig);
		return buttonConfig;
	}
	function pushBindingProperties(component, config, properties) {
		Terrasoft.each(properties, function(property) {
			if (!Ext.isEmpty(config[property])) {
				component[property] = config[property];
			}
		});
	}
	function getControl(config) {
		var columnPath = config.columnPath;
		var dataValueType = config.dataValueType;
		if (dataValueType === Terrasoft.DataValueType.DATE_TIME) {
			var controlConfig = generateDataTimeControlConfig(config);
			return controlConfig;
		}
		var controlConfig = getIsMemoEdit(config)
            ? getMemoEditConfig() : Terrasoft.getControlConfigByDataValueType(dataValueType);
		if (isBoolean(config)) {
			controlConfig.checked = {
				bindTo: columnPath
			};
		} else {
			controlConfig.value = {
				bindTo: columnPath
			};
		}
        if (isLookup(config)) {
			controlConfig.list = {
				bindTo: getLookupListName(columnPath)
			};
			if (config.dataValueType === Terrasoft.DataValueType.LOOKUP) {
				controlConfig.tag = columnPath;
				controlConfig.loadVocabulary = {
					bindTo: 'loadVocabulary'
				};
			}
		}
		pushBindingProperties(controlConfig, config, controlBindingProperties);
		Ext.apply(controlConfig, config.customControlConfig);
		return controlConfig;
	}
	function pushLabelClasses(component, config) {
		var labelClasses = [];
		for(var classBindName in labelBindingClasses) {
			if (classBindName === 'default') {
				Terrasoft.each(labelBindingClasses[classBindName], function(labelClass) {
					labelClasses.push(labelClass);
				});
				continue;
			}
			var bindValue = config[classBindName];
			if (!Ext.isEmpty(bindValue)
				&& !Ext.isEmpty(labelBindingClasses[classBindName][bindValue])) {
				Terrasoft.each(labelBindingClasses[classBindName][bindValue], function(labelClass) {
					labelClasses.push(labelClass);
				});
				continue;
			}
		}
		component.classes = {
			labelClass: labelClasses
		};
	}
	function getLabel(config) {
		var labelConfig = {
			className: "Terrasoft.Label",
			caption: config.caption || ''
		};
		pushBindingProperties(labelConfig, config, labelBindingProperties);
		pushLabelClasses(labelConfig, config);
		Ext.apply(labelConfig, config.customLabelConfig);
		return labelConfig;
	}
    function getCommentaryLabel(config) {
        var labelConfig = {
            className: "Terrasoft.Label",
            caption: config.text || '',
            labelClass: 'commentary'
        };
        Ext.apply(labelConfig, config.customLabelConfig);
        return labelConfig;
    }
	function getHeaderConfig(headerConfig) {
		var mainContainer = getContainerConfig('header', 'header');
		var headerNameContainer = getContainerConfig('header-name-container', 'header-name-container');
		var commandLineContainer = getContainerConfig('card-command-line-container', 'card-command-line');
		var contextHelpContainer = getContainerConfig('card-context-help-container', 'card-context-help');
		if (Ext.isEmpty(headerConfig)) {
			headerConfig = {};
		}
		headerNameContainer.items = [{
			className: "Terrasoft.Label",
			id: 'header-name',
			caption: headerConfig.headerCaption || {
				bindTo: 'header'
			}
		}];
		mainContainer.items = [
			headerNameContainer,
			commandLineContainer,
			contextHelpContainer
		];
		return mainContainer;
	}
	function getUtilsConfig(utilsConfig) {
		if (Ext.isEmpty(utilsConfig)) {
			utilsConfig = []
		}
		var utilsContainer = getContainerConfig('utils');
		var utilsLeftContainer = getContainerConfig('utils-left');
		Terrasoft.each(utilsConfig, function(button) {
			utilsLeftContainer.items.push(getButton(button));
		});
		return utilsLeftContainer;
	}
	function pushItemsToContainerConfig(container, items) {
		Terrasoft.each(itemsConfig, function(item) {
			var itemConfig = getItemConfig(item);
			itemsContainer.items.push(itemConfig);
		});

	}
	function getMainViewConfig(config) {
		var headerConfig = config.header;
		var utilsConfig = config.utils;
		var mainContainersNames = config.mainContainers || mainContainers;
		var headerControlConfig = getHeaderConfig(headerConfig);
		var utilsControlConfig = getUtilsConfig(utilsConfig);
		var mainContainer = getContainerConfig('CardMainContainer');
		var result  = {
			mainContainer: mainContainer
		};
		mainContainer.items = [
			headerControlConfig,
			utilsControlConfig
		];
		Terrasoft.each(mainContainersNames, function(containerName) {
			var itemContainer = getContainerConfig(containerName);
			mainContainer.items.push(itemContainer);
			result[containerName] = itemContainer;
		});
		return result;
	}
	function generateDataTimeControlConfig(config) {
		var containerConfig = getContainerConfig('DateTimeContainer' + config.name,
			['datetimeeditcontainer-class', 'controlBaseedit']);
		var dateControl = {
			className: 'Terrasoft.DateEdit',
			classes: {
				wrapClass: ['dimension-class', 'datetime-datecontrol']
			},
			id: 'date-edit-' + config.name,
			selectors: {
				wrapEl: '#date-edit-' + config.name
			},
			value: {
				bindTo: config.columnPath
			}
		};
		var timeControl = {
			className: 'Terrasoft.TimeEdit',
			id: 'time-edit-' + config.name,
			selectors: {
				wrapEl: '#time-edit-' +  config.name
			},
			classes: {
				wrapClass: ['dimension-class', 'datetime-timecontrol']
			},
			value: {
				bindTo: config.columnPath
			}
		};
		containerConfig.items = [dateControl, timeControl];
		pushBindingProperties(dateControl, config, controlBindingProperties);
		pushBindingProperties(timeControl, config, controlBindingProperties);
		Ext.apply(dateControl, config.customDateControlConfig);
		Ext.apply(timeControl, config.customTimeControlConfig);
		return containerConfig;
	}
	function getControlViewConfig(config) {
		var elementContainerId = config.name + elementContainerSuffix;
		var containerConfig = getContainerConfig(elementContainerId);
		var containerConfigItems = containerConfig.items;
		pushBindingProperties(containerConfig, config, containerBindingProperties);
		Ext.apply(containerConfig, config.customContainerConfig);
        if (config.text) {
            var commentaryConfig = getCommentaryLabel(config);
            containerConfigItems.push(commentaryConfig);
            return containerConfig;
        }
		var labelConfig = getLabel(config);
		var controlConfig = getControl(config);
		if (config.dataValueType === Terrasoft.DataValueType.BOOLEAN) {
			containerConfigItems.push(generateCheckBoxContainer(labelConfig, controlConfig, config.name));
		} else {
			containerConfigItems.push(labelConfig, controlConfig);
		}

		return containerConfig;
	}

	function generateCheckBoxContainer(labelConfig, controlConfig, name) {
		controlConfig.id = name + '-checkbox';
		labelConfig.inputId = controlConfig.id + '-el';
		var container = getContainerConfig(name + 'container', ['check-box-container']);//custom-view-container
		container.visible = !Ext.isEmpty(labelConfig.visible) ? labelConfig.visible : true;
		labelConfig.labelClass = 't-label custom-label-container check-box-label-container';
		controlConfig.classes = {wrapClass: ['custom-control-container']};
		container.items.push(controlConfig, labelConfig);
		return container;
	}

    function generateRadioButtonContainer(labelConfig, controlConfig, name) {
        controlConfig.id = name + '-radiobutton';
        labelConfig.inputId = controlConfig.id + '-el';
        var container = getContainerConfig(name + 'container', ['custom-view-container']);
        labelConfig.labelClass = 't-label custom-label-container check-box-label-container';
        controlConfig.classes = {wrapClass: ['custom-control-container']};
        container.items.push(controlConfig, labelConfig);
        return container;
    }

    function getRadioButtonGroupName(name) {
        return name + '-radioGroup';
    }

    function getMemoEditConfig(){
        var memoEditConfig = {
            className: 'Terrasoft.MemoEdit',
            height: '77px'
        }
        return memoEditConfig;
    }

	function getPageConfig(schemaConfig) {
		var config = Terrasoft.deepClone(schemaConfig);
		config.mainContainers = [];
		for (var containerName in config.schema) {
			config.mainContainers.push(containerName);
		}
		var mainConfig = getMainViewConfig(config);
		for (var containerName in config.schema) {
			var itemsContainer = mainConfig[containerName]
			var itemsConfig = config.schema[containerName];
			getContainerItemsConfig(itemsContainer, itemsConfig);
		}
		return mainConfig.mainContainer;
	}

	function getContainerItemsConfig(container, items) {
		Terrasoft.each(items, function(item) {
			var itemConfig = getItemConfig(item);
			if (item.type == Terrasoft.ViewModelSchemaItem.GROUP && Ext.isArray(item.items)) {
				getContainerItemsConfig(itemConfig, item.items);
			}
			container.items.push(itemConfig);
		});
	}

	function getItemConfig(config) {
		switch (config.type) {
			case ConfigurationEnums.CustomViewModelSchemaItem.BUTTON:
				return getButton(config);
			case Terrasoft.ViewModelSchemaItem.ATTRIBUTE:
				return getControlViewConfig(config);
			case Terrasoft.ViewModelSchemaItem.GROUP:
				return getGroupConfig(config);
			default:
				throw new Terrasoft.UnsupportedTypeException({
					message: resources.localizableStrings.UnsupportedItemType
				});
		}

	}
	function generateViewModelColumn(schemaItem) {
		return {
			type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
			dataValueType: schemaItem.dataValueType,
			caption: schemaItem.caption,
			name: schemaItem.name,
			columnPath: schemaItem.columnPath,
			IsRequired: schemaItem.IsRequired
		};
	}
	function getViewModelColumns(config) {
		var columns = {};
		var column = generateViewModelColumn(config);
		if (!Ext.isEmpty(config.isRequired)) {
			column.isRequired = config.isRequired
		}
		columns[column.name] = column;
		if (isLookup(config)) {
			column.isLookup = true;
			column.referenceSchemaName = config.referenceSchemaName;
			var lookupListColumnConfig = {
				type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN,
				name: getLookupListName(config.name),
				isCollection: true
			};
			columns[lookupListColumnConfig.name] = lookupListColumnConfig;
		}
		return columns;
	}
	function getContainerConfig(id, wrapClassName) {
		var container = {
			className: 'Terrasoft.Container',
			items: [],
			id: id,
			selectors: {
				wrapEl: '#' + id
			}
		};
		if (!Ext.isEmpty(wrapClassName)) {
			container.classes = {
				wrapClassName: wrapClassName
			};
		}
		return container;
    }
    function getControlGroupName(config){
        return config.name + '-control-group';
    }
    function getGroupConfig(config) {
        var wrapContainerClasses = ['control-group-container'];
        if (config.wrapContainerClass) {
            wrapContainerClasses.push(config.wrapContainerClass);
        }
        var groupName = getControlGroupName(config);
        var container = {
            id: Ext.isEmpty(config.id) ? groupName : config.id,
            className: 'Terrasoft.ControlGroup',
            caption: config.caption,
            markerValue: config.caption,
            collapsed: {
                bindTo: groupName + 'collapsed'
            },
            visible: Ext.isEmpty(config.visible) ? true : config.visible,
            classes: { wrapContainerClass: wrapContainerClasses },
            tag: config.name,
            items: []
        };
        var customConfig = Terrasoft.deepClone(config.customConfig || {});
        Ext.apply(container, customConfig);
        return container;
    }
	return {
		getContainerConfig: getContainerConfig,
		getGroupConfig: getGroupConfig,
		getControlViewConfig: getControlViewConfig,
		getControlViewModelApplyConfig: getControlViewModelApplyConfig,
		getMainViewConfig: getMainViewConfig,
		getPageConfig: getPageConfig
	}
});