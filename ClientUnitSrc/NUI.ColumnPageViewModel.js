define('ColumnPageViewModel', ['ext-base', 'terrasoft', 'sandbox', 'ColumnPageViewModelResources', 'LookupUtilities',
	'ColumnHelper'], function(Ext, Terrasoft, sandbox, resources, LookupUtilities, ColumnHelper) {
		var ajaxProvider;
		var columnConfig;
		var entitySchema;
		var entityColumn;

		function generate(parentSandbox, stateColumnConfig) {
			sandbox = parentSandbox;
			columnConfig = stateColumnConfig;
			var viewModelConfig = {
				entitySchema: columnConfig.entitySchema,
				columns: {
					Title: {
						type: Terrasoft.ViewModelColumnType.ATTRIBUTE,
						dataValueType: Terrasoft.DataValueType.TEXT,
						isRequired: true
					},
					Name: {
						type: Terrasoft.ViewModelColumnType.ATTRIBUTE,
						dataValueType: Terrasoft.DataValueType.TEXT,
						isRequired: true
					},
					EnumList: {
						isCollection: true,
						name: 'EnumList',
						type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
					},
					StringType: {
						dataValueType: Terrasoft.DataValueType.ENUM,
						isLookup: true
					},
					IsMultiline: {
						dataValueType: Terrasoft.DataValueType.BOOLEAN
					},
					IsRequired: {
						dataValueType: Terrasoft.DataValueType.BOOLEAN
					},
					FloatType: {
						dataValueType: Terrasoft.DataValueType.ENUM,
						isLookup: true
					},
					DateType: {
						dataValueType: Terrasoft.DataValueType.ENUM,
						isLookup: true
					},
					Lookup: {
						dataValueType: Terrasoft.DataValueType.LOOKUP,
						isLookup: true,
						referenceSchema: {
							name: 'VwSysEntitySchemaInWorkspace',
							primaryColumnName: 'Id',
							primaryDisplayColumnName: 'Name'
						},
						referenceSchemaName: 'VwSysEntitySchemaInWorkspace'
					},
					LookupList: {
						isCollection: true,
						name: 'EnumList',
						type: Terrasoft.ViewModelColumnType.VIRTUAL_COLUMN
					},
					LookupCaption: {
						dataValueType: Terrasoft.DataValueType.TEXT
					},
					LookupName: {
						dataValueType: Terrasoft.DataValueType.TEXT
					},
					IsEnum: {
						dataValueType: Terrasoft.DataValueType.BOOLEAN
					}
				},
				values: {
					EnumCollection: new Terrasoft.Collection(),
					EnumList: new Terrasoft.Collection(),
					LookupList: new Terrasoft.Collection(),
					Title: null,
					Name: null,
					LookupName: null,
					LookupCaption: null,
					StringType: null,
					IsMultiline: null,
					IsRequired: null,
					FloatType: null,
					DateType: null,
					Lookup: null,
					IsEnum: null,
					lookupToken: 'Exist'
				},
				methods: {
					init: init,
					getHeader: getHeader,
					onAcceptClick: onAcceptClick,
					onCancelClick: onCancelClick,
					loadEnumItems: loadEnumItems,
					loadVocabulary: loadVocabulary,
					isEnabled: isEnabled,
					isNewLookupEnabled: isNewLookupEnabled,
					isExistLookupEnabled: isExistLookupEnabled
				}
			};
			return viewModelConfig;
		}

		function getIsLookup(dataValueType) {
			return (dataValueType === Terrasoft.DataValueType.LOOKUP || dataValueType === Terrasoft.DataValueType.ENUM);
		}

		function getIsEnum(dataValueType) {
			return (dataValueType === Terrasoft.DataValueType.ENUM);
		}

		function generateEntityColumnByDataValueType(dataValueType) {
			return {
				isNew: true,
				uId: Terrasoft.generateGUID(),
				name: '',
				caption: '',
				dataValueType: dataValueType,
				isLookup: getIsLookup(dataValueType),
				lookupType: 'Exist',
				isRequired: false
			};
		}

		function lookupNameChecked() {
			var result = {
				invalidMessage: '',
				isValid: true
			};
			if (!entityColumn.isLookup) {
				return result;
			}
			var columnName = this.get('LookupName');
			if (!(/^[a-zA-Z0-9]+$/.test(columnName)) || (Ext.isString(columnName) && columnName.length > 0 &&
				!(/^[a-zA-Z]+$/.test(columnName.substr(0, 1))))) {
				result.invalidMessage = resources.localizableStrings.SymbolMessage;
				result.isValid = false;
				return result;
			}
			return result;
		}

		function duplicateChecked() {
			var result = {
				invalidMessage: '',
				isValid: true
			};

			var columnName = Terrasoft.deepClone(this.get('Name'));

			var prefix = Terrasoft.SysSettings.cachedSettings.SchemaNamePrefix;
			if (entityColumn.isNew && !Ext.isEmpty(prefix)) {
				columnName = prefix + columnName;
			}

			if (!(/^[a-zA-Z0-9]+$/.test(columnName)) || (Ext.isString(columnName) && columnName.length > 0 &&
				!(/^[a-zA-Z]+$/.test(columnName.substr(0, 1))))) {
				result.invalidMessage = resources.localizableStrings.SymbolMessage;
				result.isValid = false;
				return result;
			}

			var uId = entityColumn.uId;
			var isExists = false;
			Terrasoft.each(columnConfig.changeColumns, function(item) {
				if (item.name === columnName && item.uId !== uId) {
					isExists = true;
				}
			});
			if (entityColumn.isNew) {
				if (entitySchema.getColumnByName(columnName) || isExists) {
					result.invalidMessage = resources.localizableStrings.DuplicateMessage;
					result.isValid = false;
					return result;
				}
			}

			return result;
		}

		function init(onInit) {
			ajaxProvider = Terrasoft.AjaxProvider;
			entitySchema = columnConfig.entitySchema;
			var type = columnConfig.type;
			if (type) {
				entityColumn = generateEntityColumnByDataValueType(type.dataValueType);
			}
			var itemConfig = columnConfig.config;
			if (itemConfig) {
				var columnName = itemConfig.columnPath;
				var baseColumn = entitySchema.getColumnByName(columnName);
				if (baseColumn && baseColumn.isLookup) {
					baseColumn.lookupType = 'Exist';
				}
				var changeColumn = getChangedColumnByName.call(this, columnName);
				entityColumn = generateEntityColumnByDataValueType(itemConfig.dataValueType);
				if (!Ext.isEmpty(baseColumn)) {
					entityColumn = Terrasoft.deepClone(baseColumn);
				}
				if (!Ext.isEmpty(changeColumn)) {
					entityColumn = Terrasoft.deepClone(changeColumn);
				}
				type = columnConfig.type = ColumnHelper.GetTypeByDataValueType(entityColumn.dataValueType);
			}
			entityColumn.baseDataType = entityColumn.baseDataType || type.baseDataType;

			var baseGetLookupQuery = this.getLookupQuery;
			this.getLookupQuery = function(filterValue, columnName) {
				var esq = baseGetLookupQuery.apply(this, arguments);
				esq.addColumn('Name');
				esq.filters.add(getLookupFilters());
				return esq;
			};

			this.validationConfig.Name = [duplicateChecked];
			this.validationConfig.LookupName = [lookupNameChecked];

			if (!entityColumn.isNew) {
				loadColumnInfo.call(this, onInit);
			} else {
				load.call(this, onInit);
			}

		}

		function load(onInit) {
			if (entityColumn.isLookup) {
				this.set('lookupToken', entityColumn.lookupType || 'Exist');
				var scope = this;
				onLookupTypeChange.call(scope, false);
				this.on('change:lookupToken', function() {
					onLookupTypeChange.call(scope, true);
				});
			}
			var enumName = columnConfig.type.enumName;
			var methodName;
			var referenceSchemaName = entityColumn.referenceSchemaName;
			var dataSend;
			var lookupToken = this.get('lookupToken');
			if (!Ext.isEmpty(referenceSchemaName) && lookupToken === 'Exist') {
				methodName = 'GetReferenceInfo';
				dataSend = {
					name: referenceSchemaName
				};
			} else if (!Ext.isEmpty(enumName)) {
				methodName = 'GetTypeList';
				dataSend = {
					name: enumName
				};
			} else {
				setValues.call(this);
				onInit.call(this);
			}

			if (!Ext.isEmpty(dataSend)) {
				callServiceMethod.call(this, methodName, function(responce) {
					var result = responce[methodName + 'Result'];
					if (methodName === 'GetReferenceInfo') {
						onLoadReferenceInfo(result);
					} else {
						onLoadEnums.call(this, result);
					}
					setValues.call(this);
					onInit.call(this);
				}, dataSend);
			}
		}

		function loadColumnInfo(onInit) {
			callServiceMethod.call(this, 'GetColumnInfo', function(responce) {
				var result = responce.GetColumnInfoResult;
				onLoadColumnInfo(result);
				load.call(this, onInit);
			}, {
				entitySchemaId: entitySchema.uId,
				columnId: entityColumn.uId
			});
		}

		function getChangedColumnByName(name) {
			var column = null;
			var changeColumns = columnConfig.changeColumns;
			Terrasoft.each(changeColumns, function(item) {
				if (item.name === name) {
					column = item;
				}
			});
			return column;
		}

		function onLookupTypeChange(isLabelRender) {
			if (!Ext.isBoolean(isLabelRender)) {
				isLabelRender = true;
			}
			var token = this.get('lookupToken');
			var columnLookup = this.columns.Lookup;
			var columnLookupName = this.columns.LookupName;
			var columnLookupCaption = this.columns.LookupCaption;

			columnLookup.isRequired = (token === 'Exist');
			columnLookupName.isRequired = columnLookupCaption.isRequired = !columnLookup.isRequired;
			if (isLabelRender) {
				var lookupLabel = Ext.get('LookupControlLabel');
				var lookupNameLabel = Ext.get('LookupNameControlLabel');
				var lookupCaptionLabel = Ext.get('LookupCaptionControlLabel');
				if (lookupLabel && lookupNameLabel && lookupCaptionLabel) {
					if (token === 'Exist') {
						lookupLabel.addCls('required-caption');
						lookupNameLabel.removeCls('required-caption');
						lookupCaptionLabel.removeCls('required-caption');
					} else {
						lookupLabel.removeCls('required-caption');
						lookupNameLabel.addCls('required-caption');
						lookupCaptionLabel.addCls('required-caption');
					}
				}
			}
		}

		function setValues() {
			var itemConfig = columnConfig.config;
			if (itemConfig) {
				entityColumn.dataValueType = itemConfig.dataValueType;
				if ((itemConfig.customConfig && Ext.isString(itemConfig.customConfig.className) &&
					itemConfig.customConfig.className.indexOf('MemoEdit')) || entityColumn.isMultiline) {
					this.set('IsMultiline', true);
				}
				if (!Ext.isEmpty(itemConfig.isRequired)) {
					entityColumn.isRequired = itemConfig.isRequired;
				}
				if (!Ext.isEmpty(itemConfig.caption)) {
					entityColumn.caption = itemConfig.caption;
				}
				if (!Ext.isEmpty(itemConfig.name)) {
					entityColumn.name = itemConfig.name;
				}
			}
			var referenceSchema = entityColumn.referenceSchema;
			if (entityColumn.isLookup) {
				if (entityColumn.lookupType === 'Exist' && referenceSchema) {
					this.set('Lookup', {
						value: referenceSchema.uId,
						displayValue: referenceSchema.caption,
						Name: referenceSchema.name
					});
				}
				if (entityColumn.lookupType === 'New') {
					this.set('LookupName', entityColumn.referenceSchemaName);
					this.set('LookupCaption', entityColumn.referenceSchemaCaption);
				}
			}
			if (!Ext.isEmpty(entityColumn.caption)) {
				this.set('Title', entityColumn.caption);
			}
			if (!Ext.isEmpty(entityColumn.name)) {
				var clearName = '' + entityColumn.name;
				var prefix = Terrasoft.SysSettings.cachedSettings.SchemaNamePrefix;
				if (entityColumn.isNew && !Ext.isEmpty(prefix) && (clearName.indexOf(prefix) === 0)) {
					var strCount = clearName.length;
					clearName = clearName.substr(prefix.length, strCount);
				}
				this.set('Name', clearName);
			}
			this.set('IsRequired', entityColumn.isRequired || false);
			this.set('IsEnum', getIsEnum(entityColumn.dataValueType));
		}

		function onLoadEnums(collection) {
			var enumCollection = this.get('EnumCollection');
			var type = columnConfig.type;
			var valueName = type.valueName;
			var baseDataType = entityColumn.baseDataType;
			Terrasoft.each(collection, function(item) {
				var itemValue = item.value;
				enumCollection.add(itemValue, item);
				if (valueName && baseDataType === itemValue) {
					this.set(valueName, item);
				}
			}, this);
		}

		function onLoadColumnInfo(info) {
			entityColumn.baseDataType = info.DataValueTypeName;
		}

		function onLoadReferenceInfo(referenceSchema) {
			var name = referenceSchema.Name;
			var reference = entityColumn.referenceSchema || {};
			Ext.apply(reference, {
				name: name,
				uId: referenceSchema.Uid,
				caption: referenceSchema.Caption,
				primaryColumnName: referenceSchema.PrimaryColumnName,
				primaryDisplayColumnName: referenceSchema.PrimaryDisplayColumnName
			});
			entityColumn.referenceSchema = reference;
			entityColumn.referenceSchemaName = name;

		}

		function getHeader() {
			return Ext.String.format(resources.localizableStrings.HeaderCaptionMask, columnConfig.type.caption);
		}

		function isEnabled() {
			return entityColumn.isNew || false;
		}

		function isNewLookupEnabled() {
			return (entityColumn.isNew && this.get('lookupToken') === 'New') || false;
		}

		function isExistLookupEnabled() {
			return (entityColumn.isNew && this.get('lookupToken') === 'Exist') || false;
		}

		function onAcceptClick() {
			if (!this.validate()) {
				return;
			}

			if (entityColumn.isNew) {
				generateItemConfig.call(this);
			}

			updateItemConfig.call(this);

			sandbox.publish('PushColumnInfo', {
				entityColumn: entityColumn,
				itemConfig: columnConfig.config
			}, [sandbox.id]);
			onCancelClick.call(this);
		}

		function onCancelClick() {
			sandbox.publish('BackHistoryState');
		}

		function loadVocabulary(args, columnName) {
			var column = this.getColumnByName(columnName);
			var config = {
				entitySchemaName: column.referenceSchemaName,
				multiSelect: false,
				columns: ['Name'],
				hideActions: true,
				filters: getLookupFilters.call(this),
				columnName: columnName,
				searchValue: args.searchValue
			};
			var handler = function(args) {
				var items = args.selectedRows.getItems() || [];
				if (items.length > 0) {
					this.set(args.columnName, items[0]);
				}
			};
			LookupUtilities.Open(sandbox, config, handler, this, this.renderTo);
		}

		function getLookupFilters() {
			var filterCollection = Terrasoft.createFilterGroup();
			filterCollection.add("SysWorkspace", Terrasoft.createColumnFilterWithParameter(
				Terrasoft.ComparisonType.EQUAL, 'SysWorkspace', Terrasoft.SysValue.CURRENT_WORKSPACE.value));
			return filterCollection;
		}

		function generateItemConfig() {
			var name = this.get('Name');

			var prefix = Terrasoft.SysSettings.cachedSettings.SchemaNamePrefix;
			if (entityColumn.isNew && !Ext.isEmpty(prefix)) {
				name = prefix + name;
			}
			entityColumn.name = name;

			var type = columnConfig.type;
			if (type && type.valueName) {
				entityColumn.baseDataType = this.get(type.valueName).value;
			}
			var itemConfig = {
				type: Terrasoft.core.enums.ViewModelSchemaItem.ATTRIBUTE,
				name: name,
				columnPath: name,
				dataValueType: getDataValueTypeFromBaseDataType(entityColumn.baseDataType) ||
					entityColumn.dataValueType,
				visible: true
			};
			if (entityColumn.isLookup) {
				if (this.get('IsEnum')) {
					itemConfig.dataValueType = entityColumn.dataValueType = Terrasoft.DataValueType.ENUM;
				}
				var token = entityColumn.lookupType = this.get('lookupToken');
				if (token === 'Exist') {
					var lookup = this.get('Lookup');
					var reference = entityColumn.referenceSchema || {};
					Ext.apply(reference, {
						uId: lookup.value,
						name: lookup.Name,
						caption: lookup.displayValue
					});
					entityColumn.referenceSchema = reference;
					entityColumn.referenceSchemaName = lookup.Name;
					entityColumn.referenceSchemaCaption = '';
				} else {
					entityColumn.referenceSchema = {};
					entityColumn.referenceSchemaName = this.get('LookupName');
					entityColumn.referenceSchemaCaption = this.get('LookupCaption');
				}
			}
			entityColumn.baseDataTypeGroup = columnConfig.type.enumName;

			var baseItemConfig = columnConfig.config || {};
			Ext.apply(baseItemConfig, itemConfig);
			columnConfig.config = baseItemConfig;
		}

		function getDataValueTypeFromBaseDataType(baseDataType) {
			switch (baseDataType) {
				case 'DateTime':
					return Terrasoft.DataValueType.DATE_TIME;
				case 'Date':
					return Terrasoft.DataValueType.DATE;
				case 'Time':
					return Terrasoft.DataValueType.TIME;
			}
			return null;
		}

		function updateItemConfig() {
			var itemConfig = columnConfig.config;
			itemConfig.caption = entityColumn.caption = this.get('Title');
			var isRequired = this.get('IsRequired');
			itemConfig.isRequired = entityColumn.isRequired = isRequired || false;

			if (entityColumn.isLookup) {
				itemConfig.dataValueType = entityColumn.dataValueType = this.get('IsEnum') ?
					Terrasoft.DataValueType.ENUM : Terrasoft.DataValueType.LOOKUP;
			}
			if (this.get('IsMultiline')) {
				entityColumn.isMultiline = true;
				itemConfig.customConfig = {
					className: 'Terrasoft.controls.MemoEdit',
					height: '100px'
				};
			} else {
				entityColumn.isMultiline = false;
				itemConfig.customConfig = undefined;

			}
		}

		function loadEnumItems(filter, list) {
			list.clear();
			var collection = new Terrasoft.Collection();
			var enumCollection = this.get('EnumCollection');
			Terrasoft.each(enumCollection.getItems(), function(item) {
				var displayValue = item.displayValue;
				var value = item.value;
				if (displayValue.indexOf(filter) === 0) {
					collection.add(value, item);
				}
			}, this);
			list.loadAll(collection);
		}

		function callServiceMethod(methodName, callback, dataSend) {
			var data = dataSend || {};
			var requestUrl = Terrasoft.workspaceBaseUrl + '/rest/ColumnService/' + methodName;
			var request = ajaxProvider.request({
				url: requestUrl,
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				method: 'POST',
				jsonData: data,
				callback: function(request, success, response) {
					var responseObject = {};
					if (success) {
						responseObject = Terrasoft.decode(response.responseText);
					}
					callback.call(this, responseObject);
				},
				scope: this
			});
			return request;
		}

		return {
			generate: generate
		};
	});